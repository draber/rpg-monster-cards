import fn from 'fancy-node';

class CardVerso extends HTMLElement {

    isVisible(key, type) {
        return this.card.character.meta.visibility[key][type] && !!this.card.character.props[key];
    }

    populateTbody(tbody) {
        tbody = fn.empty(tbody);
        for (let key of Object.keys(this.card.character.props).filter(prop => !['img', 'name'].includes(prop))) {
            tbody.append(this.buildRow(key));
        }
    }

    buildRow(key) {
        const entries = {
            label: fn.th({
                content: this.card.character.labels[key]
            }),

            text: fn.td({
                content: this.card.character.props[key]
            })
        }

        this.rows[key] = entries;

        const row = fn.tr({
            data: {
                key,
                card: this.isVisible(key, 'card'),
                label: this.isVisible(key, 'label')
            },
            content: Object.values(entries)
        });

        return row;
    }

    /**
     * Called on element launch
     */
    connectedCallback() {

        const entries = {
            name: fn.caption({
                classNames: ['badge'],
                content: this.card.character.props.name
            }),
            cr: fn.div({
                classNames: ['badge', 'cr'],
                content: this.card.character.props.cr
            })
        }

        const tbody = fn.tbody();
        const frame = fn.table({
            classNames: ['frame'],
            content: [
                entries.name,
                tbody
            ]
        })

        this.rows = {};

        this.populateTbody(tbody);

        this.append(frame, entries.cr);

        /**
         * repaint on content change
         */
        this.card.on('contentChange', e => {
            if (Object.keys(entries).includes(e.detail.key) && e.detail.field === 'text') {
                entries[e.detail.key].textContent = e.detail.value;
            }

            if (Object.keys(this.rows).includes(e.detail.key)) {
                this.rows[e.detail.key][e.detail.field].textContent = e.detail.value;
            }
        })

        this.card.on('afterOrderChange', e => {
            this.populateTbody(tbody);
        });

        this.card.on('visibilityChange', e => {
            if (Object.keys(this.rows).includes(e.detail.key)) {
                this.rows[e.detail.key].text.parentElement.dataset[e.detail.field] = e.detail.value;
            }
        });
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