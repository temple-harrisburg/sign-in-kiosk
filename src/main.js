import os from "node:os";
import process from "node:process";
import { execSync, spawnSync } from "node:child_process";
import { parseArgs } from "node:util";
import { Logger, LogLevel } from "@kiosk-app/logger";
import { Database } from "@kiosk-app/mvc";
import Printer from "@kiosk-app/printer";
import { kebabToCamel, snakeToCamel } from "@kiosk-app/utils";
import context from "./context.js";
import { Config } from "./models/config.model.js";
import { Entry } from "./models/entry.model.js";
import { ConfigController } from "./controllers/config.controller.js";
import { EntryController } from "./controllers/entry.controller.js";
import { PrintController } from "./controllers/print.controller.js";
import express from "express";

// CLI Options
const options = {
    /**
     * The port the server will run on
     */
    "port": { type: "string", default: "8080" },

    /**
     * The env file from which to pull default configuration
     */
    "env-file": { type: "string", default: ".env" },

    /**
     * The prefix indicating an environment variable should be loaded into the app config, e.g. CONFIG_PASSWORD="p@ssword!" is saved as {key:'password', value:"p@ssword!"}
     */
    "config-prefix": { type: "string", default: "CONFIG_" },

    /**
     * The directory where the front-end static files (html,css,js) are located.
     */
    "static-dir": { type: "string", default: "./src/static" },

    /**
     * The path to the Sqlite database. Defaults to in-memory
     */
    "db-uri": { type: "string", default: ":memory:" },

    /**
     * Path to the SVG label template 
     */
    "print-template": { type: "string", default: "./template.svg" },

    /**
     * Path to temporary directory for intermediate files generated during printing
     */
    "print-tmpdir": { type: "string", default: os.tmpdir() },

    /**
     * Whether or not to enable verbose logging
     */
    "verbose": { type: "boolean", default: false },

    /**
     * File to write logs to. Leave empty to log only to sdout.
     */
    "log-file": { type: "string" },

    /**
     * Enable or disable colors for the stdout log stream
     */
    "log-colors": { type: "boolean", default: true }
}

// Process commandline args
const args = process.argv.slice(2);
const { values, positionals } = parseArgs({ args, options, });

// LOGGING
const template = "$YYYY-$MM-$DD $H:$M:$S [$logLevel] $message";

// - Set log level
let logLevel = LogLevel.INFO | LogLevel.ERROR;
if (values.verbose) {
    logLevel |= LogLevel.DEBUG | LogLevel.WARN;
}

// - Set log output file
const outputs = { "stdout": { template, logLevel, color: values["log-colors"] } };
if (values["log-file"]) {
    const path = values["log-file"];
    outputs[path] = { template, logLevel, color: false, };
}

const logger = new Logger(outputs);


// DATABASE
const db = new Database(values["db-uri"]);
db.on('register', (args) => {
    const { model, tableName } = args;
    logger.debug(args);
    logger.info(`Created table ${tableName} for model ${model.name}`);
});
db.registerModel(Entry);
db.registerModel(Config);


// PRINTING

// Check that `lp` exists on the host
const lpCheckResult = spawnSync("bash", ["-c", "if ! command -v lp; then exit 1; fi"]);
if (lpCheckResult.error || lpCheckResult.status !== 0) {
    logger.error(`\`lp\` is not installed on host. Printing will not work.`);
} else {
    logger.debug(JSON.stringify(lpCheckResult, null, 2))
    const { output } = lpCheckResult;
    logger.info('`lp` detected on host')
    logger.debug(output);
}

// Initalize global context
context.update("db", db);
context.update("logger", logger);

// - get current config
const envFile = values["env-file"];
try {
    process.loadEnvFile(envFile);
    logger.info(`Loaded configuration from '${envFile}'`);
} catch (err) {
    logger.warn(`Failed to load config from '${envFile}': ${err}`);
}

// Load config into database, if not already set
let mergedConfig = {};
const prefix = values["config-prefix"];
for (let [key, value] of Object.entries(process.env)) {
    if (key.startsWith(prefix)) {
        key = key.slice(prefix.length);
        key = snakeToCamel(key);
        await Config.getByKey(key)
            .then(res => res.json())
            .then(({ status, data, error }) => {
                if (error) throw new Error(error);
                mergedConfig[data.key] = data.value;
            })
            .catch(error => {
                Config.create({ key, value, previousValue: value })
                    .then(config => config.commit())
                    .then(() => { mergedConfig[key] = value; });
            })
    }
}

// CLI Template overrides DB and .env config
values["print-template"] && (mergedConfig["labelTemplatePath"] = values["print-template"]);

// Create printer instance
const printer = new Printer({ template: mergedConfig["labelTemplatePath"], tmpDir: values['print-tmpdir'] });
context.update("printer", printer);

// SERVER
const app = express();
app.use(express.static(values["static-dir"]));
app.use(express.json());

const api = express.Router()

// - routes
api.route('/config')
    .get(ConfigController.get)
    .post(ConfigController.post);

api.route('/config/:key')
    .get(ConfigController.get)
    .patch(ConfigController.patch);

api.route('/entry')
    .get(EntryController.get)
    .post(EntryController.post);

api.route('/entry/:id')
    .get(EntryController.get)
    .patch(EntryController.patch);

api.post('/print', PrintController.post);

api.post('/auth', (request, response) => {
    const { body } = request;
    if (body.password === mergedConfig["password"]) {
        response.status(200);
        response.json({ status: "OK", data: "Authorized", error: undefined });
    } else {
        response.status(401);
        response.json({ status: "ERROR", data: undefined, error: "Unauthorized" });
    }
})

app.use('/api', api);

// Start server
app.listen(values.port, () => {
    logger.info(`Server listening on http://localhost:${values.port}`);
})
