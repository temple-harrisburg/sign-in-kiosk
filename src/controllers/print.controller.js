import { Controller } from "@kiosk-app/mvc";

export class PrintController {
	/**
	 * Handle a request to print a label
	 * @param {import('express').Request} request 
	 * @param {import('express').Response} response 
	*/
	static async post(request, response) {
		const { logger, printer } = global.context;
		const { body } = request;

		logger.debug("Printer POST received data")
		logger.debug(JSON.stringify(body));
		await printer.print(body)
			.then(({ error, output, status }) => {
				if (error) throw error;
				const data = output
					.filter(x => !!x)
					.map(buffer => buffer.toString('utf8'))
					.join('');
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
				const message = errorMessage(err.code||err);
				logger.error(`Failed to print`);
				logger.debug(message);
				response.status(500);
				response.json({ status: "ERROR", error: message, data: undefined });
			});

	}
}
