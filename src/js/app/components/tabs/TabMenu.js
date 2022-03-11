import exporter from '../../../modules/import-export/exporter.js'
import tabManager from './tab-manager.js';
import properties from '../../../modules/properties/properties.js';
import fn from 'fancy-node';
import cardCopy from '../../../modules/card-copy/card-copy.js';
import uploader from '../../../modules/import-export/uploader.js';
import { tabStore } from '../../storage/storage.js';


/**
 * Custom element, context menu for tabs (handles and panels)
 */
class TabMenu extends HTMLElement {
    
    /**
     * Called on element launch
     */
    connectedCallback() {

        // handle for this tab
        const tab = tabManager.getTab(this.owner);
        const tid = tabStore.toTid(tab);

        // context menu
        const menu = fn.ul({
            content: [
                // copy card style
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
                // paste card style
                // `storage-dependent` and `data-storage` are use to handle the visibility of the element
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
                // reset card style
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
                // paste a card, `context-separator` adds a border to group the list elements
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
                            cardCopy.paste(tab);
                        }
                    },
                }),
                // export the cards from this tab
                fn.li({
                    content: fn.a({
                        content: 'Export cards from this tab',
                        events: {
                            pointerup: e => {
                                if (e.button !== 0) {
                                    return true;
                                }
                                const fileName = exporter.getFileName();
                                e.target.download = fileName;
                                e.target.href = exporter.getUrl(fileName, {
                                    tidData: tab
                                });
    
                                setTimeout(() => {
                                    e.target.download = '';
                                    URL.revokeObjectURL(e.target.href);
                                }, 200)
                            }
                        }
                    })                    
                }),
                // Import cards into this tab
                fn.li({
                    content: fn.a({
                        content: 'Import cards into this tab',                        
                        events: {
                            pointerup: e => {
                                if (e.button !== 0) {
                                    return true;
                                }
                                uploader.init(this.app, tid);
                            }
                        }
                    })                    
                }),
                // rename the tab
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
                // close the tab
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
                // close empty tabs
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
                // close other tabs for good
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
                // close all tabs for good
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