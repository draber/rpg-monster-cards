import fn from 'fancy-node';
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js';
import exporter from '../../../modules/import-export/exporter.js';
import uploader from '../../../modules/import-export/uploader.js';
import domProps from '../../../modules/dom-props/dom-props.js';


/**
 * Custom element containing the list of fonts
 */
class ImportExport extends HTMLElement {

    /**
     * Called on element launch
     */
    connectedCallback() {

        const listing = fn.div({
            classNames: ['import-export-menu'],
            content: [
                fn.a({
                    attributes: {
                        download: '',
                    },
                    content: 'Export cards',
                    events: {
                        pointerup: e => {
                            if (e.button !== 0) {
                                return true;
                            }
                            const fileName = exporter.getFileName();
                            e.target.download = fileName;
                            e.target.href = exporter.getUrl(fileName);

                            setTimeout(() => {
                                e.target.download = '';
                                URL.revokeObjectURL(e.target.href);
                            }, 200)
                        }
                    }
                }),

                fn.a({
                    attributes: {
                        download: true
                    },
                    content: 'Import cards',
                    events: {
                        pointerup: e => {
                            if (e.button !== 0) {
                                return true;
                            }
                            uploader.init(this.app);
                        }
                    }
                })
            ]
        })

        // remove overlay on ESC but only if the import hasn't started yet
        document.addEventListener('keyup', e => {
            if (e.key === 'Escape' && domProps.get('importState') === 'pristine') {
                domProps.unset('importState');
            }
        })

        this.append(listing);
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
    ImportExport.prototype.app = app;
    customElements.get('import-export') || customElements['define']('import-export', ImportExport)
}

export default {
    register
}