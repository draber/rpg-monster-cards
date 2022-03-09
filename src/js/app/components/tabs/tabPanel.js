import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js';
import cardCopy from '../../../modules/card-copy/card-copy.js';
import contextMenu from '../../../modules/context-menu/context-menu.js';

/**
 * Custom element, single tab panel
 */
class TabPanel extends HTMLElement {

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

    /**
     * delete the context menu on destruction
     */
    disconnectedCallback() {
        contextMenu.unregister(this);
    }

    /**
     * Called on element launch
     */
    connectedCallback() {

        // add a context menu on creation
        contextMenu.register(this, document.createElement('tab-menu'));

        // add a card on paste
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
    TabPanel.prototype.app = app;
    customElements.get('tab-panel') || customElements['define']('tab-panel', TabPanel)
}

export default {
    register
}