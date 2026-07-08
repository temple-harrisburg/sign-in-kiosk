import crypto from "node:crypto";
import child_process, { ChildProcess } from "node:child_process";
import os from "node:os";
import fs from "node:fs/promises";
import fs_sync from "node:fs";
import path from "node:path";

/**
 * Interface for creating print jobs
 * 
 * @module
 */
export default class Printer {
    /**
     * 
     * @param {{tmpDir:string}} options 
     */
    constructor(options) {
        let { tmpDir } = options;

        tmpDir ??= os.tmpdir();
        fs.mkdtemp(path.join(tmpDir, `labels-`)).then(path => {
            this.tmpDir = path;
        })
    }

    /**
     * @param {".png"|".jpg"|".jpeg"|".txt"} suffix 
     * @returns {string} Path to a unique file located in the temporary directory
     */
    uniqueTempFile(suffix = ".png") {
        const uuid = crypto.randomUUID();
        return path.join(this.tmpDir, `${uuid}${suffix}`);
    }

    async getQueue() {
        const args = ["-o"]
        const { output, status } = child_process.spawnSync("lpstat", args);
        const data = output.filter(x => !!x).map(x => x.toString('utf8')).join('');
        if (status !== 0) throw data;
        const rows = data.split(/\n/g);
        const entries = rows.map(row => row.split(/[ ]{2,}/g).flatMap((row, i) => i == 0 ? row.split(" ") : row));

        const result = entries.map(entry => {
            try {
                const [printer, queueNumber] = /^([\w-]+)-(\d+)$/.exec(entry[0]).slice(1, 3);
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
        return result.filter(x => !!x);
    }

    /**
     * 
     * @param {Buffer} buffer
     */
    async print(buffer) {
        const fileName = this.uniqueTempFile(".png");

        fs_sync.writeFileSync(fileName, buffer);

        const args = ["-o", "landscape", "-o", "media=Custom.2.5125xc.875in", fileName];
        return await child_process.spawnSync("lp", args);
    }
}
