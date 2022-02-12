import fn from 'fancy-node';
import characterMap from '../character-library/character-map.js';
import properties from '../../../modules/properties/properties.js';

/**
 * Custom element containing the list of patterns
 */
class CardBase extends HTMLElement {

    /**
     * Assign an event to the ui
     * @param {String} type
     * @param {Function} action
     */
    on(type, action) {
        this.addEventListener(type, action);
    }

    /**
     * Fire an event from the ui
     * @param {String } type
     * @param {*} data
     */
    trigger(type, data) {
        this.dispatchEvent(data ? new CustomEvent(type, {
            detail: data
        }) : new Event(type));
    }

    /**
     * Called on element launch
     */
    connectedCallback() {

        ['recto', 'verso', 'form', 'toolbar'].forEach(view => {
            this[view] = document.createElement(`card-${view}`);
            this[view].card = this;
        })

        const cardInner = fn.article({
            content: [
                fn.div({
                    classNames: ['card-view'],
                    content: [
                        this.recto,
                        this.verso
                    ]
                }),
                this.form,
                this.toolbar
            ]
        })

        this.append(cardInner);

        /**
         * Update model and local storage
         */
        this.on('contentChange', function (e) {
            const section = e.detail.field === 'text' ? 'props' : 'labels';
            this.character[section][e.detail.key] = e.detail.value;
            characterMap.set('user', this.character.meta.cid, this.character);
        })

        this.on('visibilityChange', function (e) {
            this.character.meta.visibility[e.detail.key][e.detail.field] = e.detail.value;
            characterMap.set('user', this.character.meta.cid, this.character);
            this.trigger('afterVisibilityChange');
        });

        this.on('orderChange', function (e) {
            console.log(e.detail)
            let props = {};
            e.detail.order.forEach(key => {
                props[key] = this.character.props[key];
            })
            this.character.props = props;
            characterMap.set('user', this.character.meta.cid, this.character);
            this.trigger('afterOrderChange');
        });

        this.on('characterRemove', function (e) {
            characterMap.remove('user', this.character.meta.cid);
            this.remove();
        })

        this.on('characterEdit', function (e) {
            properties.set('cardState', 'edit');
            this.classList.add('editable');
        })

        this.on('characterDone', function (e) {
            properties.unset('cardState');
            this.classList.remove('editable');
        })
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
    customElements.get('card-base') || customElements['define']('card-base', CardBase)
}

export default {
    register
}