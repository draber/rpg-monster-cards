import fn from 'fancy-node';

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

    softDelete() {
        console.log('delete')
    }


    /**
     * Called on element launch
     */
    connectedCallback() {

        this.tid = this.data.tid;

        const closer = fn.span({
            content: '×',
            classNames: ['closer', 'btn'],
            events: {
                pointerup: e => {
                    if (e.button !== 0) {
                        return true;
                    }
                    this.softDelete()
                }
            }
        })

        const label = fn.span({
            content: this.data.label
        })

        this.className = 'tab';

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