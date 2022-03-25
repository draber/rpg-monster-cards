import {
    on,
    trigger
} from '../../../../modules/events/eventHandler.js';
import {
    presetStore
} from '../../../storage/storage.js';

/**
 * Custom element containing the list of fonts
 */
class StyleEditor extends HTMLElement {

    /**
     * Called on element launch
     */
    connectedCallback() {

        // event listeners on this element
        // single change from one of the controls
        this.app.on('singleStyleChange', e => {
            this.style.setProperty(e.detail.name, e.detail.value);
        })

        // bulk change triggered by the active tab
        this.app.on('styleUpdate', e => {
            const css = {
                ...presetStore.get('css'),
                ...e.detail.css
            }
            for (let [property, value] of Object.entries(css)) {
                this.style.setProperty(property, value);
            }
        })
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
    StyleEditor.prototype.app = app;
    customElements.get('style-editor') || customElements['define']('style-editor', StyleEditor)
}

export default {
    register
}