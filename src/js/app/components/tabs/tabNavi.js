import fn from 'fancy-node';
import tabManager from './tabManager.js';

/**
 * Custom element containing the list of fonts
 */
class TabNavi extends HTMLElement {
    /**
     * Called on element launch
     */
    connectedCallback() {

        const adder = fn.span({
            content: '+',
            classNames: ['adder', 'btn', 'tab'],
            events: {
                pointerup: e => {
                    if (e.button !== 0) {
                        return true;
                    }
                    tabManager.createTab();
                }
            }
        })

        this.append(adder);

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
    customElements.get('tab-navi') || customElements['define']('tab-navi', TabNavi)
}

export default {
    register
}