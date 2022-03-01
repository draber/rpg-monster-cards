import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js';
import cardCopy from '../../../modules/card-copy/card-copy.js';
import contextMenu from '../../../modules/context-menu/context-menu.js';

/**
 * Custom element containing the list of fonts
 */
class TabContent extends HTMLElement {

    /**
     * Map attribute and property, getter for 'tid'
     * @returns {string}
     */
    get tid() {
        return this.getAttribute('tid');
    }

    /**
     * Map attribute and property, setter for 'tid'
     * @param value
     */
    set tid(value) {
        this.setAttribute('tid', value);
    }
    

    disconnectedCallback() {
        contextMenu.unregister(this);
    }

    /**
     * Called on element launch
     */
    connectedCallback() {

        contextMenu.register(this, document.createElement('tab-menu'));

        this.on('paste', e => {
            cardCopy.paste(this)
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
    TabContent.prototype.app = app;
    customElements.get('tab-content') || customElements['define']('tab-content', TabContent)
}

export default {
    register
}