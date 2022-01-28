import fn from 'fancy-node';

/**
 * Custom element containing the list of fonts
 */
class CardRecto extends HTMLElement {

    /**
     * Called on element launch
     */
    connectedCallback() {

        if(!this.character){            
            throw Error(`Missing property "character" on <card-recto> element`);
        }

        const tpl = `
        <figure class="𝔎𝔬𝔫𝔱𝔢𝔯𝔣𝔢𝔦">
            <img src="${this.character.img}">
            <figcaption class="badge">${this.character.name}</figcaption>
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
    customElements.get('card-recto') || customElements['define']('card-recto', CardRecto)
}

export default {
    register
}