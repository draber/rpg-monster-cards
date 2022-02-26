import fn from 'fancy-node';
import fonts from '../../../../../data/fonts.json';
import cssProps from '../../../../modules/cssProps/cssProps.js';
import {
    on,
    trigger
} from '../../../../modules/events/eventHandler.js'

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

        this.styleArea = 'fonts';

        // currently selected font
        this.currentFont = cssProps.get(this.name);

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
                    this.app.trigger(`singleStyleChange`, {
                        name: this.name,
                        value: e.target.value,
                        area: this.styleArea
                    });
                }
            }
        })

        this.append(selector);
        selector.dispatchEvent(new Event('change'));


        // change from the active tab
        this.app.on('tabStyleChange', e => {  
            const value = e.detail.styles[this.styleArea] && e.detail.styles[this.styleArea][this.name] ?
                e.detail.styles[this.styleArea][this.name] :
                cssProps.get(this.name);
                // quotes need to be neutralized because they can be either ' or " due to the different transformations
            selector.selectedIndex = fonts.findIndex(e => e.family.replace(/['"]+/g) === value.replace(/['"]+/g));

            this.selected = value; 
            this.app.trigger(`singleStyleChange`, {
                name: this.name,
                value,
                area: this.styleArea,
                tab: e.detail.tab
            });
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
    FontSelector.prototype.app = app;
    customElements.get('font-selector') || customElements['define']('font-selector', FontSelector)
}

export default {
    register
}