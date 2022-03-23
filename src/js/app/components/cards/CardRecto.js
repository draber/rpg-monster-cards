import fn from 'fancy-node';
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js'
import cardHelper from './card-helper.js';

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
                    src: cardHelper.getValue(this.card, 'img', 'field', 'txt')
                }
            }),
            name: fn.figcaption({
                classNames: ['badge'],
                content: cardHelper.getValue(this.card, 'name', 'field', 'txt')
            })
        }

        for (let element of Object.values(entries)) {
            frame.append(element);
        }

        /**
         * repaint on content change
         */
        this.card.on('fieldContentChange', e => {
            const property = e.detail.key === 'img' ? 'src' : 'textContent';
            if(entries[e.detail.key]) {
                entries[e.detail.key][property] = e.detail.value;
            }
        })

        this.append(frame)
    }

    constructor(self) {
        self = super(self);
        self.on = on;
        self.trigger = trigger;
        return self;
    }
}
/**
 * Register the element type to the DOM
 */
const register = app => {
    CardRecto.prototype.app = app;
    customElements.get('card-recto') || customElements['define']('card-recto', CardRecto)
}

export default {
    register
}