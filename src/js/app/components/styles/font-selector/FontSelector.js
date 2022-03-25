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
class FontSelector extends HTMLElement {

    /**
     * Normalize "My Font" to 'My Font' to make font families comparable
     * @param {String} fontFamily 
     * @returns {String}
     */
    normalize(fontFamily) {
        return fontFamily.replace(/"+/g, "'");
    }

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

        let value = this.normalize(presetStore.get(`css.${this.name}`));
        let fonts = presetStore.get('fonts');

        // <select>
        const selector = fn.select({
            style: {
                fontFamily: `var(${this.name})`
            },
            content: fonts.map(entry => {
                // <option>
                let family = this.normalize(entry.family);
                return fn.option({
                    attributes: {
                        value: family,
                        selected: family === value
                    },
                    style: {
                        fontFamily: family
                    },
                    content: entry.label
                })
            }),
            data: {
                prop: this.name
            },
            events: {
                change: e => {
                    this.app.trigger(`singleStyleChange`, {
                        name: this.name,
                        value: this.normalize(e.target.value)
                    });
                }
            }
        })

        this.append(selector);
        selector.dispatchEvent(new Event('change'));        

        // change triggered by the active tab
        this.app.on('styleUpdate', e => {
            if (!e.detail.css[this.name]) {
                return false
            }
            value = this.normalize(e.detail.css[this.name]);
            selector.selectedIndex = fonts.findIndex(e => this.normalize(e.family) === value);
            selector.dispatchEvent(new Event('change'));
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