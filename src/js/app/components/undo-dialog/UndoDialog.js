import fn from 'fancy-node';
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js';

/**
 * Custom element containing the list of fonts
 */
class UndoDialog extends HTMLElement {


    /**
     * Called on element launch
     */
    connectedCallback() {

        const closeBtn = fn.span({
            content: '×',
            classNames: ['closer', 'btn'],
            events: {
                pointerup: e => {
                    if (e.button !== 0) {
                        return true;
                    }
                    this.trigger('remove', {
                        element: this.element
                    })
                    this.remove();
                }
            }
        })


        const undoBtn = fn.button({
            attributes: {
                type: 'text'
            },
            events: {
                pointerdown: e => {
                    if (e.button !== 0) {
                        return true;
                    }
                    this.trigger('restore', {
                        element: this.element
                    })
                    this.remove();
                }
            },
            content: 'Undo'
        });

        const undoTitle = fn.h2({
            content: `${(this.label || 'An element')} has been deleted`
        })

        const dialog = fn.aside({
            content: [
                closeBtn,
                undoTitle,
                undoBtn
            ]
        })

        this.append(dialog);

        setTimeout(() => {            
            this.trigger('remove', {
                element: this.element
            });
            this.remove();
        }, 10000)
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
const register = () => {
    customElements.get('undo-dialog') || customElements['define']('undo-dialog', UndoDialog)
}

export default {
    register
}