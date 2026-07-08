/**
 * @typedef {"ERROR"|"MESSAGE"|"SUCCESS"|"WARNING"} ToastStatus
 * @typedef {{status:ToastStatus,message:string,timeoutHandle:number,element:HTMLElement}} ToastMessage
 * @typedef {{timeout:number}} ToastOptions
 */

/**
 * @implements {ToastMessage}
 */
class ToastMessage {

    /**
     * The unique ID of this toast message
     * @type {number}
     */
    id;

    /**
     * The status string of this toast message
     * @type {ToastStatus}
     */
    status;

    /**
     * The text content of this toast message
     * @type {string}
     */
    message;

    /**
     * The timer handle of this toast message
     * @type {number}
     */
    timeoutHandle;

    /**
     * The DOM element representing this toast message
     * @type {HTMLElement}
     */
    element;

    /**
     * Remove this toast message and clear its timeout
     * @returns {number} The ID assigned to this toast message at its creation.
     */
    remove() {
        clearTimeout(this.timeoutHandle);

        this.element.hidePopover();

        setTimeout(() => this.element.remove(), 250);

        return this.id;
    }
}

class Toast {
    /**
     * @private
     * @static
     * @type {number} Counter of all toast messages. New toasts are assigned the current ID, then the ID is incremented.
     */
    static #id = 0;

    /**
     * @private
     * @static
     * @type {ToastMessage[]} Array of all current toast messages.
     */
    static #toasts = [];

    /**
     * @type {HTMLElement} HTML Element that will contain this toast instance's DOM elements
     */
    container;

    /**
     * @type {number} The default duration (in milliseconds) the toast will remain before self-dismissing.
     */
    timeout;

    constructor(container, options = { timeout: 10000 }) {
        const { timeout } = options;
        this.container = container;
        this.timeout = timeout;
    }

    /**
     * Create toast element to be displayed in the DOM.
     * @private
     * @param {ToastMessage} toast 
     * @returns {HTMLDivElement} A Popover Element
     */
    static _buildToast(toast) {
        const { message, status } = toast;
        const el = document.createElement("div");
        el.setAttribute("popover", "manual");
        el.classList.add("toast");
        el.classList.add(`toast-${status.toLowerCase()}`);
        const p = document.createElement("p");
        p.textContent = message;
        el.appendChild(p);

        el.addEventListener("click", () => {
            toast.remove();
        });

        return el;
    }

    /**
     * Create a new toast
     * @public
     * @param {ToastStatus} status Status/type of the toast. 
     * @param {string} message Message to display in the toast
     * @returns {ToastMessage}
     * 
     */
    newToast(status, message, options = { timeout: null }) {
        const timeout = options.timeout ?? this.timeout;
        const toast = new ToastMessage();
        toast.id = Toast.#id++;
        toast.status = status;
        toast.message = message;
        toast.element = Toast._buildToast(toast);
        if (this.timeout > 0) {
            toast.timeoutHandle = setTimeout(() => {
                console.debug(`Removing toast #${this.id}`)
                const removed = toast.remove();
                Toast.#toasts = Toast.#toasts.filter(({ id }) => id !== removed);
            }, this.timeout);
        }

        this.container.appendChild(toast.element);
        toast.element.showPopover();
        return toast;
    }

    /**
     * Remove a toast element by its ID.
     * @param {number} id 
     */
    removeToast(id) { }
}