import { Node } from './node.js';


const DEFAULT_SERIALIZATION_OPTIONS = {
    pretty: false,
    depth: 0,
    spaces: true,
    indents: 4,
}

export class XMLNode extends Node {

    /**
     * @type {string}
     */
    textContent = "";

    /**
     * @type {Record<string, string>}
     */
    parameters = {};

    constructor(tag, parameters = {}) {
        super(tag);
        this.parameters = parameters;
    }

    get tag() {
        return this.value;
    }

    set tag(value) {
        this.value = value;
    }

    setParameter(key, value) {
        this.parameters[key] = value;
    }

    /**
     * 
     * @param {{pretty: boolean, indents: number, spaces: boolean, depth: number }} options 
     * @returns {string}
     */
    serialize(options = { pretty: false, indents: 4, spaces: true, depth: 0 }) {
        const mergedOptions = { ...DEFAULT_SERIALIZATION_OPTIONS, ...options };
        const { pretty, indents, spaces, depth } = mergedOptions;
        const indent = pretty ? `\n${" ".repeat(indents * depth)}` : "";


        let openTag = `<${this.tag}${Object.entries(this.parameters).map(([key, value]) => ` ${key}="${value}"`).join(" ")}>`;
        let closeTag = `</${this.tag}>`;
        let childNodes = this.children.map(child => child.serialize({ ...mergedOptions, depth: depth + 1 })).join("");
        let result = `${openTag}${this.textContent}${childNodes}${closeTag}`

        return result;
    }
}