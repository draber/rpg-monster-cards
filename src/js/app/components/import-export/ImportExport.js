import fn from 'fancy-node';
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js';
import exporter from '../../../modules/import-export/exporter.js';


/**
 * Custom element containing the list of fonts
 */
class ImportExport extends HTMLElement {

    /**
     * Called on element launch
     */
    connectedCallback() {

        const listing = fn.div({
            content: [
                fn.a({
                    attributes: {
                        download: '',
                    },
                    content: 'Export cards',
                    events: {
                        click: e => {
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
                            console.log('upload')
                        }
                    }
                })
            ]
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