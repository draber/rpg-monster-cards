import fn from 'fancy-node';
import visibility from '../../../../data/visibility.json';
import labels from '../../../../data/labels.json';
import events from '../../../modules/events/events.js';
import userPrefs from '../../../modules/user-prefs/userPrefs.js';

/**
 * Custom HTM element to select a group to oder the library by
 */
class CharacterSorter extends HTMLElement {


    /**
     * Map attribute and property, getter for 'group by'
     * @returns {string}
     */
    get groupBy() {
        return this.getAttribute('groupby');
    }

    /**
     * Map attribute and property, setter for 'group by'
     * @param value
     */
    set groupBy(value) {
        this.setAttribute('groupby', value);
    }

    /**
     * Called on element launch
     */
    connectedCallback() {

        /**
         * On click provide a the new criteria to group by
         */
        this.addEventListener('pointerdown', e => {
            if(e.button !== 0){
                return true;
            }
            const li = e.target.closest('li');
            if (!li) {
                return false;
            }
            userPrefs.set('characters.groupBy', li.dataset.groupBy);
            events.trigger('characterOrderChange', {
                groupBy: li.dataset.groupBy
            })
        })

        this.groupBy = userPrefs.get('characters.groupBy') || this.groupBy || 'name';

        const icon = fn.svg({
            isSvg: true,
            content: fn.use({
                isSvg: true,
                attributes: {
                    href: 'media/icons.svg#icon-sort'
                }
            })
        })

        const box = fn.div({
            classNames: ['sort-box']
        })
        const title = fn.h3({
            content: 'Order by:'
        })
        const list = fn.ul();
        box.append(title, list);

        for (let [key, value] of Object.entries(labels)) {
            if(!visibility[key].group){
                continue;
            }
            let classNames = key === this.groupBy ? ['active'] : [];
            list.append(fn.li({
                classNames,
                content: value.group,
                data: {
                    groupBy: key
                }
            }))
        }

        this.append(icon, box);
    }
    constructor(self) {
        self = super(self);
        return self;
    }
}

const register = () => {
    customElements.get('character-sorter') || customElements['define']('character-sorter', CharacterSorter)
}

export default {
    register
}