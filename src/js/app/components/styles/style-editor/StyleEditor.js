import {
    on,
    trigger
} from '../../../../modules/events/eventHandler.js'
import styleManager from '../styleManager.js';

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
        this.app.on('styleChange', e => {
            this.style.setProperty(e.detail.name, e.detail.value);
        })

        // bulk change from the active tab
        this.app.on('activeTabChange', e => {
            styleManager.setStyles(e.detail.styles, this);
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