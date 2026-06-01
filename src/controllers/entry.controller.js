import { Controller } from "@kiosk-app/mvc";
import { Entry } from "../models/entry.model.js";

export class EntryController extends Controller {
    /**
     * @todo
     * @param {import("express").Request} request 
     * @param {import("express").Response} response 
     */
    static async get(request, response) {
        const { logger } = global.context;
        const { id } = request.params;
        const { limit, offset, orderBy, direction } = request.query;
        try {
            const data = id ? await Entry.getById(parseInt(id)) : await Entry.getAll(limit, offset, orderBy, direction);
            response.status(200);
            response.json({ status: "OK", data, error: undefined });
        } catch (err) {
            logger.debug(`An error occurred: ${err}`);
            response.status(500);
            response.json({ status: "ERROR", data: undefined, error: err.message });
        }
    }

    /**
     * 
     * @param {import("express").Request} request 
     * @param {import("express").Response} response 
     */
    static async post(request, response) {
        const { logger } = global.context;
        const { body } = request;

        logger.debug(`Entry POST received data`);
        logger.debug(JSON.stringify(body));

        Entry.create(body)
            .then(entry => entry.commit())
            .then(result => {
                logger.info(`Logged an entry: ${body.firstName} ${body.lastName}`)
                response.status(200);
                response.json({ status: "OK", data: result, error: undefined });
            })
            .catch(err => {
                logger.error(`An error occurred`);
                logger.error(err.message);
                response.status(500);
                response.json({ status: "ERROR", error: err, data: undefined });
            })

    }

    static async patch(request, response) {
        const { logger } = global.context;
        const { body, params } = request;

        logger.debug('Entry PATCH received data');
        logger.debug(JSON.stringify(body));

        if (!params.id) {
            response.status(404);
            response.json({ status: "ERROR", data: "No entry ID provided" });
            return;
        }

        Entry.getById(params.id)
            .then(entry => entry.update(body).commit())
            .then(result => {
                response.status(200);
                response.json({ status: "OK", data: result });
            })
            .catch(err => {
                logger.error(`An error ocurred: ${err}`);
                response.status(500);
                response.json({ status: "ERROR", data: err });
            });
    }
}
