import fn from 'fancy-node';
import {
    dash
} from '../../modules/string/string.js';
import events from '../../../modules/events/events.js';

/**
 * DRAFT, UNUSED SO FAR
 */

/**
 * Custom element containing the list of fonts
 */
class ChracterEntry extends HTMLElement {
    /**
     * Called on element launch
     */
    connectedCallback() {
        this.populate();
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
    customElements.get('character-entry') || customElements['define']('character-entry', ChracterEntry)
}

export default {
    register
}
