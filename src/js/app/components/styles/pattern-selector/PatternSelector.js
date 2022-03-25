import fn from 'fancy-node';
import {
    presetStore
} from '../../../storage/storage.js';
import {
    on,
    trigger
} from '../../../../modules/events/eventHandler.js'


/**
 * Custom element containing the list of patterns
 */
class PatternSelector extends HTMLElement {
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
     * Map attribute and property, getter for 'type'
     * @returns {string}
     */
    get type() {
        return this.getAttribute('type');
    }

    /**
     * Map attribute and property, setter for 'type'
     * @param value
     */
    set type(value) {
        this.setAttribute('type', value);
    }

    /**
     * The path of the image depends on whether it's used in HTML or CSS
     * @param {String} img 
     * @param {String} target html|css
     * @returns {String}
     */
    getUrl(img, target) {
        const path = target === 'html' ? 'media/patterns' : '../media/patterns';
        return `url(${path}/${this.type}/${img.split('/').pop()})`;
    }

    /**
     * Retrieve the value of the widget
     * @returns {String}
     */
    getValue() {
        for (let input of fn.$$('input', this)) {
            if (input.checked) {
                return input.value;
            }
        }
    }

    /**
     * Called on element launch
     */
    connectedCallback() {

        if (!this.name) {
            throw Error(`Missing attribute "name" on <pattern-selector> element`);
        }

        if (!this.type) {
            throw Error(`Missing attribute "type" on <pattern-selector> element`);
        }

        const preset = presetStore.get(`css.${this.name}`);
        const inputs = [];

        /**
         * Radiobuttons with the different patterns
         */
        const choices = presetStore.get(this.type).map(entry => {
            let input = fn.input({
                attributes: {
                    type: 'radio',
                    name: `${this.type}-pattern`,
                    value: this.getUrl(entry.name, 'css'),
                    id: `${this.type}-${entry.id}`,
                    checked: this.getUrl(entry.name, 'css') === preset
                }
            });
            inputs.push(input);
            return fn.li({
                style: {
                    backgroundImage: this.getUrl(entry.name, 'html')
                },
                attributes: {
                    title: entry.label
                },
                content: [
                    input,
                    fn.label({
                        attributes: {
                            for: `${this.type}-${entry.id}`
                        }
                    })
                ]
            })
        });

        /**
         * The actula widget
         */
        const selector = fn.ul({
            content: choices,
            events: {
                change: e => {
                    this.app.trigger(`singleStyleChange`, {
                        name: this.name,
                        value: this.getValue()
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
            inputs.find(e => e.value === e.detail.css[this.name]).checked = true;
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
    PatternSelector.prototype.app = app;
    customElements.get('pattern-selector') || customElements['define']('pattern-selector', PatternSelector)
}

export default {
    register
}