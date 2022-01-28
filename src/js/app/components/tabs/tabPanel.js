import fn from 'fancy-node';

/**
 * Custom element containing the list of fonts
 */
class TabPanel extends HTMLElement {

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
const register = () => {
    customElements.get('tab-panel') || customElements['define']('tab-panel', TabPanel)
}

export default {
    register
}