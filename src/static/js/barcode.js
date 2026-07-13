/**
 * Parses an array of keypresses according to the AAMVA spec
 * @see {@link https://web.archive.org/web/20260218201105/https://www.aamva.org/getmedia/99ac7057-0f4d-4461-b0a2-3a5532e1b35c/AAMVA-2020-DLID-Card-Design-Standard.pdf}
 */
class Pdf417Parser {
    /**
     * The current header field number specified by the AAMVA document
     * @type {number}
     */
    #fieldNumber = 1;

    /**
     * Temporary buffer for collecting fields
     * @type {string[]}
     */
    #buffer = [];

    /**
     * Information following a segmentTerminator
     * @type {string[]}
     */
    #chunks = [];

    /**
     * Parser received a keypress which will modify the next keydown event.
     * @type {boolean}
     */
    #awaitingModified = false;

    /**
     * The AAMVA compliance indicator
     * @type {'@'}
     */
    #complianceIndicator;

    /**
     * Terminates a data element and indicates more data follows
     * @type {string}
     */
    #dataElementSeparator;

    /**
     * Unused in AAMVA spec.
     * @type {string}
     */
    #recordSeparator;

    /**
     * End of a segment
     * @type {string}
     */
    #segmentTerminator;

    /**
     * The AAMVA file type.
     * @type {'ANSI '}
     */
    #fileType;

    constructor() { }

    /**
     * Clear modifier keys from input
     * @private
     * @param {string} input
     * @returns {string}
     */
    cleanChunk(input) {
        return input.replace(/Shift|Control|Enter/g, '');
    }

    /**
     * Try to split chunks into data fields
     * @param {string} input
     * @returns {string[][]|string[]}
     */
    parseChunk(input) {
        let chunk = this.cleanChunk(input);
        try {
            return /(D[A-Z]{2})([\w]+)/g.exec(chunk).slice(1, 3)
        } catch {
            return [chunk]
        }
    }

    get result() {
        return this.#chunks.map(chunk => this.parseChunk(chunk));
    }

    /**
     * Reset the buffer
     */
    flush() {
        this.#buffer = [];
    }

    /**
     * Process keypresses
     * @param {KeyboardEvent[]} events
     */
    feed(...events) {
        for (let i = 0; i < events.length; i++) {
            const { key } = events[i];
            switch (key) {
                case '@':
                    this.#complianceIndicator = key;
                    this.#fieldNumber++;
                    break;

                case 'Control':
                    this.#buffer.push(key);
                    if (this.#fieldNumber === 2) {
                        this.#awaitingModified = true;
                        break;
                    }

                case 'Enter':
                    if (this.#fieldNumber === 3) {
                        this.#recordSeparator = key;
                        this.#fieldNumber++;
                    }
                    break;

                case 'Shift':
                    if (this.#fieldNumber === 4) {
                        this.#segmentTerminator = key;
                        this.#fieldNumber++;
                    }
                    // else {
                    //     this.#buffer.push(key);
                    // }
                    break;

                default:

                    switch (this.#fieldNumber) {

                        /**
                         * (Field 2) Data element separator
                         */
                        case 2:
                            if (this.#awaitingModified) {
                                this.#buffer.push(key);
                                this.#dataElementSeparator = this.#buffer.join('');
                                this.#fieldNumber++;
                                this.flush();
                                this.#awaitingModified = false;
                            }
                            break;

                        /**
                         *
                         */
                        case 3:
                            break;
                        /**
                         * (Field 5) File type is always 'ANSI ' 
                         */
                        case 5:
                            if (this.#buffer.join('') === 'ANSI ') {
                                this.#fileType = this.#buffer.join('');
                                this.#fieldNumber++;
                                this.flush();
                            } else {
                                this.#buffer.push(key)
                            }

                            break;
                        /**
                         * (Field 6) Issuer Identification Number
                         */
                        case 6:
                            if (this.#buffer.length === 6) {
                                this.#fieldNumber++;
                                this.flush();
                            } else {
                                this.#buffer.push(key);
                            }
                            break;

                        /**
                         * (Field 7) AAMVA Version Number
                         */
                        case 7:
                            if (this.#buffer.length === 2) {
                                this.#fieldNumber++;
                                this.flush();
                            } else {
                                this.#buffer.push(key);
                            }
                            break;

                        /**
                         * (Field 8) Jurisdiction Version Number
                         */
                        case 8:
                            if (this.#buffer.length === 2) {
                                this.#fieldNumber++;
                                this.flush();
                            } else {
                                this.#buffer.push(key);
                            }
                            break;

                        /**
                         * (Field 9) Number of Entries
                         */
                        case 9:
                            if (this.#buffer.length === 2) {
                                this.#fieldNumber++;
                                this.flush();
                            } else {
                                this.#buffer.push(key);
                            }

                        default:
                            this.#buffer.push(key);

                            if (this.#buffer.join('').endsWith(this.#dataElementSeparator)) {
                                let data = this.#buffer.join('');
                                data = data.slice(0, data.indexOf(this.#dataElementSeparator));
                                this.#chunks.push(data);
                                this.flush();
                            }
                            break;
                    }
                    break;
            }
        }
    }
}
