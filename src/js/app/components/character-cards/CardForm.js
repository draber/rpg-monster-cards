import fn from 'fancy-node';
import draggable from '../../../modules/draggable/draggable.js';
import properties from '../../../modules/properties/properties.js';

class CardForm extends HTMLElement {

    isVisible(key, type) {
        if (type === 'text') {
            return this.card.character.meta.visibility[key][type] && !!this.card.character.props[key];
        }
        return this.card.character.meta.visibility[key][type];
    }

    icon(type) {
        let title;
        let icons = [`media/icons.svg#icon-show-${type}`, `media/icons.svg#icon-hide-${type}`];
        switch (type) {
            case 'card':
                title = 'Display this item on the card';
                break;
            case 'label':
                title = 'Display the item label';
                break;
            case 'drag':
                title = 'Drag item to different position';
                icons = [`media/icons.svg#icon-drag-grip`]
                break;
        }
        icons = icons.map(icon => fn.use({
            isSvg: true,
            attributes: {
                href: icon
            }
        }))
        return fn.svg({
            isSvg: true,
            content: [
                fn.title({
                    isSvg: true,
                    content: title
                })
            ].concat(icons)
        })
    }

    buildRow(key) {
        const content = this.buildCells(key);
        const row = fn.tr({
            attributes: {
                draggable: true
            },
            data: {
                key,
                card: this.isVisible(key, 'card'),
                label: this.isVisible(key, 'label')
            },
            content,
            events: {
                // dragend: e => {
                //     this.card.trigger('orderChange', {
                //         order: ((e) => {
                //             return Array.from(fn.$$('[data-key]', e.target.closest('tbody')))
                //                 .map(entry => entry.dataset.key)
                //         })()
                //     });
                // }
            }
        });

        draggable.enable(row);
        return row;
    }

    buildCells(key) {

        // content editing interferes with drag and drop
        // dnd must be disabled while editing
        function handleDraggability(e, action) {
            const row = e.target.closest('[draggable]');
            if (!row) {
                return true;
            }
            draggable[action](row);
        }

        const entries = {
            dragIcon: fn.td({
                classNames: ['icon', 'handle'],
                content: this.icon('drag')
            }),
            label: fn.th({
                data: {
                    type: 'label'
                },
                attributes: {
                    contentEditable: true
                },
                content: this.card.character.labels[key],
                // events: {
                //     focus: e => handleDraggability(e, 'disable'),
                //     blur: e => handleDraggability(e, 'enable')
                // }
            }),
            element: fn.td({
                data: {
                    type: 'text'
                },
                attributes: {
                    contentEditable: true
                },
                content: this.card.character.props[key],
                // events: {
                //     focus: e => handleDraggability(e, 'disable'),
                //     blur: e => handleDraggability(e, 'enable')
                // }
            }),
            labelIcon: fn.td({
                data: {
                    type: 'label'
                },
                classNames: ['icon', 'toggle'],
                content: this.icon('label')
            }),
            cardIcon: fn.td({
                data: {
                    type: 'card'
                },
                classNames: ['icon', 'toggle'],
                content: this.icon('card')
            })
        }

        return Object.values(entries);
    }

    populateTbody(tbody) {
        for (let key of Object.keys(this.card.character.props).filter(prop => !['img', 'name'].includes(prop))) {
            tbody.append(this.buildRow(key));
        }
    }

    /**
     * Called on element launch
     */
    connectedCallback() {

        this.card = this.closest('card-base');

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
                        key: 'name',
                        type: 'text'
                    },
                    content: this.card.character.props.name
                }),
                fn.thead({
                    content: [
                        fn.tr({
                            data: {
                                key: 'img',
                                type: 'text'
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
                                    content: this.card.character.props.img
                                })
                            ]
                        })
                    ]
                }),
                tbody
            ],
            events: {
                input: e => {
                    if (!e.target.contentEditable) {
                        return true;
                    }
                    this.card.trigger('contentChange', {
                        field: e.target.dataset.type,
                        key: e.target.closest('[data-key]').dataset.key,
                        value: e.target.textContent
                    })
                },
                pointerup: e => {
                    // not a left click
                    const trigger = e.target.closest('.toggle');
                    if (e.button !== 0 || !trigger) {
                        return true;
                    }
                    const row = trigger.closest('[data-key]');
                    const key = row.dataset.key;
                    const field = trigger.dataset.type;
                    properties.toggle(field, row);
                    const value = properties.get(field, row);
                    this.card.trigger('visibilityChange', {
                        field,
                        key,
                        value
                    });
                }
            }
        })

        this.populateTbody(tbody);
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