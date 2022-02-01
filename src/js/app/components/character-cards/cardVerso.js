import fn from 'fancy-node';
import fields from './field-service.js';

class CardVerso extends HTMLElement {

    buildRow(key) {
        const entries = {
            label: fn.th({
                attributes: {
                    hidden: !fields.isVisible(key, 'label'),
                },
                content: fields.getLabel(key)
            }),

            element: fn.td({
                content: fields.getProp(key)
            })
        }
        fields.setRendered('verso', key, entries.element, entries.label);

        return fn.tr({
            attributes: {
                hidden: !fields.isVisible(key, 'card'),
            },
            content: Object.values(entries)
        });
    }

    /**
     * Called on element launch
     */
    connectedCallback() {

        const entries = {
            name: fn.caption({
                classNames: ['badge'],
                content: fields.getProp('name')
            }),
            cr: fn.div({
                classNames: ['badge', 'cr'],
                content: fields.getProp('cr')
            })
        }
        for (let [key, element] of Object.entries(entries)) {
            fields.setRendered('verso', key, element, null);
        }

        const tbody = fn.tbody();
        const frame = fn.table({
            classNames: ['frame'],
            content: [
                entries.name,
                tbody
            ]
        })


        for (let key of fields.getOrder(['img', 'name'])) {
            tbody.append(this.buildRow(key));
        }

        this.append(frame, entries.cr);
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
    customElements.get('card-verso') || customElements['define']('card-verso', CardVerso)
}

export default {
    register
}