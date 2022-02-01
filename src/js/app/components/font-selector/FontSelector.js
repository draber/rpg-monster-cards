import fn from 'fancy-node';
import events from '../../../modules/events/events.js';
import fonts from '../../../../data/fonts.json';
import userPrefs from '../../../modules/user-prefs/userPrefs.js';
import cssProps from '../../../../data/css-props.json';

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

        this.selected = userPrefs.get(`fonts.${this.name}`) || cssProps[this.name] || '';

        const selector = fn.select({
            style: {
                fontFamily: `var(${this.name})`
            },
            content: fonts.map(entry => {

                return fn.option({
                    attributes: {
                        value: entry.family,
                        selected: entry.family === this.selected
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
                    userPrefs.set(`fonts.${this.name}`, this.selected);
                    events.trigger(`styleChange`, {
                        name: this.name,
                        value: e.target.value
                    });
                }
            }
        })

        this.append(selector);
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
    customElements.get('font-selector') || customElements['define']('font-selector', FontSelector)
}

export default {
    register
}