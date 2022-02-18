import fn from 'fancy-node';
import fonts from '../../../../data/fonts.json';
import userPrefs from '../../../modules/user-prefs/userPrefs.js';
import cssProps from '../../../modules/cssProps/cssProps.js';
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js'

/**
 * Custom element containing the list of fonts
 */
class FontSelector extends HTMLElement {

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
            throw Error(`Missing attribute "name" on <font-selector> element`);
        }

        // currently selected font
        this.currentFont = userPrefs.get(`fonts.${this.name}`) || cssProps.get(this.name) || '';

        // <select>
        const selector = fn.select({
            style: {
                fontFamily: `var(${this.name})`
            },
            content: fonts.map(entry => {
                // <option>
                return fn.option({
                    attributes: {
                        value: entry.family,
                        selected: entry.family === this.currentFont
                    },
                    style: {
                        fontFamily: entry.family
                    },
                    content: entry.label
                })
            }),
            data: {
                prop: this.name
            },
            events: {
                change: e => {
                    this.selected = e.target.value;
                    userPrefs.set(`fonts.${this.name}`, this.currentFont);
                    this.app.trigger(`styleChange`, {
                        name: this.name,
                        value: e.target.value
                    });
                }
            }
        })

        this.append(selector);
        selector.dispatchEvent(new Event('change'));
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
    FontSelector.prototype.app = app;
    customElements.get('font-selector') || customElements['define']('font-selector', FontSelector)
}

export default {
    register
}