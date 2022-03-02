import settings from '../../../modules/settings/settings.js';
import convertToRoman from '../../../modules/roman-numerals/roman-numerals.js';

/**
 * List of tabs (as objects, not DOM elements!)
 */
let tabList;

/**
 * Key of the user's collection in localStorage
 */
const lsKey = settings.get('storageKeys.tabs');

/**
 * Create a tab list if it doesn't exist
 */
const init = () => {
    tabList = tabList || read();
}

/**
 * Storage handling: read
 */
const read = () => {
    const stored = JSON.parse(localStorage.getItem(lsKey) || '{}');
    return Object.keys(stored).length ?
        stored :
        // ensure there is always at least one tab
        {
            1: blank()
        };
}

/**
 * Storage handling: write
 */
const write = () => {
    init();
    return localStorage.setItem(lsKey, JSON.stringify(tabList));
}

/**
 * Auto increment tab id (TID)
 * @returns {Number}
 */
const nextIncrement = () => {
    let keys = tabList ? Object.keys(tabList).map(e => parseInt(e)) : [];
    if(!keys.length){
        keys = [0];
    }
    return Math.max(...keys) + 1;
}

/**
 * Create data for a new tab (tid as in Tab ID)
 * @returns {{title, tid: {Integer}}}
 */
const blank = () => {
    const tid = nextIncrement();
    return {
        tid,
        title: convertToRoman(tid),
        styles: {}
    }
}

/**
 * Retrieve the TID from either a DOM tab or a {String|Number} TID 
 * @param {HTMLElement|Entry|String|Number} tidData 
 * @returns 
 */
const parseTid = tidData => {
    const tid = tidData.cid || tidData;
    if(isNaN(tid)){
        throw `${tid} is not a valid tab identifier`;
    }
    return parseInt(tid, 10);
}

/**
 * Retrieve an element from storage
 * @param {Sting='all'|HTMLElement|Entry|String|Number} data 
 * @returns 
 */
const get = data => {
    init();
    if (data === 'all') {
        return tabList;
    }
    if (!data) {
        return blank();
    }
    const tid = parseTid(data);
    return tabList[tid] ? tabList[tid] : blank();
}

/**
 * Add/overwrite an entry in the tabList and commit it to local storage
 * @param {HTMLElement|Entry|String|Number} tidData 
 * @param {Object} data  
 */
const set = (tidData, data) => {
    init();
    tabList[parseTid(tidData)] = data;
    write();
}

/**
 * Update an entry in the tabList and commit it to local storage
 * @param {HTMLElement|Entry|String|Number} tidData 
 * @param {String} key  
 * @param {Any} value 
 */
const update = (tidData, key, value) => {
    const tid = parseTid(tidData);
    const entry = get(tid);
    if (value === null) {
        delete entry[key];
    } else {
        entry[key] = value;
    }
    set(tid, entry);
}

/**
 * Remove an entry from the list
 * @param {HTMLElement|Entry|String|Number} tidData 
 */
const remove = tidData => {
    init();
    delete tabList[parseTid(tidData)];
    write();
}

export default {
    get,
    set,
    update,
    remove,
    parseTid
}