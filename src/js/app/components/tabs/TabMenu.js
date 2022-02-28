import fn from 'fancy-node';
import tabManager from './tab-manager.js';
import properties from '../../../modules/properties/properties.js';


/**
 * Custom element containing the list of fonts
 */
class TabMenu extends HTMLElement {
    
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
                            this.app.styleStorage = this.owner.styles;
                            properties.set('styleStorage', true);
                        }
                    },
                }),
                fn.li({
                    classNames: ['storage-dependent'],
                    content: 'Paste card style',
                    events: {
                        pointerup: e => {
                            if (e.button !== 0) {
                                return true;
                            }
                            this.app.trigger('tabStyleChange', {
                                tab: this.owner,
                                styles: this.app.styleStorage
                            });
                        }
                    },
                }),
                fn.li({
                    content: 'Reset card style',
                    events: {
                        pointerup: e => {
                            if (e.button !== 0) {
                                return true;
                            }
                            this.app.trigger('styleReset', {
                                tab: this.owner
                            });
                        }
                    },
                }),
                fn.li({
                    classNames: ['context-separator','storage-dependent'],
                    content: 'Paste card',
                    events: {
                        pointerup: e => {
                            if (e.button !== 0) {
                                return true;
                            }
                            this.app.trigger('cardPaste', {
                                tab: this.owner,
                                styles: this.app.cardCopy
                            });;
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
                            this.owner.makeEditable();
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
                            tabManager.handleRemoval(this.owner, 'soft');
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
                            tabManager.handleRemoval(this.owner, 'empty');
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
                            tabManager.handleRemoval(this.owner, 'others');
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
                            tabManager.handleRemoval(this.owner, 'all');
                        }
                    },
                })
            ]
        })

        this.append(menu);
    }

    constructor(self) {
        self = super(self);
        return self;
    }
}
/**
 * Register the element type to the DOM
 */
const register = app => {
    TabMenu.prototype.app = app;
    customElements.get('tab-menu') || customElements['define']('tab-menu', TabMenu)
}

export default {
    register
}