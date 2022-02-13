import settings from '../../../modules/settings/settings.js';

/**
 * Download characters and provide them to other parts of the site.
 * User build characters are handled in local storage.
 * 
 * The module uses a stack of two Maps that are accessed in the same way as regular maps with
 * two notable differences:
 * - All methods need the type argument (= system|user) as the first argument
 * - The user map is additionaly stored in localStorage
 * 
 */

/**
 * Key of the user's collection in localStorage
 */
const lsKey = settings.get('storageKeys.cards');

/**
 * The two-level Map
 */
const data = {
    system: {},
    user: {}
}

/**
 * Storage handling
 */
const storage = {
    read: () => {
        return JSON.parse(localStorage.getItem(lsKey) || '{}')
    },
    update: () => {
        return localStorage.setItem(lsKey, JSON.stringify(data.user || {}))
    }
}

const values = type => {
    return Object.values(data[type]);
}

/**
 * Equivalent of Map.set()
 * 
 * @param {String} type system|user
 * @param {Integer} cid
 * @param {Object} character character data
 */
const set = (type, cid, character) => {
    data[type][cid] = character;
    if (type === 'user') {
        storage.update();
    }
}

/**
 * Equivalent of Map.get()
 * 
 * @param {String} type system|user
 * @param {Integer} cid
 * @returns {Object} character data
 */
const get = (type, cid) => {
    return data[type][cid];
}

const getAllByType = type => {
    return data[type];
}

/**
 * Equivalent of Map.delete() (variables can't be name `delete`)
 * 
 * @param {String} type system|user
 * @param {Integer} cid
 * @returns {Boolean} whether the cid existed prior to deletion
 */
const remove = (type, cid) => {
    delete data[type][cid];
    if (type === 'user') {
        storage.update();
    }
}


/**
 * Get next key for data insertion
 * System IDs start at 0, user IDs at 5000
 * 
 * @param {String} type system|user
 * @returns {Integer}
 */
const nextIncrement = type => {
    const lowest = type === 'system' ? 0 : 5000;
    return Math.max(...[lowest].concat(Object.keys(data[type]))) + 1;
}

/**
 * Fetch characters from both localStorage and server and add them to the Maps.
 * Note the form in which the characters from the server are added to the Map.
 * 
 * @returns {Promise} 
 */
const init = () => {
    data.user = storage.read();

    return (fetch('js/characters.json')
        .then(response => response.json())
        .then(data => {
            data.forEach((props, cid) => {
                set('system', cid, {
                    meta: {
                        cid,
                        origin: 'system'
                    },
                    props
                });
            });
        }));
}

export default {
    init,
    get,
    set,
    remove,
    values,
    nextIncrement,
    getAllByType
}