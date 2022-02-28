/**
 * Custom element containing the list of fonts
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
     * Called on element launch
     */
    connectedCallback() {

    }

    constructor(self) {
        self = super(self);
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