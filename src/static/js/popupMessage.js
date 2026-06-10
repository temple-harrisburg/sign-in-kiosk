/**
 * This script provides a unified interface for invoking popup messages on each of the app's static web pages.
 * Recommended usage:
 *      1. Add this script to the head tag:
 *          ```html
 *          <head>
 *              <!-- Other tags... -->
 *              <script src="/popupMessage.js"></script>
 *          </head>
 *          ```
 * 
 *      2. Call `popupMessage`
 *          ```js
 *          const popup = window.popupMessage();
 *          ```
 * 
 *      3. Set content with `popup.showMessage(...mesages)`
 *      ```js
 *      popup.showMessage("Welcome", "hello world");
 *      ```
 * 
 *      4. Show as modal
 *      ```js
 *      popup.showModal();
 *      ```
 */

/**
 * Custom element for invoking modal popup messages
 */
class PopupMessageElement extends HTMLDialogElement {
    static observedAttributes = ["open", "data-status", "data-title", "data-message",];

    /**
     * Current status of the popup
     * @type {"loading"|"message"}
     */
    #status = "loading";

    constructor() {
        super();
    }

    get status() {
        return this.#status;
    }

    set status(newValue) {
        this.#status = newValue;
        newValue === "loading" ?? this.showSpinner();
    }

    /**
     * Change the popup content to a message
     * @public
     * @param {string[]} messages One or more lines of text. If more than one argument is provided, the first argument is shown as an H3 heading.
     */
    showMessage(...messages) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("popup-content-wrapper")
        if (messages.length > 1) {
            const title = messages.shift();
            const h3 = document.createElement('h3');
            h3.textContent = title;
            h3.classList.add("popup-title")
            wrapper.appendChild(h3);
        }
        messages.forEach(msg => {
            const p = document.createElement('p');
            p.textContent = msg;
            p.classList.add("popup-paragraph");
            wrapper.appendChild(p);
        })
        this.replaceChildren(wrapper);
    }

    /**
     * Change the popup content to a loading spinner
     * @param {string} [className="spinner"] The class name added to the spinner div. Styles and animation must be user-defined.
     * @public
     */
    showSpinner(className = "spinner") {
        const spinner = document.createElement("div");
        spinner.classList.add(className);
        this.replaceChildren(spinner);
    }

    connectedCallback() {
        this.showSpinner();
        this.setAttribute("closedby", "any");
        this.classList.add("popup");
        this.addEventListener("close", () => {
            // Give exit animation time to play
            setTimeout(() => this.remove(), 250)
        });
    }

    /**
     * 
     * @param {string} name 
     * @param {string} oldValue 
     * @param {string} newValue 
     */
    attributeChangedCallback(name, oldValue, newValue) {
        // console.log(`Attribute changed: ${name}, from: ${oldValue} to: ${newValue}`);
        if (name.startsWith('data-')) {
            const prop = name.slice('data-'.length);
            console.log(prop);
            switch (prop) {
                case "status":
                    this.status = newValue;
                    break;
                default:
                    break;
            }
        }
    }
}

window.customElements.define("popup-message", PopupMessageElement, { extends: "dialog" });

/**
 * Show a popup message, by default with a loading spinner.
 * @typedef {"loading"|"message"} Status
 * @param {{status:Status, classList:string[]}} options
 * @returns {PopupMessageElement} Reference to popup message
 */
window.createPopupMessage = function (options = { status: "loading", classList: ["popup", "drop-shadow"] }) {
    /**
     * @type {PopupMessageElement}
     */
    const popup = document.createElement("dialog", { is: "popup-message" });

    const { status, classList } = options;
    popup.setAttribute("data-status", status);
    classList.forEach(cls => popup.classList.add(cls));
    document.body.appendChild(popup);
    return popup;
}