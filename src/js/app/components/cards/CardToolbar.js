import fn from 'fancy-node';
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js'
import exporter from '../../../modules/import-export/exporter.js'

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
                'Done'
            ],
            events: {
                pointerup: e => {
                    this.card.trigger('characterDone');
                }
            }
        });

        const exportBtn = fn.a({
            classNames: ['button'],
            content: [
                'Export'
            ],
            events: {
                pointerup: e => {
                    if (e.button !== 0) {
                        return true;
                    }                    
                    const fileName = exporter.getFileName();
                    e.target.download = fileName;
                    e.target.href = exporter.getUrl(fileName, {
                        cidData: this.card
                    });

                    setTimeout(() => {
                        e.target.download = '';
                        URL.revokeObjectURL(e.target.href);
                    }, 200)
                }
            }
        });

        const cutBtn = fn.button({
            attributes: {
                type: 'button'
            },
            content: [
                'Cut'
            ],
            events: {
                pointerup: e => {
                    if (e.button !== 0) {
                        return true;
                    }
                    this.card.trigger('characterCut');
                }
            }
        });

        const copyBtn = fn.button({
            attributes: {
                type: 'button'
            },
            content: [
                'Copy'
            ],
            events: {
                pointerup: e => {
                    if (e.button !== 0) {
                        return true;
                    }
                    this.card.trigger('characterCopy');
                }
            }
        });

        const deleteBtn = fn.button({
            attributes: {
                type: 'button'
            },
            content: [
                'Delete'
            ],
            events: {
                pointerup: e => {
                    if (e.button !== 0) {
                        return true;
                    }
                    this.card.trigger('characterRemove');
                }
            }
        });

        const editBtn = fn.button({
            attributes: {
                type: 'button'
            },
            content: [
                'Edit'
            ],
            events: {
                pointerup: e => {
                    if (e.button !== 0) {
                        return true;
                    }
                    this.card.trigger('characterEdit');
                }
            }
        });

        this.append(doneBtn, deleteBtn, exportBtn, cutBtn, copyBtn, editBtn);
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