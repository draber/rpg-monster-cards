import fn from 'fancy-node';
import tabManager from './tab-manager.js';
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js';
import {
    copyStore,
    tabStore
} from '../../storage/storage.js';
import contextMenu from '../../../modules/context-menu/context-menu.js';
import {
    sanitizeText
} from '../../../modules/string/string.js';
import cardCopy from '../../../modules/card-copy/card-copy.js';
import idHelper from '../../storage/id-helper.js';

/**
 * Custom element containing the list of fonts
 */
class TabHandle extends HTMLElement {

    /**
     * Make the tab label editable
     */
    makeEditable() {
        let selection = window.getSelection();
        selection.removeAllRanges();
        let range = document.createRange();
        this.label.contentEditable = true;
        range.selectNodeContents(this.label);
        selection.addRange(range);
        this.label.focus();
    }

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

    disconnectedCallback() {
        // remove the panel and the context menu when removing the tab
        this.panel.remove();
        contextMenu.unregister(this);
    }

    /**
     * Called on element launch
     */
    connectedCallback() {

        // this tab
        const tab = tabManager.getTab(this);

        // add a context menu
        contextMenu.register(this, document.createElement('tab-menu'));

        // remove the tab
        this.closer = fn.span({
            content: '✖',
            classNames: ['closer']
        })

        // renameable tab label (can't be a `<label>` because no form element is involved)
        this.label = fn.span({
            content: this.title,
            classNames: ['label'],
            events: {
                // renaming finished
                blur: e => {
                    this.label.contentEditable = false;
                    this.label.textContent = sanitizeText(this.label.textContent).substring(0, 30);
                    this.title = this.label.textContent.trim();
                    tabStore.set(`${idHelper.toTid(this)}.title`, this.title);
                    e.detail.tab
                },
                // renaming via paste
                paste: e => {
                    e.preventDefault();
                    if (this.label.contentEditable === true) {
                        this.label.textContent = sanitizeText(e.clipboardData.getData('text')).substring(0, 30);
                        return true;
                    };
                    // if the content of the paste action is a card, paste it into the panel
                    if (copyStore.length) {
                        cardCopy.paste(tab);
                    }
                },
                // keyboard events
                keyup: e => {
                    // enter ends renaming
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.label.blur();
                        return false;
                    }
                    // escape rests to the old name
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        this.label.textContent = this.title;
                        this.label.blur();
                        return false;
                    }
                }
            }
        })

        /**
         * Mouse / touch actions
         */
        this.on('pointerup', e => {
            // do nothing on right click
            if (e.button !== 0) {
                return true;
            }
            // trigger soft delete on middle click and by clicking on the close button
            if (e.target.isSameNode(this.closer)) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                tabManager.handleRemoval(this, 'soft');
                return false;
            } 
            // set tab active on left click
            else {
                tabManager.setActiveTab(this);
                return false;
            }
        })

        // trigger renaming on double click
        this.on('dblclick', () => {
            this.makeEditable();
        })

        // add element to `tab-handle`
        this.append(this.label, this.closer);

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
    TabHandle.prototype.app = app;
    customElements.get('tab-handle') || customElements['define']('tab-handle', TabHandle)
}

export default {
    register
}