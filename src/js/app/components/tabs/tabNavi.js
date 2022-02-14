import fn from 'fancy-node';
import tabManager from './tabManager.js';
import {on, trigger}from '../../../modules/events/eventHandler.js';
import properties from '../../../modules/properties/properties.js';

/**
 * Custom element containing the list of fonts
 */
class TabNavi extends HTMLElement {


    deactivateAll(){
        fn.$$('tab-handle', this).forEach(tab => {
            tab.classList.remove('active');
            tab.panel.classList.remove('active');
        })
    }

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
                    this.deactivateAll();
                    tabManager.createTab();
                }
            }
        })

        this.append(adder);

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
    customElements.get('tab-navi') || customElements['define']('tab-navi', TabNavi)
}

export default {
    register
}