class ContextOpts {
    /**
     * @type {import("@kiosk-app/mvc").Database}
     */
    db;

    /**
     * @type {import("@kiosk-app/logger").Logger}
     */
    logger;

    /**
     * @type {import("../packages/printer").Printer}
     */
    printer;
}

/**
 * @global
 * @type {ContextOpts}
 */
global.context = {};


export default {
    update(key, value) {
        global.context[key] = value;
    },
    /**
     * Set the static instances of services that need to run for the duration of the program.
     * @param {ContextOpts} ctx
     */
    initalize(ctx) {
        global.context = ctx;
    }
}
