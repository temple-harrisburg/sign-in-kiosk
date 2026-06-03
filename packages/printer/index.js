import child_process, { ChildProcess } from "node:child_process";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

class PrinterOpts {
    /**
     * Path to the SVG file to use as template for Printer label
     * @type {import("node:fs").PathLike}
     */
    template

    /**
     * Location for temporary files created when printing
     * @type {string|undefined}
     */
    tmpDir

	/**
	 * ID of the printer to use
	 * @type {string|undefined}
	 */
	printerName
}

export default class Printer {
    /**
     * 
     * @param {PrinterOpts} options 
     */
    constructor(options) {
        let { template, tmpDir, printerName } = options;
        tmpDir ??= os.tmpdir();
        this.tmpDir = fs.mkdtempSync(path.join(tmpDir, "labels-"), "utf8");
        this.template = fs.readFileSync(template).toString('utf8');
	    this.printerName = printerName;
    }

	 async getQueue(){
		const args = ["-o"]
		const { output, status } = child_process.spawnSync("lpstat", args);
		const data = output.filter(x=>!!x).map(x=>x.toString('utf8')).join('');
		if (status !== 0) throw data;
		const rows = data.split(/\n/g);
		const entries = rows.map(row=>row.split(/[ ]{2,}/g).flatMap((row,i)=>i==0?row.split(" "):row));
		 
		const result = entries.map(entry=>{
			try {
			const [printer, queueNumber] = /^([\w-]+)-(\d+)$/.exec(entry[0]).slice(1,3);
			return { 
				printer,
				queueNumber,
				user: entry[1],
				size: entry[2],
				since: entry[3],
			};
			} catch {
				return null
			}
		});
		return result.filter(x=>!!x);
	}

    /**
     * @private
     * @param {Record<string, string>} values 
     * @returns {string} Template with strings wrapped in '%' replaced with the value from the `values`
     * @example ```js
     * this.template = '%foo% %bar%';
     * const result = this.prepareTemplate({foo: 1, bar: 'baz'});
     * console.log(result);
     * // '1 baz'
     */
    prepareTemplate(values) {
        /**
         * 
         * @param {string} match 
         * @returns {string}
         */
        const replaceFn = (match) => {
            const key = match.substring(1, match.length - 1);
            return values[key] ?? "";
        }
        return this.template.replace(/\%(\w+)\%/g, replaceFn);
    }

    /**
     * @async
     * @typedef {import("node:child_process").SpawnSyncReturns} SpawnSyncReturns
     * @param {Record<string, string>} entry 
     * @param {import('sharp').SharpOptions} [sharpOptions={ density: 200 }] 
     * @returns {Promise<SpawnSyncReturns<NonSharedBuffer>>}
     */
    async print(entry, sharpOptions = { density: 200 }) {
        const ts = Date.now();
        const fileName = path.join(this.tmpDir, `label-${ts}.png`);
        const template = this.prepareTemplate(entry);

        const label = await new sharp(Buffer.from(template, 'utf8'), sharpOptions)
            .png()
            .toFile(fileName)

        const args = ["-o", "landscape", "-o", "media=Custom.2.5125x3.875in", fileName];
        return child_process.spawnSync("lp", args);
    }
}
