import fn from 'fancy-node';
import domProps from '../../../modules/dom-props/dom-props.js';
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js';
import cardManager from './card-manager.js';
import cardCopy from '../../../modules/card-copy/card-copy.js';
import {
    cardStore,
    presetStore
} from '../../storage/storage.js';
import cardHelper from './card-helper.js';

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
     * Common code for table row changes 
     * @param {Event} e 
     * @param {String} type label|field
     * @param {String} prop txt|vis
     * @param {String} [version] short|long which label to return, short by default
     */
    updateRow(e, type, prop, version = 'short') {
        let presetPath = cardHelper.getPresetPath(e.detail.key, type, prop, version);
        let cardPath = cardHelper.getCardPath(this.cid, e.detail.key, type, prop, version);
        const preset = presetStore.get(presetPath);
        const current = cardStore.get(cardPath);
        if (e.detail.value !== preset) {
            cardStore.set(cardPath, e.detail.value);
        } else if (typeof current !== 'undefined') {
            cardStore.unset(cardPath);
        }
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
        this.on('fieldContentChange', e => {
            this.updateRow(e, 'field', 'txt');
        })

        // label change
        this.on('labelContentChange', e => {
            this.updateRow(e, 'label', 'txt', 'short');
        })

        // change of field visibility
        this.on('fieldVisibilityChange', e => {
            this.updateRow(e, 'field', 'vis');
        });

        // change of field visibility
        this.on('labelVisibilityChange', e => {
            this.updateRow(e, 'label', 'vis');
        });

        // change of order of fields
        this.on('orderChange', e => {
            let fields = {};
            e.detail.order.forEach(key => {
                fields[key] = cardStore.get(`${this.cid}.fields.${key}`);
            })
            cardStore.set(`${this.cid}.fields`, fields);
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
            // leave the card alone while the form is open
            if (this.classList.contains('editable')) {
                return true;
            }

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