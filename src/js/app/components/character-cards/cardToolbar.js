import fn from 'fancy-node';
import events from '../../../modules/events/events.js';
import {
    camel
} from '../../../modules/string/string.js'

/**
 * Custom element containing the list of fonts
 */
class CardToolbar extends HTMLElement {

    /**
     * Called on element launch
     */
    connectedCallback() {

        if (!this.character) {
            throw Error(`Missing property "character" on <card-toolbar> element`);
        }

        this.addEventListener('pointerup', e => {
            const btn = e.target.closest('button');
            if (!btn || e.button !== 0) {
                return true;
            }
            events.trigger(camel(`character-${e.target.name}`), this.closest('character-card'));
        })

        const buttons = {
            remove: {
                text: 'Eradicate',
                icon: 'media/icons.svg#icon-axe'
            },
            edit: {
                text: 'Mutate',
                icon: 'media/icons.svg#icon-quill'
            }
        }

        for (let [name, data] of Object.entries(buttons)) {
            const tpl = fn.button({
                attributes: {
                    type: 'button',
                    name
                },
                content: [
                    data.text,
                    fn.svg({
                        isSvg: true,
                        content: fn.use({
                            isSvg: true,
                            attributes: {
                                href: data.icon
                            }
                        })
                    })
                ]
            })

            this.append(fn.toNode(tpl));
        }
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
    customElements.get('card-toolbar') || customElements['define']('card-toolbar', CardToolbar)
}

export default {
    register
}