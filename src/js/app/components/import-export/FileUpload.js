import fn from 'fancy-node';
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js';
import importer from '../../../modules/import-export/importer.js';
import uploader from '../../../modules/import-export/uploader.js';


/**
 * Custom element containing the list of fonts
 */
class FileUpload extends HTMLElement {

    /**
     * Called on element launch
     */
    connectedCallback() {

        const spinner = fn.div({
            classNames: ['spinner'],
            content: fn.svg({
                isSvg: true,
                content: fn.use({
                    isSvg: true,
                    attributes: {
                        href: 'media/icons.svg#icon-axe'
                    }
                })
            })
        })

        const label = fn.label({
            content: [
                fn.span({
                    classNames: ['button'],
                    content: 'select'
                }),
                fn.input({
                    attributes: {
                        type: 'file',
                        multiple: true,
                        accept: 'application/json'
                    },
                    events: {
                        change: e => {
                            uploader.handleUploads(e.target.files)
                        }
                    }
                })
            ]
        })

        const uploadForm = fn.form({
            content: [
                fn.p({
                    content: ['Drop or ', label, ' your Ghastly Creatures files']
                })                
            ],
            events: {
                uploadComplete: e => {
                    importer.process(e.detail);
                }
            }
        })

        uploader.init(uploadForm);

        this.append(uploadForm, spinner);
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
    customElements.get('file-upload') || customElements['define']('file-upload', FileUpload)
}

export default {
    register
}