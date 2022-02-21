import fn from 'fancy-node';
import backgrounds from '../../../../../data/backgrounds.json';
import borders from '../../../../../data/borders.json';
import cssProps from '../../../../modules/cssProps/cssProps.js';
import {
    on,
    trigger
} from '../../../../modules/events/eventHandler.js'

const patternPool = {
    backgrounds,
    borders
}

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
     * The path of the image dependson whether it's used in HTML or CSS
     * @param {String} img 
     * @param {String} target html|css
     * @returns {String}
     */
    getUrl(img, target) {
        const path = target === 'html' ? 'media/patterns' : '../media/patterns';
        return `url(${path}/${this.type}/${img.split('/').pop()})`;
    }

    getValue(){
        for(let input of fn.$$('input', this)) {
            if(input.checked){
                return input.value;
            }
        }
        return cssProps.get(this.name) || '';
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

        this.value = this.getValue();

        this.styleArea = 'patterns';

        const patterns = patternPool[this.type];

        const selector = fn.ul({
            content: patterns.map(entry => {
                return fn.li({
                    style: {
                        backgroundImage: this.getUrl(entry.name, 'html')
                    },
                    attributes: {
                        title: entry.label
                    },
                    content: [
                        fn.input({
                            attributes: {
                                type: 'radio',
                                name: `${this.type}-pattern`,
                                value: this.getUrl(entry.name, 'css'),
                                id: `${this.type}-${entry.id}`,
                                checked: this.getUrl(entry.name, 'css') === this.value
                            }
                        }),
                        fn.label({
                            attributes: {
                                for: `${this.type}-${entry.id}`
                            }
                        })
                    ]
                })
            }),
            events: {
                change: e => {
                    this.value = this.getValue();
                    this.app.trigger(`styleChange`, {
                        name: this.name,
                        value: this.value,
                        area: this.styleArea
                    });
                }
            }
        })

        this.append(selector);
        selector.dispatchEvent(new Event('change'));
        
        
        // change from the active tab
        this.app.on('activeTabChange', e => {
            if(e.detail.styles[this.styleArea] && e.detail.styles[this.styleArea][this.name]) {
                fn.$(`input[value="${e.detail.styles[this.styleArea][this.name]}"]`, this).checked = true;
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
    PatternSelector.prototype.app = app;
    customElements.get('pattern-selector') || customElements['define']('pattern-selector', PatternSelector)
}

export default {
    register
}