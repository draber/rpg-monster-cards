import fn from 'fancy-node';
import cssProps from '../../../../modules/cssProps/cssProps.js';
import {
    on,
    trigger
} from '../../../../modules/events/eventHandler.js'

/**
 * Custom element containing the list of fonts
 */
class FontSize extends HTMLElement {

    /**
     * Map attribute and property, getter for 'name'
     * @returns {string}
     */
    get name() {
        return this.getAttribute('name');
    }

    /**
     * Map attribute and property, setter for 'name'
     * @param value
     */
    set name(value) {
        this.setAttribute('name', value);
    }

    /**
     * Map attribute and property, getter for 'max'
     * @returns {string}
     */
    get max() {
        return this.getAttribute('max');
    }

    /**
     * Map attribute and property, setter for 'max'
     * @param value
     */
    set max(value) {
        this.setAttribute('max', value);
    }

    /**
     * Map attribute and property, getter for 'min'
     * @returns {string}
     */
    get min() {
        return this.getAttribute('min');
    }

    /**
     * Map attribute and property, setter for 'min'
     * @param value
     */
    set min(value) {
        this.setAttribute('min', value);
    }

    /**
     * Map attribute and property, getter for 'value'
     * @returns {string}
     */
    get value() {
        return this.getAttribute('value');
    }

    /**
     * Map attribute and property, setter for 'value'
     * @param value
     */
    set value(value) {
        this.setAttribute('value', value);
    }

    /**
     * Called on element launch
     */
    connectedCallback() {

        if (!this.name) {
            throw Error(`Missing attribute "name" on <font-size> element`);
        }

        this.value = parseFloat(cssProps.get(this.name) || 1.4, 10);
        this.styleArea = 'fonts';

        const attributes = {  
            value: this.value,  
            type: 'range',
            step:  (this.max - this.min) / 100
        }

        attributes.min = attributes.value * .7;
        attributes.max = attributes.value * 1.3;
        attributes.step = (attributes.max - attributes.min) / 100;
        
        const input = fn.input({
            attributes,
            data: {
                prop: this.name 
            },
            events: {
                input: e => {
                    this.value = e.target.value + 'rem';
                    this.app.trigger(`styleChange`, {
                        name: this.name,
                        value: this.value,
                        area: this.styleArea
                    });
                }
            }
        })

        this.append(input);
        input.dispatchEvent(new Event('input'));
        
        
        // change from the active tab
        this.app.on('activeTabChange', e => {
            if(e.detail.styles[this.styleArea] && e.detail.styles[this.styleArea][this.name]) {
                input.value = parseFloat(e.detail.styles[this.styleArea][this.name], 10);
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
    FontSize.prototype.app = app;
    customElements.get('font-size') || customElements['define']('font-size', FontSize)
}

export default {
    register
}