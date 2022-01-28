import fn from 'fancy-node';
import CardRecto from './cardRecto.js';
import CardVerso from './cardVerso.js';
import CardToolbar from './cardToolbar.js';

const components = {
    'card-recto': CardRecto,
    'card-verso': CardVerso,
    'card-toolbar': CardToolbar
};


/**
 * Custom element containing the list of patterns
 */
class CharacterCard extends HTMLElement {

    /**
     * Called on element launch
     */
    connectedCallback() {
        

        if(!this.character){            
            throw Error(`Missing property "character" on <character-card> element`);
        }
        if(!this.meta){            
            throw Error(`Missing property "meta" on <character-card> element`);
        }

        const parts = [];

        Object.keys(components).forEach(tag => {
            let elem = document.createElement(tag);
            elem.character = this.character;
            elem.meta = this.meta;
            parts.push(elem);
        })

        const cardInner = fn.article({
            classNames: ['𝔘𝔫𝔥𝔬𝔩𝔡'],
            content: parts
        })

        this.append(cardInner)
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
    Object.values(components).forEach(component => {
        component.register();
    })
    customElements.get('character-card') || customElements['define']('character-card', CharacterCard)
}

export default {
    register
}