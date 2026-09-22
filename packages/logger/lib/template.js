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
        "YYYY": () => new Date().getFullYear().toString(),

        /**

         * @returns {string} 2-digit year
         */
        "YY": () => new Date().getFullYear().toString().slice(-2),

        /**

         * @returns {string} 2-digit month
         */
        "MM": () => `${new Date().getMonth() + 1}`.padStart(2, "0"),

        /**
         * @returns {string} 2-digit 0-padded Day of month
         */
        "DD": () => `${new Date().getDate()}`.padStart(2, "0"),

        /**
         * @returns {string} 2-digit 0-padded minute
         */
        "M": () => `${new Date().getMinutes()}`.padStart(2, "0"),

        /**

         * @returns {string} 2-digit 0-padded hour
         */
        "H": () => `${new Date().getHours() % 12 + 1}`.padStart(2, "0"),

        /**

         * @returns {string} 2-digit 0-padded second
         */
        "S": () => `${new Date().getSecond()}`.padStart(2, "0"),
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
     * 
     * @param {string} template 
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
