import fn from 'fancy-node';
import tabManager from './tabManager.js';
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js';
import tabStorage from './tabStorage.js';
import contextMenu from '../../../modules/context-menu/context-menu.js';

/**
 * Custom element containing the list of fonts
 */
class TabHandle extends HTMLElement {

    sanitize(text) {
        return new DOMParser()
            .parseFromString(text, 'text/html').body.textContent
            .replace(/\s+/g, ' ')
            .substring(0, 30);
    }

    makeEditable() {
        let selection = window.getSelection();
        selection.removeAllRanges();
        let range = document.createRange();
        this.label.contentEditable = true;
        range.selectNodeContents(this.label);
        selection.addRange(range);
        this.focus();
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

        contextMenu.unregister(this);
    }

    /**
     * Called on element launch
     */
    connectedCallback() {

        contextMenu.register(this, document.createElement('tab-menu'));

        this.closer = fn.span({
            content: '✖',
            classNames: ['closer']
        })

        this.label = fn.span({
            content: this.title,
            classNames: ['label'],
            events: {
                blur: e => {
                    this.label.contentEditable = false;
                    this.label.textContent = this.sanitize(this.label.textContent);
                    this.title = this.label.textContent.trim();
                    tabStorage.update(this, 'title', this.title);
                },
                paste: e => {
                    e.preventDefault();
                    this.label.textContent = this.sanitize(e.clipboardData.getData('text'));
                },
                keydown: e => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.label.blur();
                        return false;
                    }
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        this.label.textContent = this.title;
                        this.label.blur();
                        return false;
                    }
                }
            }
        })

        this.on('pointerup', e => {
            if (e.button > 1) {
                return true;
            }
            if (e.button === 1 || e.target.isSameNode(this.closer)) {
                e.preventDefault();
                e.stopPropagation();
                tabManager.handleRemoval(this, 'soft');
            } else {
                tabManager.setActiveTab(this);
            }
        })

        this.on('dblclick', () => {
            this.makeEditable();
        })

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