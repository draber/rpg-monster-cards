import fn from 'fancy-node';
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

        const doneBtn = fn.button({
            attributes: {
                type: 'button',
                name: 'done'
            },
            content: [
                'Done',
                fn.svg({
                    isSvg: true,
                    content: fn.use({
                        isSvg: true,
                        attributes: {
                            href: 'media/icons.svg#icon-quill'
                        }
                    })
                })
            ],
            events: {
                pointerup: e => {
                    this.card.trigger('characterDone');
                }
            }
        });

        const cutBtn = fn.button({
            attributes: {
                type: 'button'
            },
            content: [
                'Cut',
                fn.svg({
                    isSvg: true,
                    content: fn.use({
                        isSvg: true,
                        attributes: {
                            href: 'media/icons.svg#icon-axe'
                        }
                    })
                })
            ],
            events: {
                pointerup: e => {
                    this.card.trigger('characterCut');
                }
            }
        });

        const copyBtn = fn.button({
            attributes: {
                type: 'button'
            },
            content: [
                'Copy',
                fn.svg({
                    isSvg: true,
                    content: fn.use({
                        isSvg: true,
                        attributes: {
                            href: 'media/icons.svg#icon-axe'
                        }
                    })
                })
            ],
            events: {
                pointerup: e => {
                    this.card.trigger('characterCopy');
                }
            }
        });

        const deleteBtn = fn.button({
            attributes: {
                type: 'button'
            },
            content: [
                'Delete',
                fn.svg({
                    isSvg: true,
                    content: fn.use({
                        isSvg: true,
                        attributes: {
                            href: 'media/icons.svg#icon-axe'
                        }
                    })
                })
            ],
            events: {
                pointerup: e => {
                    this.card.trigger('characterRemove');
                }
            }
        });

        const editBtn = fn.button({
            attributes: {
                type: 'button'
            },
            content: [
                'Edit',
                fn.svg({
                    isSvg: true,
                    content: fn.use({
                        isSvg: true,
                        attributes: {
                            href: 'media/icons.svg#icon-quill'
                        }
                    })
                })
            ],
            events: {
                pointerup: e => {
                    this.card.trigger('characterEdit');
                }
            }
        });

        this.append(doneBtn, deleteBtn, cutBtn, copyBtn, editBtn);
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