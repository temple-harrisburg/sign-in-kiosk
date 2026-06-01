import { DatabaseSync } from "node:sqlite";
import Model, { ColumnDef } from "./model.js";

export default class Database {
    /**
     * Instance of SQLite database
     * @type {DatabaseSync}
     * @see {@link [Node.js - SQLite](https://nodejs.org/api/sqlite.html) }
     */
    sqlite;

    /**
     * Record of models and their associated names
     */
    #tables = {};

    /**
     * Event listeners registered by the `on` public method;
     * @type {{[event:string]:()=>void}}
     */
    #eventListeners = {};

    /**
     * 
     * @param {string|":memory:"} connectionUri Path to SQlite database or ":memory:" for in-memory database.
    */
    constructor(connectionUri = ":memory:") {
        this.sqlite = new DatabaseSync(connectionUri);
    }

    /**
     * @private
     * @param {Model} model
     * @param {string|undefined} [tableName=undefined]
     * @returns {{ tableName: string, table: string }}
     */
    prepareTableStatement(model, tableName = undefined) {
        tableName ??= this.tableName(model);
        const lines = [`CREATE TABLE IF NOT EXISTS ${tableName} (`,]
        let columns = [];
        for (const [prop, columnDef] of Object.entries(model.fields)) {
            const { type, unique, primaryKey, autoIncrement } = columnDef;
            let col = `${prop} ${type}`;
            if (unique) col += ` UNIQUE`;
            if (primaryKey) col += ` PRIMARY KEY`;
            if (autoIncrement) col += ` AUTOINCREMENT`;
            columns.push(col.trim())
        }

        lines.push(columns.join(','))
        lines.push(')');
        const table = lines.join('\n');
        return { tableName, table }
    }

    /**
     * Register a callback for the specified DB event
     * @public
     * @param {"register"|"commit"|"update"|"delete"} event 
     * @param {(...args)=>void} cb 
     */
    on(event, cb) {
        this.#eventListeners[event] = cb;
    }

    /**
     * Get the table name of a given Model
     * @param {Object} model 
     * @returns {string}
     */
    tableName(model) {
        return this.#tables[model] ??= model.name.toLowerCase();
    }

    /**
     * Create a table in the Database representing a model
     * @public
     * @param {Model} model Model to create a table for
     * @param {string|undefined} [tableName=undefined] Name for table, otherwise defaults to lowercase name of Model
     * @returns {import("node:sqlite").StatementResultingChanges}
     */
    registerModel(model, tableName = undefined) {
        const { tableName: name, table } = this.prepareTableStatement(model, tableName);
        this.#tables[model.name] ??= tableName;

        // Run statement
        const result = this.sqlite.prepare(table).run();

        /**
         * @todo Confirm that table was created
         */


        (this.#eventListeners["register"] || undefined)({ model, tableName: name, result });
    }
}