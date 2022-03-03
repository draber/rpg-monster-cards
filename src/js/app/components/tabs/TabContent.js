import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js';

/**
 * Custom element containing the list of fonts
 */
class TabContent extends HTMLElement {    

    disconnectedCallback() {
        contextMenu.unregister(this);
    }

    /**
     * Called on element launch
     */
    connectedCallback() {

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