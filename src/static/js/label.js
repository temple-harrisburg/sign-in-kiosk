/**
 * Create and serialize labels
 */
class Label {
    /**
     * @type {OffscreenCanvas}
     */
    canvas;

    /**
     * Padding around edges of label
     * @type {number}
     */
    PADDING = 15;

    /**
     * 
     * @param {number} width 
     * @param {number} height 
     */
    constructor(width, height, logo = '/logo.svg') {
        this.canvas = new OffscreenCanvas(width, height)
        this.logoSrc = logo;
        // this.logo = new Image();
        // this.logo.src = logo;
    }

    /**
     * 
     * @param {Record<string, string>} params 
     * @returns {Promise<Blob>}
     */
    async draw(params) {
        const { name, reason } = params;

        const ctx = this.canvas.getContext('2d');
        ctx.reset();

        // Name
        ctx.font = '48pt Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, this.canvas.width / 2, this.canvas.height / 2, this.canvas.width - (this.PADDING * 2));

        // Reason
        ctx.font = '36pt Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(reason, this.canvas.width - this.PADDING, this.canvas.height - this.PADDING);


        const imgHeight = this.canvas.height / 6;
        // QR Code
        const qrCode = await QRCode.toCanvas(undefined, name, { margin: 0, height: imgHeight, color: { light: '#ffffff00' } });
        ctx.drawImage(qrCode, this.canvas.width - qrCode.width - this.PADDING, this.PADDING);

        // Temple Harrisburg Logo
        const logo = await new Image()
        logo.src = this.logoSrc;
        await logo.decode(); // Ensure image is loaded before drawing.
        ctx.drawImage(logo, this.PADDING, this.PADDING, logo.width * (imgHeight / logo.height), imgHeight);

        return await this.canvas.convertToBlob({ type: "image/png" });
    }
}