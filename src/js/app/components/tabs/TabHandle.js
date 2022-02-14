import fn from 'fancy-node';
import softDelete from '../../../modules/softDelete/softdelete.js';
import tabManager from './tabManager.js';

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
            content: '×',
            classNames: ['closer', 'btn']
        })

        const label = fn.span({
            content: this.label
        })

        this.classList.add('tab');

        this.addEventListener('pointerup', e => {
            if (e.button !== 0) {
                return true;
            }
            if (e.target.isSameNode(closer)) {
                tabManager.handleRemoval(this, 'soft')
                softDelete(this, 'Tab ' + this.label)
                    .then(data => {
                        tabManager.handleRemoval(this, data.action);
                    })
            }
            else {
                this.container.deactivateAll();
                this.classList.add('active');
            }
        })

        this.append(label, closer);

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
    customElements.get('tab-handle') || customElements['define']('tab-handle', TabHandle)
}

export default {
    register
}