import fn from 'fancy-node';

/**
 * Custom element containing the list of fonts
 */
class CardRecto extends HTMLElement {

    /**
     * Called on element launch
     */
    connectedCallback() {

        const frame = fn.figure({
            classNames: ['frame']
        })

        const entries = {
            img: fn.img({
                attributes: {
                    src: this.card.character.props.img
                }
            }),
            name: fn.figcaption({
                classNames: ['badge'],
                content: this.card.character.props.name
            })
        }

        for (let element of Object.values(entries)) {
            frame.append(element);
        }

        /**
         * repaint on content change
         */
        this.card.on('contentChange', e => {
            const x = {
                p: 'recto',
                k: e.detail.key,
                t: e.detail.type,
                v: e.detail.value
            }
            const prop = e.detail.key === 'img' ? 'src' : 'textContent'
            if(entries[e.detail.key]) {
                entries[e.detail.key][prop] = e.detail.value;
            }
        })

        this.append(frame)
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
    customElements.get('card-recto') || customElements['define']('card-recto', CardRecto)
}

export default {
    register
}