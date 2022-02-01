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
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 */

/**
 * Key of the user's collection in localStorage
 */
const lsKey = settings.get('storageKeys.cards');

/**
 * The two-level Map
 */
const data = {
    system: new Map(),
    user: new Map()
}

/**
 * Storage handling
 */
const storage = {
    read: () => {
        return JSON.parse(localStorage.getItem(lsKey) || '[]')
    },
    update: () => {
        return localStorage.setItem(lsKey, JSON.stringify(valueArray('user') || []))
    }
}

/**
 * Equivalent of Map.set()
 * 
 * @param {String} type system|user
 * @param {Integer} cid
 * @param {Object} value character data
 * @returns {Map}
 */
const set = (type, cid, value) => {
    const retVal = data[type].set(cid, value);
    if (type === 'user') {
        storage.update();
    }
    return retVal;
}

/**
 * Equivalent of Map.get()
 * 
 * @param {String} type system|user
 * @param {Integer} cid
 * @returns {Object} character data
 */
const get = (type, cid) => {
    return data[type].get(cid);
}

/**
 * Equivalent of Map.delete() (variables can't be name `delete`)
 * 
 * @param {String} type system|user
 * @param {Integer} cid
 * @returns {Boolean} whether the cid existed prior to deletion
 */
const remove = (type, cid) => {
    const retVal = data[type].delete(cid);
    if (type === 'user') {
        storage.update();
    }
    return retVal;
}

/**
 * Equivalent of Map.has()
 * 
 * @param {String} type system|user
 * @param {Integer} cid
 * @returns {Boolean} whether the cid exists
 */
const has = (type, cid) => {
    return data[type].has(cid);
}

/**
 * Equivalent of Map.keys()
 * 
 * @param {String} type system|user
 * @returns {Iterator} over Map keys
 */
const keys = type => {
    return data[type].keys();
}

/**
 * Map key as array
 * 
 * @param {String} type system|user
 * @returns {Array} Map key
 */
const keyArray = type => {
    return [...data[type].keys()];
}

/**
 * Equivalent of Map.values()
 * 
 * @param {String} type system|user
 * @returns {Iterator} over Map values
 */
const values = type => {
    return data[type].values();
}

/**
 * Map values as array
 * 
 * @param {String} type system|user
 * @returns {Array} Map values
 */
const valueArray = type => {
    return [...data[type].values()];
}

/**
 * Equivalent of Map.entries()
 * 
 * @param {String} type system|user
 * @returns {Iterator} over Map values
 */
const entries = type => {
    return data[type].entries();
}

/**
 * Get next key for data insertion
 * 
 * @param {String} type system|user
 * @returns {Integer}
 */
const nextIncrement = type => {
    return Math.max(...[0].concat(keyArray(type))) + 1;
}

/**
 * Fetch characters from both localStorage and server and add them to the Maps.
 * Note the form in which the characters from the server are added to the Map.
 * 
 * @returns {Promise} 
 */
const init = () => {
    storage.read().forEach((entry, index) => {
        set('user', index, entry);
    })
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
    has,
    keys,
    keyArray,
    values,
    valueArray,
    entries,
    nextIncrement
}