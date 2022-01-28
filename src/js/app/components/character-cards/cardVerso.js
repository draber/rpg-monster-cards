import fn from 'fancy-node';
import labels from '../../../../data/labels.json';

class CardVerso extends HTMLElement {

    isRecto(key) {
        return ['img', 'name'].includes(key);
    }

    tpl() {
        const tpl = `
        <figure class="𝔈𝔦𝔤𝔢𝔫𝔱ü𝔪𝔩𝔦𝔠𝔥𝔨𝔢𝔦𝔱𝔢𝔫">
            <table></table>
            <div class="badge cr">${this.character.cr}</div>
            <figcaption class="badge">${this.character.name}</figcaption>
        </figure>`;

        return fn.toNode(tpl);
    }


    icon(key, type) {
        const icon = this.display(key, type) ? 'show' : 'hide';
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
                        href: `media/icons.svg#icon-${icon}`
                    }
                })
            ]
        })
    }

    display(key, type) {
        return this.isRecto(key) ? 'immutable' : this.meta.visibility[key][type];
    }

    label(key) {
        return labels[key].short;
    }

    row(key, value) {
        return fn.tr({
            data: {
                display: this.display(key, 'card'),
                key
            },
            content: [
                // label row
                fn.th({
                    data: {
                        display: this.display(key, 'label'),
                    },
                    content: this.label(key)
                }),
                // text row
                fn.td({
                    content: value
                }),
                // icon row
                fn.td({
                    content: (() => {
                        return this.isRecto(key) ? '' : [
                            this.icon(key, 'label'),
                            this.icon(key, 'card')
                        ]
                    })()
                }),
            ]
        });
    }

    /**
     * Called on element launch
     */
    connectedCallback() {

        if (!this.character) {
            throw Error(`Missing property "character" on <card-verso> element`);
        }
        if (!this.meta) {
            throw Error(`Missing property "meta" on <card-verso> element`);
        }

        const template = this.tpl();
        const tbl = fn.$('table', template);

        for (let [key, value] of Object.entries(this.character)) {
            if (['img', 'name'].includes()) {
                continue;
            }
            tbl.append(this.row(key, value));
        }


        this.append(template);
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