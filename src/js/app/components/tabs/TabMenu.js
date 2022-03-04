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

        const tab = tabManager.getTab(this.owner);
       // const panel = tab.panel;

        const menu = fn.ul({
            content: [
                fn.li({
                    content: 'Copy card style',
                    events: {
                        pointerup: e => {
                            if (e.button !== 0) {
                                return true;
                            }
                            this.app.styleStorage = tab.styles;
                            properties.set('styleStorage', true);
                        }
                    },
                }),
                fn.li({
                    classNames: ['storage-dependent'],
                    data: {
                        storage: 'style'
                    },
                    content: 'Paste card style',
                    events: {
                        pointerup: e => {
                            if (e.button !== 0) {
                                return true;
                            }
                            this.app.trigger('tabStyleChange', {
                                tab,
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
                                tab
                            });
                        }
                    },
                }),
                fn.li({
                    classNames: ['context-separator','storage-dependent'],
                    content: 'Paste card',
                    data: {
                        storage: 'card'
                    },
                    events: {
                        pointerup: e => {
                            if (e.button !== 0) {
                                return true;
                            }
                            this.app.trigger('cardPaste', {
                                tab,
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
                            tab.makeEditable();
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
                            tabManager.handleRemoval(tab, 'soft');
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
                            tabManager.handleRemoval(tab, 'empty');
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
                            tabManager.handleRemoval(tab, 'others');
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
                            tabManager.handleRemoval(tab, 'all');
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