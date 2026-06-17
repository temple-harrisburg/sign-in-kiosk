export default class Template {
    /**
     * @type {Array<string|()=>string>}
     */
    preparedTemplate

    /**
     * @type {{[token:string]:()=>string}}
     */
    static builtins = {

        /**
         * @returns {string} 4-digit year
         */
        "YYYY": () => Temporal.Now.zonedDateTimeISO().year,

        /**
         * @returns {string} 2-digit year
         */
        "YY": () => Temporal.Now.zonedDateTimeISO().year.slice(-2),

        /**
         * @returns {string} 2-digit month
         */
        "MM": () => `${Temporal.Now.zonedDateTimeISO().month}`.padStart(2, "0"),

        /**
         * @returns {string} 2-digit 0-padded Day of month
         */
        "DD": () => `${Temporal.Now.zonedDateTimeISO().day}`.padStart(2, "0"),

        /**
         * @returns {string} 2-digit 0-padded minute
         */
        "M": () => `${Temporal.Now.zonedDateTimeISO().minute}`.padStart(2, "0"),

        /**
         * @returns {string} 2-digit 0-padded hour
         */
        "H": () => Temporal.Now.zonedDateTimeISO().hour,

        /**
         * @returns {string} 2-digit 0-padded second
         */
        "S": () => `${Temporal.Now.zonedDateTimeISO().second}`.padStart(2, "0"),
    }
    /**
     * 
     * @param {string} template 
     * @param {Object} values 
     */
    constructor(template) {
        this.preparedTemplate = Template._prepare(template);
    }

    /**
     * Replace template tokens (camelCase strings preceded by '$') with a closure capturing either input values or pre-defined functions from the 'builtins' static property.
     * @private
     * @param {string} template 
     * @returns {Array<string|()=>string>}
     */
    static _prepare(template) {
        const tokens = template.split(/(\$[A-Za-z]+)/g);
        return tokens.map(token => {
            if (token.startsWith('$')) {
                const cleanToken = token.substring(1);
                if (this.builtins.hasOwnProperty(cleanToken)) {
                    const builtinFn = this.builtins[cleanToken];
                    return values => builtinFn();
                } else {
                    return values => values[cleanToken];
                }
            } else {
                return token;
            }
        })
    }

    /**
     * @public
     * @returns {string}
     */
    static execute(template, values = {}) {
        const preparedTemplate = Template._prepare(template);
        return preparedTemplate.map(tokenOrReplacement => {
            if (typeof tokenOrReplacement === 'string') {
                return tokenOrReplacement
            } else {
                return tokenOrReplacement(values);
            }
        }).join('')
    }

    /**
     * Execute the template with the provided key-value pairs.
     * @public
     * @params {Record<string, string>} values Key-value pairs defining replacements to be made.
     * @returns {string}
     */
    execute(values = {}) {
        return this.preparedTemplate.map(tokenOrReplacement => {
            if (typeof tokenOrReplacement === 'string') {
                return tokenOrReplacement
            } else {
                return tokenOrReplacement(values);
            }
        }).join('')
    }
}
