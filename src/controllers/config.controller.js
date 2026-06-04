import { Controller } from "@kiosk-app/mvc";
import { Config } from "../models/config.model.js";
import { response } from "express";


/**
 * @typedef {Record<string, string>} ConfigUpdate
 * @typedef {{key:string, value:string, previousValue:string}} ConfigOpts
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 * @implements {Controller}
 */
export class ConfigController extends Controller {
    /**
     * 
     * @param {Request} request 
     * @param {Response} reponse 
     */
    static async get(request, response) {
        const { key } = request.params;
        (key ? Config.getByKey(key) : Config.getAll())
            .then(config => {
                response.status(200);
                response.json({ status: "OK", data: config, error: undefined });
            })
            .catch(error => {
                response.status(500);
                response.json({ status: "ERROR", data: undefined, error });
            });
    }

    /**
     * 
     * @param {Request} request 
     * @param {Response} reponse 
     */
    static async post(request, reponse) {
        const { logger, db } = global.context;

        const { body } = request;
        logger.debug("Config POST received data");
        logger.debug(JSON.stringify(body))

        Config.create(body)
            .then(config => config.commit())
            .then(result => {
                logger.debug(`Created new config`)
                logger.debug(JSON.stringify(result));
                response.status(200);
                response.json({ status: "OK", data: result, error: undefined });
            })
            .catch(err => {
                logger.error(`An error occurred`);
                logger.error(err);
                response.status(500);
                response.json({ status: "ERROR", error: err.message, data: undefined })
            })
    }

    /**
     * 
     * @param {Request} request 
     * @param {Response} response 
     */
    static async patch(request, response) {
        const { logger, db } = global.context;
        const { key } = request.params;


        logger.debug("Config PATCH received data");
        logger.debug(JSON.stringify(request.body));

        if (key) {
            /**
             * @type {string} String representing the value to set this key
             */
            const { body } = request;
            Config.getByKey(key)
                .then(config => config.update(body).commit())
                .then(result => {
                    response.status(200);
                    response.json({ status: "OK", data: result, error: undefined });
                })
                .catch(error => {
                    logger.error("An error occured");
                    logger.error(JSON.stringify(error.message));
                    response.status(500);
                    response.json({ status: "ERROR", data: undefined, error });
                })
        } else {
            try {
                /**
                 * @type {Record<string, string>} Record of keys and the values to them them to
                 */
                const { body } = request;
                if (!typeof body === 'object') throw Error('Incorrect PATCH body. Must be JSON object.')
                let results = {};
                Config.updateMany(body)
                    .forEach(async config => {
                        await config.commit().then(result => { results[config.key] = result; });
                    });
                response.status(200);
                response.json({ status: "OK", data: results, error: undefined });
            } catch (error) {
                response.status(400);
                response.json({ status: "ERROR", data: undefined, error: error.message });
            }
        }
    }
}