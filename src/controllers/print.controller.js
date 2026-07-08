import { Controller } from "@kiosk-app/mvc";

/**
 * Handler for printer commands
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */
export class PrintController {
	/**
	 * Return the print queue
	 * @param {Request} request
	 * @param {Reponse} response
	 */
	static async get(request, response) {
		const { logger, printer } = global.context;
		logger.debug("Getting print queue");
		try {

			const data = await printer.getQueue();
			logger.debug(data);
			response.status(200);
			response.json({ status: "OK", data, error: undefined });
		} catch (err) {
			logger.error("An error occurred");
			logger.error(err.message);
			response.status(500);
			response.json({ status: "ERROR", data: undefined, error: err.message });
		}

	}

	/**
	 * Handle a request to print a label
	 * @param {Request} request 
	 * @param {Response} response 
	*/
	static async post(request, response) {
		const { logger, printer } = global.context;

		const { label } = request.body;
		// logger.debug(label);

		const buffer = Uint8Array.fromBase64(label)

		await printer.print(buffer)
			.then(({ error, output, status }) => {
				if (error) throw error;
				const data = output
					.filter(x => !!x)
					.map(buffer => buffer.toString('utf8'))
					.join('');
				logger.debug(data);
				if (status !== 0) throw data;
				response.status(200);
				response.json({ status: "OK", data, error: undefined });
			})
			.catch(err => {
				/**
				 * Convert a known error code to a friendly message
				 * @param {string} code Linux kernel code returned by subprocess or an other error message
				 * @returns {string} A custom error message or the unmodified input
				 */
				const errorMessage = (code) => {
					switch (code) {
						case "ENOENT":
							return "Couldn't find print program. Is `lp` installed?"
							break;
						case "EACCES":
							return "Not permitted to run `lp`. Check permissions.";
							break;
						default:
							return code;
							break;
					}
				}
				const message = errorMessage(err.code || err);
				logger.error(`Failed to print`);
				logger.debug(message);
				response.status(500);
				response.json({ status: "ERROR", error: message, data: undefined });
			});
	}
}
