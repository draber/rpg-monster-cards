import fn from 'fancy-node';
import CardRecto from './CardRecto.js';
import CardVerso from './CardVerso.js';
import CardForm from './CardForm.js';
import CardToolbar from './CardToolbar.js';

/**
 * Custom element containing the list of patterns
 */
class CardBase extends HTMLElement {

    /**
     * Called on element launch
     */
    connectedCallback() {

        const cardInner = fn.article({
            content: [
                fn.div({
                    classNames: ['card-view'],
                    content: [
                        document.createElement('card-recto'),
                        document.createElement('card-verso')
                    ]
                }),
                document.createElement('card-form'),
                document.createElement('card-toolbar')
            ]
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

    CardRecto.register();
    CardVerso.register();
    CardForm.register();
    CardToolbar.register();
    customElements.get('card-base') || customElements['define']('card-base', CardBase)
}

export default {
    register
}