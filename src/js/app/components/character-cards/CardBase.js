import fn from 'fancy-node';
import characterStorage from '../character-library/character-storage.js';
import properties from '../../../modules/properties/properties.js';
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js';
import cardManager from './card-manager.js';
import cardCopy from '../../../modules/card-copy/card-copy.js';

/**
 * Custom element containing the list of patterns
 */
class CardBase extends HTMLElement {

    /**
     * Map attribute and property, getter for 'cid'
     * @returns {string}
     */
    get cid() {
        return this.getAttribute('cid');
    }

    /**
     * Map attribute and property, setter for 'cid'
     * @param value
     */
    set cid(value) {
        this.setAttribute('cid', value);
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
     * Map attribute and property, getter for 'tabindex'
     * @returns {string}
     */
    get tabindex() {
        return this.getAttribute('tabindex');
    }

    /**
     * Map attribute and property, setter for 'tabindex'
     * @param value
     */
    set tabindex(value) {
        this.setAttribute('tabindex', value);
    }

    /**
     * Called on element launch
     */
    connectedCallback() {



        ['recto', 'verso', 'form', 'toolbar'].forEach(view => {
            this[view] = document.createElement(`card-${view}`);
            this[view].card = this;
        })

        const cardInner = fn.article({
            content: [
                fn.div({
                    classNames: ['card-view'],
                    content: [
                        this.recto,
                        this.verso
                    ]
                }),
                this.form,
                this.toolbar
            ]
        })

        this.append(cardInner);

        this.tabIndex = 0;

        /**
         * Update model and local storage
         */
        this.on('contentChange', function (e) {
            const section = e.detail.field === 'text' ? 'props' : 'labels';
            this.character[section][e.detail.key] = e.detail.value;
            characterStorage.set('user', this.character.cid, this.character);
        })

        this.on('visibilityChange', function (e) {
            this.character.visibility[e.detail.key][e.detail.field] = e.detail.value;
            characterStorage.set('user', this.character.cid, this.character);
            this.trigger('afterVisibilityChange');
        });

        this.on('orderChange', function (e) {
            let props = {};
            e.detail.order.forEach(key => {
                props[key] = this.character.props[key];
            })
            this.character.props = props;
            characterStorage.set('user', this.character.cid, this.character);
            this.trigger('afterOrderChange');
        });

        this.on('characterCut', function (e) {
            cardCopy.cut(this);
        })

        this.on('characterCopy', function (e) {
            cardCopy.copy(this);
        })

        this.on('characterRemove', function (e) {
            cardManager.handleRemoval(this, 'soft');
        })

        this.on('characterEdit', function (e) {
            properties.set('cardState', 'edit');
            this.classList.add('editable');
        })

        this.on('characterDone', function (e) {
            properties.unset('cardState');
            this.classList.remove('editable');
        })

        this.on('keyup', e => {

            if (e.ctrlKey && ['x', 'c'].includes(e.key)) {
                cardCopy[e.key === 'x' ? 'cut' : 'copy'](this);
            }
            if (e.key === 'Escape') {
                cardCopy.clear(this);
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
    CardBase.prototype.app = app;
    customElements.get('card-base') || customElements['define']('card-base', CardBase)
}

export default {
    register
}
