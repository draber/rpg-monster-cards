import fn from 'fancy-node';
import events from '../../../modules/events/events.js';
import userPrefs from '../../../modules/user-prefs/userPrefs.js';
import backgrounds from '../../../../data/backgrounds.json';
import borders from '../../../../data/borders.json';
import cssProps from '../../../../data/css-props.json';

const patternPool = {
    backgrounds,
    borders
}

/**
 * Custom element containing the list of patterns
 */
class PatternSelector extends HTMLElement {

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

        this.selected = userPrefs.get(`patterns.${this.name}`) || cssProps[':root'][this.name] || '';

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
                                checked: this.getUrl(entry.name, 'css') === this.selected
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
                    this.selected = e.target.value;
                    userPrefs.set(`patterns.${this.name}`, this.selected);
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
    customElements.get('pattern-selector') || customElements['define']('pattern-selector', PatternSelector)
}

export default {
    register
}