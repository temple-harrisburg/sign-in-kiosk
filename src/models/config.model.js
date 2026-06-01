import { ColumnDef, Database, Model } from "@kiosk-app/mvc";

/**
 * Properties of the Config model
 * @interface
 */
class ConfigOpts {
    /**
     * @type {string}
     */
    key

    /**
     * @type {string}
     */
    value

    /**
     * @type {string}
     */
    previousValue
}

/**
 * Representative of config options for app
 */
export class Config extends Model {
    /**
     * @type {Record<string, ColumnDef>}
     */
    static fields = {
        'key': { type: 'TEXT', primaryKey: true, unique: true },
        'value': { type: 'TEXT' },
        'previousValue': { type: 'TEXT' },
    }

    /**
     * @todo
     * @type {number}
     */
    id

    /**
     * @todo
     * @type {string}
     */
    key;

    /**
     * @todo
     * @type {string}
    */
    value;

    /**
     * @todo
     * @type {string}
    */
    previousValue;

    /**
     * @param {ConfigOpts} config 
    */
    constructor(config) {
        super();
        const { key, value, previousValue } = config;
        this.key = key;
        this.value = value;
        this.previousValue = previousValue;
    }

    /**
     * 
     * @param {string} key Config item to return
     * @returns {Promise<Config>}
     */
    static async getByKey(key) {
        const { db } = global.context;
        const tableName = db.tableName(Config);
        const stmt = db.sqlite.prepare(`SELECT * FROM ${tableName} WHERE key = ?`);
        return new Config(stmt.get(key,));
    }

    /**
     * Get all config options
     * @returns {Promise<Config[]>}
     */
    static async getAll() {
        const { db } = global.context;
        const tableName = db.tableName(Config);
        const stmt = db.sqlite.prepare(`SELECT * FROM ${tableName}`);
        return stmt.all().map(config => new Config(config));
    }


    /**
     * 
     * @param {ConfigOpts} options 
     * @returns {Promise<Config>}
     */
    static async create(options) {
        return new Config(options);
    }

    /**
     * 
     * @param {ConfigOpts} values New value for this Config
     * @returns {Config} Updated config instance
     */
    update(values) {
        return Object.assign(this, values)
    }

    /**
     * @typedef {import("node:sqlite").StatementResultingChanges} StatementResultingchanges
     * @returns {Promise<StatementResultingchanges>}
     */
    async commit() {
        const { db, logger } = global.context;
        const tableName = db.tableName(Config);
        const stmt = db.sqlite.prepare(`INSERT INTO ${tableName} (key, value, previousValue) VALUES (?, ?, ?)
            ON CONFLICT (key)
            DO UPDATE SET previousValue=value, value=excluded.value
            `)
        const result = stmt.run(this.key, this.value, this.previousValue);
        return result;
    }
}