import fn from 'fancy-node';
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js';
import {
    cardStore
} from '../../storage/storage.js';
import cardHelper from './card-helper.js';

class CardVerso extends HTMLElement {

    populateTbody(tbody) {
        tbody = fn.empty(tbody);
        for (let key of Object.keys(cardStore.get(`${this.card.cid}.fields`)).filter(e => !['img', 'name'].includes(e))) {
            tbody.append(this.buildRow(key));
        }
    }

    /**
     * Build a single `<tr>`
     * @param {String} key 
     * @returns 
     */
    buildRow(key) {
        const entries = {
            label: fn.th({
                content: cardHelper.getValue(this.card, key, 'label', 'txt', 'short')
            }),

            field: fn.td({
                content: cardHelper.getValue(this.card, key, 'field', 'txt')
            })
        }

        this.rowObj[key] = entries;

        const rowElem = fn.tr({
            data: {
                key,
                field: cardHelper.isVisible(this.card, key, 'field'),
                label: cardHelper.isVisible(this.card, key, 'label')
            },
            content: Object.values(entries)
        });

        return rowElem;
    }

    /**
     * Called on element launch
     */
    connectedCallback() {

        const badges = {
            name: fn.caption({
                classNames: ['badge'],
                content: cardHelper.getValue(this.card, 'name', 'field', 'txt')
            }),
            cr: fn.div({
                classNames: ['badge', 'cr'],
                content: cardHelper.getValue(this.card, 'cr', 'field', 'txt')
            })
        }

        const tbody = fn.tbody();
        const frame = fn.table({
            classNames: ['frame'],
            content: [
                badges.name,
                tbody
            ]
        })

        this.rowObj = {};

        this.populateTbody(tbody);

        this.append(frame, badges.cr);


        /**
         * repaint on field change
         */
         this.card.on('fieldContentChange', e => {
            if (Object.keys(badges).includes(e.detail.key)) {
                badges[e.detail.key].textContent = e.detail.value;
            }
            
            if (Object.keys(this.rowObj).includes(e.detail.key)) {
                this.rowObj[e.detail.key].field.textContent = e.detail.value;
            }
        })

        /**
         * repaint on label change
         */
         this.card.on('labelContentChange', e => {            
            if (Object.keys(this.rowObj).includes(e.detail.key)) {
                this.rowObj[e.detail.key].label.textContent = e.detail.value;
            }
        })

        // change of field visibility
        this.card.on('fieldVisibilityChange', e => {
            if (Object.keys(this.rowObj).includes(e.detail.key)) {
                this.rowObj[e.detail.key].field.parentElement.dataset.field = e.detail.value;
            }
        });

        // change of field visibility
        this.card.on('labelVisibilityChange', e => {
            if (Object.keys(this.rowObj).includes(e.detail.key)) {
                this.rowObj[e.detail.key].label.parentElement.dataset.label = e.detail.value;
            }
        });

        // repai
        this.card.on('afterOrderChange', e => {
            this.populateTbody(tbody);
        });
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
    CardVerso.prototype.app = app;
    customElements.get('card-verso') || customElements['define']('card-verso', CardVerso)
}

export default {
    register
}