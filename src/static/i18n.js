
/**
 * @type {{[key:"EN"|"ES"]:{[id:string]:string}}}
 * @description Translation of UI app elements for kiosk app
 */
const translations = {
    "EN": {
        "i18n-title": "Language",
        "config-login-button": "Edit Configuration",
        "password": "Password",
        "submit": "Submit",
        "cancel": "Cancel",
        "continue": "Continue",
        "dismiss": "Dismiss",
        "scanner-await": "Waiting for input from scanner...",
        "first-name": "First Name",
        "last-name": "Last Name",
        "reason-greeting": "What brings you to Temple Harrisburg?",
        "reason-conference": "Conference",
        "reason-training": "Training",
        "reason-meeting": "Meeting",
        "reason-event": "Event",
        "entry-welcome": "Welcome to Temple Harrisburg!",
        "barcode-button": "Scan barcode",
        "barcode-confirm-correct": "Is this correct?",
    },
    "ES": {
        "i18n-title": "Lengua",
        "config-login-button": "Editar configuración",
        "password": "la clave",
        "submit": "Presentar",
        "cancel": "Cancelar",
        "continue": "Continuar",
        "dismiss": "Despedir",
        "scanner-await": "Esperando la entrada...",
        "first-name": "Nombre",
        "last-name": "Apellido",
        "reason-greeting": "¿Por qué está a Temple Harrisburg?",
        "reason-conference": "la Conferencia",
        "reason-training": "la Formación",
        "reason-meeting": "la Reunión",
        "reason-event": "el Evento",
        "entry-welcome": "Bienvenidos a Temple Harrisburg!",
        "barcode-button": "Escanear barcode",
        "barcode-confirm-correct": "¿Es correcto?",
    },
}

const i18n = {
    translations,

    /**
     * 
     * @param {string} code Two-letter code identifying dictionary to retrieve
     * @param {HTMLElement} root Root node to start searching for elements with translations.
     * @param {string} [attribute="data-i18n"] Element attribute to compare with key
     * @default attribute data-i18n 
     */
    translate(code, root, attribute = "data-i18n") {
        for (const [id, text] of Object.entries(translations[code])) {
            const targets = root.querySelectorAll(`*[${attribute}="${id}"]`);
            if (!targets) return;
            targets.forEach(el => {
                el.textContent = text;

                /**
                 * Also translate input placeholders for labels
                 */
                if (el instanceof HTMLLabelElement) {
                    el.control.placeholder = text;
                }

            })
        }
    },

    /**
     * 
     * @param {"EN"|"ES"} code 
     * @param {string} key 
     * @returns {string}
     * @description Get translation for `key` from the dictionary specified by `code`
     */
    getTranslation(code, key) {
        return translations[code][key]
    }
}

