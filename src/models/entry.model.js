import { Model, ColumnDef } from "@kiosk-app/mvc";

/**
 * Properties of an Entry object
 * @interface
 */
class EntryOpts {
    /**
     * Database ID
     * @type {number}
     */
    // id;

    /**
     * Date and time of entry
     * @type {Date}
     */
    entryDateTime;

    /**
     * First name of visitor
     * @type {string}
     */
    firstName;

    /**
     * Last name of visitor
     * @type {string}
     */
    lastName;

    /**
     * Reason for visit
     * @type {string}
     */
    reason;

    /**
     * Method used to enter data (e.g. via form or barcode scanner)
     * @type {string}
     */
    method;

    /**
     * Whether or not printing the label was successful. 1 for TRUE, 0 for FALSE.
     * @type {number|undefined}
     */
    labelPrinted;
}

/**
 * Record of visit
 */
export class Entry extends Model {
    /**
     * Field names and options for creating the Sqlite table
     * @type {Record<string, ColumnDef>}
     */
    static fields = {
        id: { type: "INTEGER", primaryKey: true, unique: true, autoIncrement: true },
        entryDateTime: { type: "TEXT", default: "CURRENT_TIMESTAMP" },
        firstName: { type: "TEXT" },
        lastName: { type: "TEXT" },
        reason: { type: "TEXT" },
        method: { type: "TEXT" },
        labelPrinted: { type: "INTEGER", default: 0 },
    }


    /**
     * @param {EntryOpts} entry 
     */
    constructor(entry) {
        super();
        const { id, entryDateTime, firstName, lastName, reason, method, labelPrinted } = entry;
        this.id = id;
        this.entryDateTime = entryDateTime;
        this.firstName = firstName;
        this.lastName = lastName;
        this.reason = reason;
        this.method = method;
        this.labelPrinted = labelPrinted;
    }


    static async getById(id) {
        const { logger, db } = global.context;
        const tableName = db.tableName(Entry);
        const stmt = db.sqlite.prepare(`SELECT * FROM ${tableName} WHERE id = ?`);
        const result = stmt.get(id,);
        logger.debug(JSON.stringify(result));
        return new Entry(result);
    }

    /**
     * 
     * @param {string|number} limit Maximum number of entries to return (default 500)
     * @param {string|number} offset Number of entries to skip (default 0)
     * @param {string} orderBy Column to sort by
     * @param {"ASC"|"DESC"} direction Order to sort results
     * @returns {Entry[]}
     * @throws {SyntaxError}
     */
    static async getAll(limit = 500, offset = 0, orderBy = "entryDateTime", direction = "ASC") {
        if (!["ASC", "DESC"].includes(direction)) throw new SyntaxError("direction must be \"ASC\" or \"DESC\"");
        const { logger, db } = global.context;
        const tableName = db.tableName(Entry);
        const stmt = db.sqlite.prepare(`SELECT * FROM ${tableName} 
            ORDER BY ${orderBy} ${direction}
            LIMIT ? OFFSET ?`);
        const result = stmt.all(limit, offset,);
        return result.map(data => new Entry(data));
    }

    static async create(entry) {
        return new Entry(entry);
    }

    /**
     * Update values of this entry
     * @param {EntryOpts} entry Partial object with keys and values to update on this entry
     * @returns {Entry} Updated entry
     */
    update(entry) {
        return Object.assign(this, entry);
    }


    /**
     * @returns {import("node:sqlite").StatementResultingChanges}
     */
    async commit() {
        const { logger, db } = global.context;
        const tableName = db.tableName(Entry);
        let { id, entryDateTime, firstName, lastName, reason, method, labelPrinted } = this;
        logger.debug(`Label printed?: ${labelPrinted}`);
        // labelPrinted ??= 0 // Set labelPrinted to 0 if null or false;
        let result;
        if (id) {
            logger.debug('Updating existing entry');
            const stmt = db.sqlite.prepare(`INSERT INTO ${tableName} (id, entryDateTime, firstName, lastName, reason, method, labelPrinted) 
                VALUES (?, ?, ?, ?, ?, ?, ?) 
                ON CONFLICT (id)
                DO UPDATE SET labelPrinted=excluded.labelPrinted
            `);
            result = stmt.run(id, entryDateTime, firstName, lastName, reason, method, labelPrinted);
        } else {
            logger.debug('Creating new entry');
            const stmt = db.sqlite.prepare(`INSERT INTO ${tableName} (entryDateTime, firstName, lastName, reason, method, labelPrinted) 
                VALUES (?, ?, ?, ?, ?, ?) 
            `);
            result = stmt.run(entryDateTime, firstName, lastName, reason, method, labelPrinted);
        }
        return result;
    }
}
