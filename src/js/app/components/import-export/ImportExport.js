import fn from 'fancy-node';
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js';
import exporter from '../../../modules/import-export/exporter.js';
import properties from '../../../modules/properties/properties.js';


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
                        click: e => {
                            let currentState = properties.get('importState');
                            if (!currentState) {
                                properties.set('importState', 'pristine');
                            } else if (currentState === 'pristine') {
                                properties.unset('importState');
                            }
                            // else do nothing because the process has already started
                        }
                    }
                })
            ]
        })

        document.addEventListener('keyup', e => {
            if (e.key === 'Escape' && properties.get('importState') === 'pristine') {
                properties.unset('importState');
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
const register = () => {
    customElements.get('import-export') || customElements['define']('import-export', ImportExport)
}

export default {
    register
}