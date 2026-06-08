/**
 * Cycle through backdrops on a specified element with a crossfade transition
 * @class
 */
class Backdrops {
    /**
     * Index of the current backdrop
     * @private
     * @type {number}
     */
    #index = 0;

    /**
     * @param {HTMLElement} root Element to target for backdrop swapping
     * @param {string[]} backdrops URLs of background images
     */
    constructor(root, ...backdrops) {
        this.backdrops = backdrops;
        this.root = root;
        this.root.style.backgroundImage = this.backgroundImage;

        CSS.registerProperty({
            name: "--backdrop-cross-fade",
            syntax: "<percentage>",
            inherits: "false",
            initialValue: "0%",
        });
    }
    get currentBackdrop() {
        return this.backdrops[this.#index];
    }
    get nextBackdrop() {
        return this.backdrops[(this.#index + 1) % this.backdrops.length];
    }

    get backgroundImage() {
        return `-webkit-cross-fade(url("${this.currentBackdrop}"), url("${this.nextBackdrop}"), var(--backdrop-cross-fade))`;
    }

    /**
     * @param {number} [duration=2000] Duration (in milliseconds) of transition between backdrops
     */
    swapBackdrops(duration = 2000) {
        const crossFadeKeyframes = [
            { "--backdrop-cross-fade": "0%", },
            { "--backdrop-cross-fade": "100%" }
        ];
        const anim = this.root.animate(crossFadeKeyframes, { duration, iterations: 1 });
        anim.addEventListener("finish", () => {
            this.#index = (this.#index + 1) % this.backdrops.length;
            this.root.style.backgroundImage = this.backgroundImage;
        });
    }
}