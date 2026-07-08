import { Controller } from "@kiosk-app/mvc";
import { Entry } from "../models/entry.model.js";
import { XMLNode } from "@kiosk-app/xml";

/**
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 */
export class RSSController extends Controller {
    /**
     * @param {Request} request
     * @param {Response} response
     */
    static async get(request, response) {
        const { logger } = global.context;
        const { limit, offset, orderBy, direction } = request.query;
        try {

            const entries = await Entry.getAll(500, 0, "entryDateTime", "DESC");

            const feed = new XMLNode("feed");
            feed.setParameter("xmlns", "http://www.w3.org/2005/Atom");

            const title = new XMLNode("title");
            title.textContent = "TUH Visitor Entries";

            const id = new XMLNode("id");
            id.textContent = "http://localhost:8080";

            const updated = new XMLNode("updated");
            updated.textContent = entries.at(0).entryDateTime;

            feed.appendChild(title);
            feed.appendChild(id);
            feed.appendChild(updated);

            for (let i = 0; i < entries.length; i++) {
                const entryRecord = entries[i];
                const entry = new XMLNode("entry");

                const title = new XMLNode("title");
                title.textContent = `${entryRecord.firstName} ${entryRecord.lastName}`;

                const updated = new XMLNode("updated");
                updated.textContent = entryRecord.entryDateTime;

                const published = new XMLNode("published");
                published.textContent = entryRecord.entryDateTime;


                // Create content
                const content = new XMLNode("content");

                // const document = new HTMLDocument();
                let table = `<table>`;
                table += `<thead><tr><th>Property</th><th>Value</th></tr></thead>`;
                table += `<tbody>`;
                table += `<tr><td>Method</td><td>${entryRecord.method}</td></tr>`;
                table += `<tr><td>Reason</td><td>${entryRecord.reason}</td></tr>`;
                table += `<tr><td>Label Printed</td><td>${entryRecord.labelPrinted === 1 ? true : false}</td></tr>`;
                table += `</tbody>`;
                table += `</table>`;

                // Escape HTML entitites within entry content
                const repl = { '&': '&amp', '<': '&lt;', '>': '&gt;', };
                content.textContent = table.replace(/[&<>]/g, (token) => repl[token] || token)

                entry.appendChild(title);
                entry.appendChild(content);
                entry.appendChild(updated);

                feed.appendChild(entry);
            }

            response.status(200)
                .type('application/xml')
                .send(`<?xml version="1.0" encoding="utf-8"?>\n${feed.serialize({ pretty: true })}`);

        } catch (err) {
            logger.debug(`An error ocurred: ${err}`);
            response.status(500);
            response.json({ status: "ERROR", data: undefined, error: err.message });
        }
    }
}