import { NotImplementedError } from "./errors.js";

/**
 * Abstract base class for handling requests for a model
 * @abstract
 */
export default class Controller {
    /**
     * Handle to invoke in response to an HTTP GET request
     * @abstract
     * @static
     * @param {import("express").Request} request 
     * @param {import("express").Response} response 
     */
    static get(request, response) {
        throw new NotImplementedError();
    }

    /**
     * Handle to invoke in response to an HTTP POST request
     * @abstract
     * @static
     * @param {import("express").Request} request 
     * @param {import("express").Response} response 
     */
    static post(request, response) {
        throw new NotImplementedError();
    }

    /**
     * Handle to invoke in response to an HTTP PATCH request
     * @abstract
     * @static
     * @param {import("express").Request} request
     * @param {import("express").Response} response
     */
    static patch(request, response) {
	throw new NotImplementedError();
    }
}
