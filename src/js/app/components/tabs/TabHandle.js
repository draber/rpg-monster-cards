import fn from 'fancy-node';
import tabManager from './tabManager.js';
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js';
import contextMenu from '../../../modules/context-menu/context-menu.js';

/**
 * Custom element containing the list of fonts
 */
class TabHandle extends HTMLElement {

    rename() {
        let selection = window.getSelection();
        selection.removeAllRanges();
        let range = document.createRange();
        this.label.contentEditable = true;
        range.selectNodeContents(this.label);
        selection.addRange(range);
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

    /**
     * Called on element launch
     */
    connectedCallback() {

        const menu = fn.ul({
            content: [
                fn.li({
                    content: 'Copy card style',
                    events: {
                        pointerup: e => {
                            if (e.button !== 0) {
                                return true;
                            }
                            this.app.styleStorage = this.styles
                            menu.remove();
                        }
                    },
                }),
                fn.li({
                    content: 'Paste card style',
                    data: {
                        disabled: !this.app.styleStorage
                    },
                    events: {
                        pointerup: e => {
                            if (e.button !== 0 || e.target.dataset.disabled) {
                                return true;
                            }
                            this.styles = this.app.styleStorage
                            menu.remove();
                        }
                    },
                }),
                fn.li({
                    classNames: ['context-separator'],
                    content: 'Rename tab',
                    events: {
                        pointerup: e => {
                            if (e.button !== 0) {
                                return true;
                            }
                            this.rename(e.target);
                            menu.remove();
                        }
                    },
                }),
                fn.li({
                    content: 'Close tab',
                    events: {
                        pointerup: e => {
                            if (e.button !== 0) {
                                return true;
                            }
                            tabManager.handleRemoval(this, 'soft');
                            menu.remove();
                        }
                    },
                }),
                fn.li({
                    classNames: ['context-separator'],
                    content: 'Close empty tabs',
                    events: {
                        pointerup: e => {
                            if (e.button !== 0) {
                                return true;
                            }
                            tabManager.handleRemoval(this, 'empty');
                            menu.remove();
                        }
                    },
                }),
                fn.li({
                    classNames: ['context-danger'],
                    content: 'Close others permanently',
                    events: {
                        pointerup: e => {
                            if (e.button !== 0) {
                                return true;
                            }
                            tabManager.handleRemoval(this, 'others');
                            menu.remove();
                        }
                    },
                }),
                fn.li({
                    classNames: ['context-danger'],
                    content: 'Close all permanently',
                    events: {
                        pointerup: e => {
                            if (e.button !== 0) {
                                return true;
                            }
                            tabManager.handleRemoval(this, 'all');
                            menu.remove();
                        }
                    },
                })
            ]
        })

        contextMenu.register(this, menu);

        this.closer = fn.span({
            content: '✖',
            classNames: ['closer']
        })

        this.label = fn.span({
            content: this.title,
            classNames: ['label'],
            events: {
                blur: e => {
                    this.title = e.target.textContent.trim();
                    tabManager.renameTab(this, this.title);
                },
                keydown: e => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        e.target.blur();
                        return false;
                    }
                },
                dblclick: e => this.rename()
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