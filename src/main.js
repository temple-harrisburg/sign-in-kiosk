#!/usr/bin/env node
import os from "node:os";
import process from "node:process";
import { Logger, LogLevel } from "@kiosk-app/logger";
import { Database } from "@kiosk-app/mvc";
import Printer from "@kiosk-app/printer";
import CLI from "@kiosk-app/cli";
import { snakeToCamel } from "@kiosk-app/utils";
import context from "./context.js";
import { Config } from "./models/config.model.js";
import { Entry } from "./models/entry.model.js";
import { ConfigController } from "./controllers/config.controller.js";
import { EntryController } from "./controllers/entry.controller.js";
import { PrintController } from "./controllers/print.controller.js";
import express from "express";

const DEFAULT_LOG_TEMPLATE = "$YYYY-$MM-$DD $H:$M:$S [$logLevel] $message";

// CLI Options
const options = {
    "help": {
        short: "h",
        type: "boolean",
        description: "Print this help message and exit"
    },
    "port": {
        short: "p",
        type: "string",
        default: "8080",
        metaVar: "PORT",
        description: "The port the server will run on"
    },
    "env-file": {
        type: "string",
        default: ".env",
        metaVar: "PATH",
        description: "The env file from which to pull default configuration"
    },
    "config-prefix": {
        type: "string",
        default: "CONFIG_",
        metaVar: "PREFIX",
        description: `The prefix indicating an environment variable should be loaded into the app config, e.g. CONFIG_PASSWORD="p@ssword!" is saved as {key:'password', value:"p@ssword!"}`
    },
    "static-dir": {
        type: "string",
        default: "./src/static",
        metaVar: "PATH",
        description: "The directory where the front-end static files (html,css,js) are located."
    },
    "db-uri": {
        type: "string",
        default: ":memory:",
        metaVar: "URI",
        description: "The path to the SQLite database. Defaults to in-memory"
    },
    // "logo-path": {
    //     type: "string",
    //     default: "/assets/logo.svg",
    //     metaVar: "PATH",
    //     description: "Path (relative to webroot) to logo that will be printed on labels"
    // },
    // "favicon-path": {
    //     type: "string",
    //     default: "/favicon.ico",
    //     metaVar: "PATH",
    //     description: "Path (relative to webroot) to icon that will be displayed as favicon"
    // },
    "print-tmpdir": {
        type: "string",
        default: os.tmpdir(),
        metaVar: "PATH",
        description: "Path to temporary directory for intermediate files generated during printing"
    },
    "log-file": {
        type: "string",
        metaVar: "PATH",
        description: "File to write logs to. Leave empty to log only to sdout."
    },
    "log-template": {
        type: "string",
        metaVar: "TEMPLATE",
        default: DEFAULT_LOG_TEMPLATE,
        description: "Template string for logs. Uses the following variables: $message (log message), $logLevel (log level), $YYYY (4-digit year), $YY (2-digit year), $MM (2-digit month), $DD (2-digit date), $H (2-digit hour), $M (2-digit minute), $S (2-digit second)"
    },
    "log-level": {
        type: "string",
        metaVar: "INFO|WARN|DEBUG",
        default: "INFO",
        description: "Level of detail in logs. Overriden by --verbose. Errors are always logged"
    },
    "verbose": {
        short: "v",
        type: "boolean",
        default: false,
        description: "Enabled verbose logging"
    },
    "no-color": {
        type: "boolean",
        default: true,
        description: "Disable colored output"
    }
}

// Process commandline args
const cli = new CLI({ programDescription: "Start the sign-in-kiosk server", options });
const args = process.argv.slice(2);

const { values } = cli.parse(args);

if (values.help) {
    console.log(cli.usage());
    process.exit(0);
}

// LOGGING


// - Set log level
let logLevel = LogLevel.INFO | LogLevel.ERROR;
switch (values["log-level"]) {
    case "WARN":
        logLevel |= LogLevel.WARN
        break;
    case "DEBUG":
        logLevel |= LogLevel.WARN | LogLevel.DEBUG
        break;
    default:
        break;
}
if (!logLevel) {
    console.log(`Invalid log level: ${values["log-level"]}`);
    process.exit(1);
}
if (values.verbose) logLevel = LogLevel.INFO | LogLevel.ERROR | LogLevel.WARN | LogLevel.DEBUG

// - Set log tempalte
let template = values["log-template"] || DEFAULT_LOG_TEMPLATE;

// - Set log output file
const outputs = { "stdout": { template, logLevel, color: values["log-colors"] } };
if (values["log-file"]) {
    const path = values["log-file"];
    outputs[path] = { template, logLevel, color: false, };
}

const logger = new Logger(outputs);


// DATABASE
values["db-uri"] === ":memory:" && logger.warn("Database is running in-memory. Data will not be saved.")
const db = new Database(values["db-uri"]);
db.on('register', (args) => {
    const { model, tableName } = args;
    logger.debug(args);
    logger.debug(`Created table ${tableName} for model ${model.name}`);
});
db.registerModel(Entry);
db.registerModel(Config);



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
                Config.create({ key, value })
                    .then(config => config.commit())
                    .then(() => { mergedConfig[key] = value; });
            })
    }
}

// PRINTER
// - Create printer instance
const printer = new Printer({ tmpDir: values['print-tmpdir'] });

// - Check for `lp` printing program
const lpExists = printer.check_lp() === 0;
if (lpExists) {
    logger.debug("`lp` detected on system.");
} else {
    logger.warn("Could not detect `lp`. Printing will fail!");
}
context.update("printer", printer);

// SERVER
const app = express();
app.use(express.static(values["static-dir"]));
app.use(express.json());

const api = express.Router()

// - routes
api.route('/config')
    .get(ConfigController.get)
    .post(ConfigController.post)
    .patch(ConfigController.patch);

api.route('/config/:key')
    .get(ConfigController.get)
    .patch(ConfigController.patch);

api.route('/entry')
    .get(EntryController.get)
    .post(EntryController.post);

api.route('/entry/:id')
    .get(EntryController.get)
    .patch(EntryController.patch);

api.route("/print")
    .get(PrintController.get)
    .post(PrintController.post);

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
