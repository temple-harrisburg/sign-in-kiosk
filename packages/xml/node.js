export class Node {
    /**
     * @type {Node[]}
     */
    children = [];

    /**
     * @type {Node|undefined}
     */
    parent;

    /**
     * @type {any}
     */
    value;

    /**
     * 
     */
    element;

    constructor(value) {
        this.value = value;
    }

    get isLeaf() {
        return this.children.length === 0
    }

    /**
     * @public
     * @param {Node} node 
     */
    appendChild(node) {
        node.parent = this;
        this.children.push(node);
    }

    /**
     * 
     * @param {Node} node 
     */
    removeChild(node) {
        node.parent = undefined;
        this.children = this.children.filter(n => n !== node);
    }
}