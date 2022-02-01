import fn from 'fancy-node';
import draggable from '../../../modules/draggable/draggable.js';
import fields from './field-service.js';

class CardForm extends HTMLElement {

    icon(key, type) {
        const icon = fields.isVisible(key, type) ? 'show' : 'hide';
        return fn.svg({
            isSvg: true,
            content: [
                fn.title({
                    isSvg: true,
                    content: type === 'label' ? 'Display a label with this item' : 'Display this item'
                }),
                fn.use({
                    isSvg: true,
                    attributes: {
                        href: `media/icons.svg#icon-${icon}-${type === 'card' ? 'item' : 'label'}`
                    }
                })
            ]
        })
    }

    buildRow(key) {
        const entries = {
            label: fn.th({
                attributes: {
                    contentEditable: true,
                },
                events: {
                    keyup: e => {
                        console.log(e)
                    }
                },
                content: fields.getLabel(key)
            }),

            element: fn.td({
                attributes: {
                    contentEditable: true,
                },
                events: {
                    keyup: e => {
                        console.log(e)
                    }
                },
                content: fields.getProp(key)
            })
        }
        fields.setRendered('form', key, entries.element, entries.label);

        const cells = Object.values(entries);
        ['card', 'label'].forEach(type => {
            cells.push(fn.td({
                content: ['img', 'name'].includes(key) ? '' : this.icon(key, type)
            }))
        })

        const classNames = [];
        if(!fields.isVisible(key, 'card')){
            classNames.push('no-card')
        }

        if(!fields.isVisible(key, 'label')){
            classNames.push('no-label')
        }

        if(['img', 'name'].includes(key)){
            classNames.push('immovable')
        }

        return fn.tr({
            attributes: {
                draggable: true,
            },
            classNames,
            content: cells
        });
    }

    /**
     * Called on element launch
     */
    connectedCallback() {

        const tbody = fn.tbody();
        const frame = fn.table({
            classNames: ['frame'],
            content: tbody
        })
        frame.append(tbody);

        for (let key of fields.getOrder()) {
            tbody.append(this.buildRow(key));
        }

        draggable.init(tbody);
        this.append(frame);
    }

    constructor(self) {
        self = super(self);
        return self;
    }
}
/**
 * Register the element type to the DOM
 */
const register = () => {
    customElements.get('card-form') || customElements['define']('card-form', CardForm)
}

export default {
    register
}