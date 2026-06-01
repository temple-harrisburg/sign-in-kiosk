
import process from "node:process";
import fs from "node:fs";
import Template from "./template.js";

/**
 * @enum {number} LogLevel
 */
export const LogLevel = {
    ERROR: 1,
    WARN: 2,
    INFO: 4,
    DEBUG: 8,
}

export const LogLevelString = Object.fromEntries(Object.entries(LogLevel).map(x => x.reverse()));

/**
 * @interface OutputOptions Options for a logging an output stream
 */
class OutputOptions {
    /**
     * @type {fs.WriteStream} Output destination
     */
    outputStream;

    /**
     * @type {string} Template to use when logging
     */
    template;

    /**
     * 
     * @type {LogLevel} Severity of logs to emit. Errors are always logged.
     */
    logLevel;

    /**
     * @type {Boolean} Whether or not to apply colors to the output.
     */
    color;
}


class Output extends OutputOptions {
    /**
     * 
     * @param {OutputOptions} options 
     */
    constructor(options) {
        super();
        const { logLevel, template, outputStream, color } = options;
        this.template = new Template(template);
        this.logLevel = logLevel
        this.outputStream = outputStream;
        this.color = color;
    }

    /**
     * Apply ANSI-format coloration based on the provided log level
     * @param {string} message 
     * @param {LogLevel} logLevel
     * @returns {string} 
     */
    static _style(message, logLevel) {
        const styles = {
            "ERROR": "31",
            "INFO": "0",
            "DEBUG": "0",
            "WARN": "33"
        }

        const level = LogLevelString[logLevel];
        return `\x1b[${styles[level]}m${message}\x1b[0m`
    }

    /**
     * Write a message to the output stream.
     * @private
     * @param {string} message 
     * @param {LogLevel} logLevel 
     */
    _log(message, logLevel) {
        let msg = this.template.execute({ message, logLevel: LogLevelString[logLevel] });
        this.color && (msg = Output._style(msg, logLevel));
        if (this.logLevel & logLevel) this.outputStream.write(msg + "\n")
    }

    /**
     * @todo Implement log rotation to avoid flooding the hard drive
     */
    rotate() { }
}

/**
 * @type {{[outputPath:string]: Omit<OutputOptions, "output">}}
 */
const _DEFAULT_LOGGER_OPTIONS = {
    "stdout": {
        template: "$YYYY-$MM-$DD $H:$M:$S [$logLevel] $message",
        logLevel: LogLevel.ERROR,
    }
}

/**
 * Write logs to one or more file descriptors, including stdout.
 * @example const outputs = {"stdout":{ logLevel: LogLevel.DEBUG }}
 * const logger = new Logger(outputs);
 * logger.info('Hello World!');
 * // 'Hello World'
 */
export class Logger {
    /**
     * @type {Output[]} Array of loggers to write to
     */
    outputs = [];

    /**
     * 
     * @param {{[outputPath:string]: Omit<OutputOptions, "output">}} options
     */
    constructor(outputs = _DEFAULT_LOGGER_OPTIONS) {
        for (const [path, opts] of Object.entries(outputs)) {
            let { template, logLevel, color } = opts;

            // Provide a default template
            template ??= "$message";

            // Retrieve file descriptor of log target
            const fd = path === "stdout" ? 1 : fs.openSync(path, "a+");

            // Always disable color output for logs written to files
            fd !== 1 && (color = false);

            // `path` is ignored since `fd` is defined: https://nodejs.org/api/fs.html#fscreatewritestreampath-options
            const outputStream = fs.createWriteStream(path, { fd, flags: "a+", autoClose: true });

            const output = new Output({
                logLevel,
                template,
                outputStream,
                color
            })
            this.outputs.push(output);
        }
    }

    /**
     * @private
     * @param {string} message 
     * @param {LogLevel} logLevel 
     */
    _log(message, logLevel) {
        if (typeof message === 'object') {
            message = JSON.stringify(message);
        }

        for (let i = 0; i < this.outputs.length; i++) {
            const output = this.outputs[i];
            output._log(message, logLevel);
        }
    }

    /**
     * @public
     * @param {string} message 
     */
    warn(message) {
        this._log(message, LogLevel.WARN)
    }

    /**
     * @public
     * @param {string} message 
     */
    info(message) {
        this._log(message, LogLevel.INFO);
    }

    /**
     * @public
     * @param {string} message 
     */
    error(message) {
        this._log(message, LogLevel.ERROR);
    }

    /**
     * @public
     * @param {string} message
     */
    debug(message) {
        this._log(message, LogLevel.DEBUG);
    }
}