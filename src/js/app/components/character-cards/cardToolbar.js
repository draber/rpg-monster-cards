import fn from 'fancy-node';
import {
    camel
} from '../../../modules/string/string.js'
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js'

/**
 * Custom element containing the list of fonts
 */
class CardToolbar extends HTMLElement {

    /**
     * Called on element launch
     */
    connectedCallback() {


        this.on('pointerup', e => {
            const btn = e.target.closest('button');
            if (!btn || e.button !== 0) {
                return true;
            }
            this.card.trigger(camel(`character-${e.target.name}`));
        })

        const buttons = {
            remove: {
                text: 'Delete',
                icon: 'media/icons.svg#icon-axe'
            },
            edit: {
                text: 'Edit',
                icon: 'media/icons.svg#icon-quill'
            },
            done: {
                text: 'Done',
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
        self.on = on;
        self.trigger = trigger;
        return self;
    }
}
/**
 * Register the element type to the DOM
 */
const register = app => {
    CardToolbar.prototype.app = app;
    customElements.get('card-toolbar') || customElements['define']('card-toolbar', CardToolbar)
}

export default {
    register
}