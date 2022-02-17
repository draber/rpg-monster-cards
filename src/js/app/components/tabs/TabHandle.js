import fn from 'fancy-node';
import tabManager from './tabManager.js';
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js';

/**
 * Custom element containing the list of fonts
 */
class TabHandle extends HTMLElement {

    /**
     * Map attribute and property, getter for 'title'
     * @returns {string}
     */
    get title() {
        return this.getAttribute('title');
    }

    /**
     * Map attribute and property, setter for 'title'
     * @param value
     */
    set title(value) {
        this.setAttribute('title', value);
    }

    /**
     * Map attribute and property, getter for 'tid'
     * @returns {string}
     */
    get tid() {
        return this.getAttribute('tid');
    }

    /**
     * Map attribute and property, setter for 'tid'
     * @param value
     */
    set tid(value) {
        this.setAttribute('tid', value);
    }

    /**
     * Called on element launch
     */
    connectedCallback() {

        const closer = fn.span({
            content: '✖',
            classNames: ['closer']
        })

        const label = fn.span({
            content: this.label
        })

        this.on('pointerup', e => {
            if (e.button > 1) {
                return true;
            }
            if (e.button === 1 || e.target.isSameNode(closer)) {
                e.preventDefault();
                e.stopPropagation();
                tabManager.handleRemoval(this, 'soft');
            } else {
                tabManager.setActiveTab(this);
            }
        })

        this.append(label, closer);

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
    customElements.get('tab-handle') || customElements['define']('tab-handle', TabHandle)
}

export default {
    register
}