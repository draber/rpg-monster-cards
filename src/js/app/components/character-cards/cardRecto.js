import fn from 'fancy-node';
import fields from './field-service.js';

/**
 * Custom element containing the list of fonts
 */
class CardRecto extends HTMLElement {

    /**
     * Called on element launch
     */
    connectedCallback() {

        const frame = fn.figure({
            classNames: ['frame']
        })

        const entries = {
            img: fn.img({
                attributes: {
                    src: fields.getProp('img')
                }
            }),
            name: fn.figcaption({
                classNames: ['badge'],
                content: fields.getProp('name')
            })
        }

        for (let [key, element] of Object.entries(entries)) {
            frame.append(element);
            fields.setRendered('recto', key, element, null);
        }

        this.append(frame)
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