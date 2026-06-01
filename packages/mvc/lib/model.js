import { NotImplementedError } from "./errors.js";

export class ColumnDef {
    /**
     * Type of this field
     * @type {"TEXT"|"INTEGER"|"BIGINT"}
     */
    type

    /**
     * Whether or not this field is the primary key
     * @see {@link [SQLite Docs - PRIMARY KEY](https://www.sqlite.org/lang_createtable.html#the_primary_key)}
     * @type {boolean, undefined}
     */
    primaryKey = false;

    /**
     * Whether or not this field must be unique
     * @type {boolean}
     */
    unique

    /**
     * Whether or not this field will autoincrement
     * @type {boolean}
     */
    autoIncrement

    /**
     * The default value for this field
     * @see {@link [SQLite Docs - DEFAULT Clause](https://www.sqlite.org/lang_createtable.html#the_default_clause)}
     * @type {string}
     */
    default
}

/**
 * Base class for models
 */
export default class Model extends Object {
    /**
     * Fields defined on this model. Used to generate tables in the database. Key is the column name, value is ColumnDef.
     * @public
     * @type {Record<string, ColumnDef>}
     */
    static fields = { 'id': { type: "INTEGER", unique: true, primaryKey: true, autoIncrement: true } }

    /**
     * @type {string} Unique ID of this model instance
     */
    id

    /**
     * @abstract
     * @param {Object} options 
     * @returns {Model} Return an instance of this model
     */
    static create(options) {
        throw new NotImplementedError();
    }

    /**
     * Retrieve a instance of this model from the database
     * @abstract
     * @param {number} id ID of model in the database
     */
    static async getById(id) {
        throw new NotImplementedError();
    }

    /**
     * Update this instance of the model
     * @abstract
     */
    update() {
        throw new NotImplementedError();
    }

    /**
     * Delete this instance of the model
     * @abstract
     */
    delete() {
        throw new NotImplementedError();
    }

    /**
     * Commit changes made to this model to database
     * @abstract
     */
    async commit() {
        throw new NotImplementedError();
    }

    /**
     * Serialize this instance of the model to JSON
     * @abstract
     */
    serialize() {
        throw new NotImplementedError();
    }
}
