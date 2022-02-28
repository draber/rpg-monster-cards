import settings from '../../../modules/settings/settings.js';

/**
 * Download characters and provide them to other parts of the site.
 * User build characters are handled in local storage.
 */

/**
 * Key of the user's collection in localStorage
 */
const lsKey = settings.get('storageKeys.cards');

/**
 * `system` stands for data from `public/js/characters.json`
 * `user` stands for characters create or modified by the user
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
    cid = parseCid(cid);
    data[type][cid] = character;
    if (type === 'user') {
        storage.update();
    }
}

/**
 * Equivalent of Map.get()
 * 
 * @param {String} type system|user
 * @param {HTMLElement|Entry|String|Number} cidData
 * @returns {Object} character data
 */
const get = (type, cidData) => {
    const cid = parseCid(cidData);
    return data[type][cid];
}

/**
 * Retrieve the CID from either a DOM card or character or a {String|Number} CID 
 * @param {HTMLElement|Entry|String|Number} data 
 * @returns 
 */
const parseCid = data => {
    let cid;
    switch (true) {
        case !!data.cid:
            cid = data.cid;
            break;
        case !!(data.meta && data.meta.cid):
            cid = data.meta.cid;
            break;
        default:
            cid = data;

    }
    if(isNaN(cid)){
        throw `${cid} is not a valid character identifier`;
    }
    return parseInt(cid, 10);
}

/**
 * Update an entry in the tabList and commit it to local storage
 * @param {HTMLElement|Entry|String|Number} cidData 
 * @param {String} key  
 * @param {Any} value 
 */
 const update = (type, cidData, key, value) => {
    const cid = parseCid(cidData);
    const character = get(type, cidData);
    if (value === null) {
        delete character[key];
    } else {
        character[key] = value;
    }
    set(type, cid, character);
}

/**
 * Get all data from either system or user
 * @param {String} type system|user
 * @returns {Object}
 */
const getAllByType = type => {
    return data[type];
}

/**
 * Equivalent of Map.delete()
 * 
 * @param {String} type system|user
 * @param {HTMLElement|Entry|String|Number} cidData
 * @returns {Boolean} whether the cid existed prior to deletion
 */
const remove = (type, cidData) => {
    const cid = parseCid(cidData);
    delete data[type][cid];
    if (type === 'user') {
        storage.update();
    }
}

/**
 * Get next key for data insertion
 * System CID start at 0, user CID at 5000
 * 
 * @param {String} type system|user
 * @returns {Integer}
 */
const nextIncrement = type => {
    const lowest = type === 'system' ? 0 : 5000;
    return Math.max(...[lowest].concat(Object.keys(data[type]))) + 1;
}

/**
 * Fetch characters from both localStorage and server and add them to `data`.
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
    update,
    remove,
    parseCid,
    values,
    nextIncrement,
    getAllByType
}