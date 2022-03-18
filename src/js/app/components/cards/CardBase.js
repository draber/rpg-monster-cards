import fn from 'fancy-node';
import domProps from '../../../modules/dom-props/dom-props.js';
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js';
import cardManager from './card-manager.js';
import cardCopy from '../../../modules/card-copy/card-copy.js';
import {
    cardStore
} from '../../storage/storage.js';

/**
 * Card container
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

        // create the different components
        // and reference them in the card
        ['recto', 'verso', 'form', 'toolbar'].forEach(view => {
            this[view] = document.createElement(`card-${view}`);
            this[view].card = this;
        })

        // Build card DOM
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

        // make the card focusable
        this.tabIndex = 0;

        /**
         * Handle the different actions from the card form
         */
        // text/image change
        this.on('contentChange', function (e) {
            const section = e.detail.field === 'text' ? 'props' : 'labels';
            this.character[section][e.detail.key] = e.detail.value;
            cardStore.set(this.character.cid, this.character);
        })
        // change of field visibility
        this.on('visibilityChange', function (e) {
            this.character.visibility[e.detail.key][e.detail.field] = e.detail.value;
            cardStore.set(this.character.cid, this.character);
            this.trigger('afterVisibilityChange');
        });
        // change of order of fields
        this.on('orderChange', function (e) {
            let props = {};
            e.detail.order.forEach(key => {
                props[key] = this.character.props[key];
            })
            cardStore.set(`${this.character.cid}.props`, props);
            this.trigger('afterOrderChange');
        });

        // card has been cut out
        this.on('characterCut', function (e) {
            cardCopy.cut(this);
        })

        // card has been copied
        this.on('characterCopy', function (e) {
            cardCopy.copy(this);
        })

        // card has been removed
        this.on('characterRemove', function (e) {
            cardManager.handleRemoval(this, 'soft');
        })

        // open card editor
        this.on('characterEdit', function (e) {
            domProps.set('cardState', 'edit');
            this.classList.add('editable');
        })

        // close card editor
        this.on('characterDone', function (e) {
            domProps.unset('cardState');
            this.classList.remove('editable');
        })

        // handle keyboard shortcuts
        this.on('keyup', e => {

            if (e.ctrlKey && ['x', 'c'].includes(e.key)) {
                cardCopy[e.key === 'x' ? 'cut' : 'copy'](this);
            }
            if (e.key === 'Escape') {
                cardCopy.clear(this);
            }
            if (e.key === 'Delete') {
                cardManager.handleRemoval(this, 'soft');
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