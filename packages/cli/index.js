import process from "node:process";
import path from "node:path";
import { parseArgs } from "node:util";

/**
 * @typedef {import("node:util").ParseArgsOptionDescriptor} ParseArgsOptionDescriptor
 * @augments ParseArgsOptionDescriptor
 */
class ArgOpts {

    /**
     * @type {import('node:util').ParseArgsOptionsType}
     */
    type;

    /**
     * @type {string|undefined} (Optional) Short name of argument
     */
    short;

    /**
     * @type {boolean|undefined}
     */
    multiple;

    /**
     * @type {string|boolean|string[]|boolean[]|undefined}
     */
    default;

    /**
     * String that will be displayed as the argument to pass to this option.
     * @type {string|undefined}
     */
    metaVar;

    /**
     * @type {string|undefined} help text for this option
     */
    description;

}

/**
 * @typedef {{[longName:string]:ArgOpts}} Options
 */
export default class CLI {

    /**
     * @type {string}
     */
    programName;

    /**
     * @type {string}
     */
    programDescription;

    /**
     * @type {Options}
     */
    options = {};

    /**
     * 
     * @param {{programName:string|undefined, programDescription:string|undefined options:Options}} opts
     */
    constructor(opts = { options: { "help": { short: "h", type: "boolean" } } }) {
        this.programName = opts.programName || path.relative(process.cwd(), process.argv[1]);
        this.programDescription = opts.programDescription || "";
        this.options = opts.options || {};

    }

    /**
     * 
     * @param {string[]} args
     */
    parse(args) {
        return parseArgs({ args, options: this.options })
    }

    usage() {

        /**
         * Create the option notation (i.e. `-o, --option`) for the given option
         * @param {ArgOpts} opt
         * @returns {string}
         */
        function optionPart(key, opt) {
            let optUsage = ``;

            opt.short && (optUsage += `-${opt.short}, `);
            optUsage += `--${key}`

            const metavar = opt.metaVar || (opt.type === "string" ? "STRING" : undefined);
            metavar && (optUsage += ` [${metavar}]`);

            return optUsage;
        }

        let usage = ``;
        this.programDescription && (usage += `${this.programDescription}\n`);
        usage += `Usage: ${this.programName}`
        if (Object.keys(this.options).length > 1) {
            usage += ` [OPTIONS]`
            usage += '\n';
            usage += `Options:\n`;

            const optionParts = Object.entries(this.options).map(([key, opt]) => [opt, optionPart(key, opt)]);
            const longest = optionParts.map(([_, part]) => part).sort((a, b) => a.length == b.length ? 0 : a.length > b.length ? 1 : -1).at(-1);

            for (let i = 0; i < optionParts.length; i++) {
                const [opt, part] = optionParts[i];
                usage += `\t${part}`;
                for (let j = 0; j < (longest.length - part.length); j++) {
                    usage += ' ';
                }
                usage += `\t${opt.description}\n`;
            }
        }

        return usage;
    }

    /**
     * @param {string} longName
     * @param {ArgOpts} [options={}] 
     */
    addArgument(longName, options = {}) {
        const defaults = { type: "string" }
        const merged = { ...defaults, ...options };
        this.options[longName] = merged;
    }
}