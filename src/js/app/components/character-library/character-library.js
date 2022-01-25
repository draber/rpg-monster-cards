import fn from 'fancy-node';
import characterProvider from './character-provider.js';
import events from '../../../modules/events/events.js';
import userPrefs from '../../../modules/user-prefs/userPrefs.js';

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

        /**
         * Sorted and grouped list of characters
         * @type {Object}
         */
        const characters = Object.values(characterProvider.getSortedCharacters(this));

        let counter = 0;

        characters.forEach(values => {

            /**
             * List of characters per group
             */
            let list = fn.ul();

            /**
             * Build a `<details>` element for each group
             */
            characterList.append(fn.details({
                attributes: {
                    open: counter === 0
                },
                content: [
                    fn.summary({
                        content: values[0]._groupLabel,
                        attributes: {
                            title: values[0]._groupLabel
                        }
                    }),
                    list
                ]
            }))
            
            /**
             * Add the characters to their respective list
             */
            values.forEach(value => {
                list.append(fn.li({
                    content: value.name,
                    attributes: {
                        title: value.name
                    }
                }))
            })
            counter++;
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
        this.addEventListener('pointerdown', e => {
            if(e.button !== 0){
                return true;
            }
            const li = e.target.closest('li');
            if (!li) {
                return false;
            }
            events.trigger('characterSelection', characterProvider.getSingleCharacter('name', li.textContent))
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

        /**
         * Listen to changes in grouping, sort order etc. and refresh the tree
         */
        events.on('characterOrderChange', e => {
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
const register = () => {
    customElements.get('character-library') || customElements['define']('character-library', CharacterLibrary)
}

export default {
    register
}