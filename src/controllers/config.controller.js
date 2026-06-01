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

        /**
         * @type {ConfigOpts}
         */
        const { body } = request;

        logger.debug("Config PATCH received data");
        logger.debug(JSON.stringify(body));

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
    }
}