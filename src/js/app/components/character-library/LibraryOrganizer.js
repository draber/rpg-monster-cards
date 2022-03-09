import fn from 'fancy-node';
import visibility from '../../../../data/visibility.json';
import {
    prefStore,
    labelStore
} from '../../storage/storage';
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js'

/**
 * Custom HTM element to select a group to oder the library by
 */
class LibraryOrganizer extends HTMLElement {


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
        this.on('pointerdown', e => {
            if (e.button !== 0) {
                return true;
            }
            const li = e.target.closest('li');
            if (!li) {
                return false;
            }
            prefStore.set('characters.groupBy', li.dataset.groupBy);
            this.app.trigger('characterOrderChange', {
                groupBy: li.dataset.groupBy
            })
        })

        this.groupBy = prefStore.get('characters.groupBy') || this.groupBy || 'name';

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
            content: 'Order library by:'
        })
        const list = fn.ul();
        box.append(title, list);

        for (let [key, value] of labelStore.entries()) {
            if (!visibility[key].group) {
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
        self.on = on;
        self.trigger = trigger;
        return self;
    }
}

const register = app => {
    LibraryOrganizer.prototype.app = app;
    customElements.get('library-organizer') || customElements['define']('library-organizer', LibraryOrganizer)
}

export default {
    register
}