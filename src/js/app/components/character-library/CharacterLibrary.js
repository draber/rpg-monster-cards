import fn from 'fancy-node';
import characterProvider from './character-provider.js';
import userPrefs from '../../../modules/user-prefs/userPrefs.js';
import characterStorage from './character-storage.js';
import settings from '../../../modules/settings/settings.js';
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js'

/**
 * Custom element containing the list of characters
 */
class CharacterLibrary extends HTMLElement {

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
     * Map attribute and property, getter for 'sort by'
     * @returns {string}
     */
    get sortBy() {
        return this.getAttribute('sortby');
    }

    /**
     * Map attribute and property, getter for 'sort by'
     * @param value
     */
    set sortBy(value) {
        this.setAttribute('sortby', value);
    }


    /**
     * Map attribute and property, getter for 'group order direction'
     * @returns {string}
     */
    get groupDir() {
        return this.getAttribute('groupdir');
    }

    /**
     * Map attribute and property, setter for 'group order direction'
     * @param value
     */
    set groupDir(value) {
        this.setAttribute('groupdir', value);
    }

    /**
     * Map attribute and property, getter for 'sort order direction'
     * @returns {string}
     */
    get sortDir() {
        return this.getAttribute('sortdir');
    }

    /**
     * Map attribute and property, setter for 'sort order direction'
     * @param value
     */
    set sortDir(value) {
        this.setAttribute('sortdir', value);
    }

    populate() {

        const characterList = new DocumentFragment();

        const groupContainers = [];
        let firstGroupClassNames = [];

        /**
         * Sorted and grouped list of characters
         * @type {Object}
         */
        const systemCollection = Object.values(characterProvider.getSortedCharacters('system', this));
        const userCollection = Object.values(characterProvider.getSortedCharacters('user', {
            groupBy: '__user',
            sortBy: 'name'
        }))

        let collection = systemCollection;

        if (settings.get('userCharacters.inLibrary') && userCollection.length) {
            // collection = userCollection.concat(systemCollection);

            // // mark the first group
            // firstGroupClassNames = ['user-generated'];
        }

        collection.forEach((values, index) => {

            /**
             * List of characters per group
             */
            let list = fn.ul();

            /**
             * Build a `<details>` element for each group
             */
            let groupContainer = fn.details({

                classNames: index === 0 ? firstGroupClassNames : [],
                attributes: {
                    open: index === 0
                },
                content: [
                    fn.summary({
                        content: values[0].meta._groupLabel,
                        attributes: {
                            title: values[0].meta._groupLabel
                        }
                    }),
                    list
                ],
                events: {
                    toggle: e => {
                        if (e.target.open) {
                            groupContainers.forEach(container => {
                                if (container.isSameNode(e.target)) {
                                    return true;
                                }
                                container.open = false;
                            })
                        }
                    }
                }
            })

            characterList.append(groupContainer);
            groupContainers.push(groupContainer);

            /**
             * Add the characters to their respective list
             */
            values.forEach(value => {
                list.append(fn.li({
                    content: value.props.name,
                    attributes: {
                        title: value.props.name
                    },
                    data: {
                        cid: value.meta.cid
                    }
                }))
            })
        })


        fn.empty(this).append(characterList);
    }

    /**
     * Called on element launch
     */
    connectedCallback() {

        /**
         * On click provide a copy of the requested character
         */
        this.on('pointerdown', e => {
            if (e.button !== 0) {
                return true;
            }
            const li = e.target.closest('li');
            if (!li) {
                return false;
            }
            this.app.trigger('characterSelection', (() => {
                const type = li.closest('details').classList.contains('user-generated') ? 'user' : 'system';
                const entry = characterStorage.get(type, parseInt(li.dataset.cid, 10));
                entry.meta._groupLabel && delete entry.meta._groupLabel;
                entry.meta._groupValue && delete entry.meta._groupValue;
                return entry;
            })());
        })

        /**
         * Set some healthy defaults
         */
        this.sortBy = userPrefs.get('characters.sortBy') || this.sortBy || 'name';
        this.groupBy = userPrefs.get('characters.groupBy') || this.groupBy || 'name';
        this.sortDir = userPrefs.get('characters.sortDir') || this.sortDir || 'asc';
        this.groupDir = userPrefs.get('characters.groupDir') || this.groupDir || 'asc';

        this.populate();
    }

    constructor(self) {
        self = super(self);
        self.on = on;
        self.trigger = trigger;
        /**
         * React to changes in grouping, sort order etc. and refresh the tree
         */
        self.app.on('characterOrderChange', e => {
            ['sortBy', 'groupBy', 'sortDir', 'groupDir'].forEach(crit => {
                if (e.detail[crit]) {
                    self[crit] = e.detail[crit];
                }
            })
            self.populate();
        })

        return self;
    }
}

/**
 * Register the element type to the DOM
 */
const register = app => {
    // add app as property
    CharacterLibrary.prototype.app = app;
    customElements.get('character-library') || customElements['define']('character-library', CharacterLibrary)
}

export default {
    register
}