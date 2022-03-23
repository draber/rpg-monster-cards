import fn from 'fancy-node';
import draggable from '../../../modules/draggable/draggable.js';
import domProps from '../../../modules/dom-props/dom-props.js';
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js';
import {
    sanitizeText
} from '../../../modules/string/string.js';
import {
    cardStore
} from '../../storage/storage.js';
import cardHelper from './card-helper.js';

class CardForm extends HTMLElement {

    icon(type) {
        let title;
        let icons = [`media/icons.svg#icon-show-${type}`, `media/icons.svg#icon-hide-${type}`];
        switch (type) {
            case 'field':
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
                field: cardHelper.isVisible(this.card, key, 'field'),
                label: cardHelper.isVisible(this.card, key, 'label')
            },
            content
        });

        draggable.enable(row);

        // _must_ be added _after_ draggable.enable to ensure, the order of the rows has already been completed
        row.addEventListener('dragend', e => {
            this.card.trigger('orderChange', {
                order: (e => {
                    return Array.from(fn.$$('[data-key]', this.tbody.closest('table')))
                        .map(entry => entry.dataset.key)
                })()
            })
        })
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

        const fieldEvents = {
            focus: e => handleDraggability(e, 'disable'),
            blur: e => handleDraggability(e, 'enable'),
            keyup: e => e.target.textContent = sanitizeText(e.target.textContent),
            paste: e => e.target.textContent = sanitizeText(e.target.textContent),
        }

        const entries = {
            label: fn.th({
                data: {
                    type: 'label'
                },
                attributes: {
                    contentEditable: true
                },
                content: cardHelper.getValue(this.card, key, 'label', 'txt'),
                events: fieldEvents
            }),
            element: fn.td({
                data: {
                    type: 'field'
                },
                attributes: {
                    contentEditable: true
                },
                content: cardHelper.getValue(this.card, key, 'field', 'txt'),
                events: fieldEvents
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
                    type: 'field'
                },
                classNames: ['icon', 'toggle'],
                content: this.icon('field')
            }),
            dragIcon: fn.td({
                classNames: ['icon', 'handle'],
                content: this.icon('drag')
            })
        }

        return Object.values(entries);
    }

    populateTbody() {
        for (let key of Object.keys(cardStore.get(`${this.card.cid}.fields`)).filter(e => !['img', 'name'].includes(e))) {
            this.tbody.append(this.buildRow(key));
        }
    }    



    /**
     * Called on element launch
     */
    connectedCallback() {

        this.card = this.closest('card-base');

        this.tbody = fn.tbody();
        const frame = fn.table({
            content: [
                fn.caption({
                    attributes: {
                        contentEditable: true
                    },
                    data: {
                        key: 'name',
                        type: 'field'
                    },
                    content: cardHelper.getValue(this.card, 'name', 'field', 'txt')
                }),
                fn.thead({
                    content: [
                        fn.tr({
                            data: {
                                key: 'img',
                            },
                            content: [
                                fn.th({
                                    content: cardHelper.getValue(this.card, 'img', 'label', 'txt', 'long') 
                                }),
                                fn.td({
                                    attributes: {
                                        colSpan: 4,
                                        contentEditable: true
                                    },
                                    data: {
                                        type: 'field'
                                    },
                                    content: cardHelper.getValue(this.card, 'img', 'field', 'txt')
                                })
                            ]
                        })
                    ]
                }),
                this.tbody
            ],
            events: {
                input: e => {
                    if (!e.target.contentEditable) {
                        return true;
                    }
                    // e.target.dataset.type = label|field
                    this.card.trigger(`${e.target.dataset.type}ContentChange`, {
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
                    const type = trigger.dataset.type; // label|field
                    domProps.toggle(type, row);
                    const value = domProps.get(type, row);
                    this.card.trigger(`${type}VisibilityChange`, {
                        key,
                        value
                    });
                }
            }
        })

        this.populateTbody();
        this.append(frame);
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
    CardForm.prototype.app = app;
    customElements.get('card-form') || customElements['define']('card-form', CardForm)
}

export default {
    register
}