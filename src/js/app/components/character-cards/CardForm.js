import fn from 'fancy-node';
import draggable from '../../../modules/draggable/draggable.js';
import fields from './field-service.js';

class CardForm extends HTMLElement {

    icon(key, type) {
        const nextState = fields.isVisible(key, type) ? 'show' : 'hide';
        let title;
        let href;
        switch (type) {
            case 'item':
                title = 'Display this item on the card';
                href = `media/icons.svg#icon-${nextState}-${type}`
                break;
            case 'label':
                title = 'Display the item label';
                href = `media/icons.svg#icon-${nextState}-${type}`
                break;
            case 'drag':
                title = 'Drag item to different position';
                href = `media/icons.svg#icon-drag-grip`
                break;
        }
        return fn.svg({
            isSvg: true,
            content: [
                fn.title({
                    isSvg: true,
                    content: title
                }),
                fn.use({
                    isSvg: true,
                    attributes: {
                        href
                    }
                })
            ]
        })
    }

    broadCastTextChange(e) {
        if (!e.target.contentEditable) {
            return true;
        }
        const key = e.target.dataset.key ? e.target.dataset.key : e.target.closest('tr').dataset.key;
        const type = e.target.nodeName === 'TH' ? 'label' : 'value'
        const text = e.target.textContent;
        // segment form | recto | verso
        for (let [segment, list] of Object.entries(fields.rendered)) {
            // ignore form, target card only
            if (segment === 'form') {
                continue;
            }
            // e.g. fields.rendered.recto.img
            if (list[key]) {
                // always arrays: cr for instance exists twice on the same card
                // once on the card, once as a badge
                list[key].forEach(row => {
                    if (row[type]) {
                        key === 'img' ? row[type].src = text : row[type].textContent = text;
                    }
                })
            }
        }
        console.log(fields.rendered)
    }

    buildRow(key) {
        const data = this.buildCells(key);
        return fn.tr({
            data: {
                key
            },
            classNames: data.classNames,
            content: data.cells,
            events: {
                pointerdown: function (e) {
                    this.draggable === e.target.nodeName === 'TR'
                }
            }
        });
    }

    buildCells(key) {
        const entries = {
            dragIcon: fn.td({
                classNames: ['icon', 'handle'],
                content: this.icon(key, 'drag')
            }),
            label: fn.th({
                attributes: {
                    contentEditable: true
                },
                content: fields.getLabel(key)
            }),
            element: fn.td({
                attributes: {
                    contentEditable: true
                },
                content: fields.getProp(key)
            }),
            labelIcon: fn.td({
                classNames: ['icon'],
                content: this.icon(key, 'label')
            }),
            cardIcon: fn.td({
                classNames: ['icon'],
                content: this.icon(key, 'item')
            })
        }
        fields.setRendered('form', key, entries.element, entries.label);

        const classNames = [];
        if (!fields.isVisible(key, 'card')) {
            classNames.push('no-card')
        }

        if (!fields.isVisible(key, 'label')) {
            classNames.push('no-label')
        }
        return {
            classNames,
            cells: Object.values(entries)
        }
    }

    populateTbody(tbody) {
        for (let key of fields.getOrder(['img', 'name'])) {
            tbody.append(this.buildRow(key, false));
        }
    }

    /**
     * Called on element launch
     */
    connectedCallback() {

        const quill = fn.svg({
            isSvg: true,
            classNames: ['quill'],
            content: fn.use({
                isSvg: true,
                attributes: {
                    href: 'media/icons.svg#icon-quill'
                }
            })
        })

        const tbody = fn.tbody();
        const frame = fn.table({
            content: [
                fn.caption({
                    attributes: {
                        contentEditable: true
                    },
                    data: {
                        key: 'name'
                    },
                    content: fields.getProp('name')
                }),
                fn.thead({
                    content: [
                        fn.tr({
                            data: {
                                key: 'img'
                            },
                            content: [
                                fn.th({
                                    content: 'Image'
                                }),
                                fn.td({
                                    attributes: {
                                        colSpan: 4,
                                        contentEditable: true
                                    },
                                    content: fields.getProp('img')
                                })
                            ]
                        })
                    ]
                }),
                tbody
            ],
            events: {
                input: e => {
                    this.broadCastTextChange(e);
                },                
                paste: e => {
                    this.broadCastTextChange(e);
                }
            }
        })

        this.populateTbody(tbody);

        // draggable.init(ul);
        this.append(quill, frame);
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