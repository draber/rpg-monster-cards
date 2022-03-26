import fn from 'fancy-node';
import {
    presetStore
} from '../../../storage/storage.js';
import {
    on,
    trigger
} from '../../../../modules/events/eventHandler.js';

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
     * Called on element launch
     */
    connectedCallback() {

        if (!this.name) {
            throw Error(`Missing attribute "name" on <font-size> element`);
        }

        const preset = presetStore.get(`css.${this.name}`);
        let parts = preset.match(/^(?<num>[\d\.]+)(?<unit>[a-z]+)$/);
        let numeric = parseFloat(parts.groups.num, 10);
        let unit = parts.groups.unit;
        let min = numeric * .7;
        let max = numeric * 1.3;
        let step = (max - min) / 100;

        const input = fn.input({
            attributes: {
                type: 'range',
                step,
                min,
                max,
                value: numeric
            },
            data: {
                prop: this.name
            },
            events: {
                input: e => {
                    this.app.trigger(`singleStyleChange`, {
                        name: this.name,
                        value: e.target.value + unit
                    });
                }
            }
        })

        this.append(input);

        // change triggered by the active tab
        this.app.on('styleUpdate', e => {
            const value = e.detail.css[this.name] || preset;
            parts = value.match(/^(?<num>[\d\.]+)(?<unit>[a-z]+)$/);
            numeric = parseFloat(parts.groups.num, 10);
            unit = parts.groups.unit;
            input.value = numeric;
            if (e.detail.css[this.name]) {
                input.dispatchEvent(new Event('input'));
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