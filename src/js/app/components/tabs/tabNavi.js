import fn from 'fancy-node';

/**
 * Custom element containing the list of fonts
 */
class TabNavi extends HTMLElement {

    /**
     * Map attribute and property, getter for 'title'
     * @returns {string}
     */
    get title() {
        return this.getAttribute('title');
    }

    /**
     * Map attribute and property, setter for 'title'
     * @param value
     */
    set title(value) {
        this.setAttribute('title', value);
    }

    add() {

    }

    move() {

    }

    remove() {

    }

    /**
     * Called on element launch
     */
    connectedCallback() {

        if (!this.title) {
            throw Error(`Missing attribute "title" on <tab-navi> element`);
        }



        const tpl = `<figure class="𝔎𝔬𝔫𝔱𝔢𝔯𝔣𝔢𝔦">
            <img src="${this.src}">
            <figcaption class="badge">${this.title}</figcaption>
        </figure>`;

        this.append(fn.toNode(tpl))
    }

    constructor(self) {
        self = super(self);
        return self;
    }
}
/**
 * Register the element type to the DOM
 */
const register = () => {
    customElements.get('tab-navi') || customElements['define']('tab-navi', TabNavi)
}

export default {
    register
}