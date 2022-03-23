import {
    presetStore,
    cardStore
} from '../../storage/storage.js';
import idHelper from '../../storage/id-helper.js';

/**
 * Get the path to a card property
 * @param {HTMLElement|Entry|String|Number} cidData
 * @param {String} key something like `cr`
 * @param {String} type label|field
 * @param {String} prop txt|vis
 * @param {String} [version] short|long, defaults to short
 * @returns 
 */
function getCardPath(cidData, key, type, prop, version = 'short') {
    let cid = idHelper.toCid(cidData);
    return prop === 'txt' && type === 'label' ?
        `${cid}.fields.${key}.${type}.${prop}.${version}` :
        `${cid}.fields.${key}.${type}.${prop}`
}

/**
 * Get the path to a preset property, applicable for cards only
 * @param {String} key something like `cr`
 * @param {String} type label|field
 * @param {String} prop txt|vis
 * @param {String} [version] short|long, defaults to short
 * @returns 
 */
function getPresetPath(key, type, prop, version = 'short') {
    return prop === 'txt' && type === 'label' ?
        `cards.${key}.${type}.${prop}.${version}` :
        `cards.${key}.${type}.${prop}`
}

/**
 * Check if a part is visible or not
 * @param {HTMLElement|Entry|String|Number} cidData 
 * @param {String} key 
 * @param {String} type label|field
 * @returns 
 */
function isVisible(cidData, key, type) {
    let cid = idHelper.toCid(cidData)
    // allow only keys that are known to the presets
    if (!cardStore.has(`${cid}.fields.${key}`) && !presetStore.has(`cards.${key}`)) {
        return false;
    }
    // return false, when a field has no text
    if(type === 'field' && !getCardValue(cid, key, type, 'txt')){
        return false;
    }
    // check if the card has a value set
    const cardVis = getCardValue(cid, key, type, 'vis');
    if(typeof cardVis !== 'undefined'){
        return cardVis
    }
    // fall back to preset
    return getPresetValue(key, type, 'vis');
}

/**
 * Retrieve a value that is stored in the card
 * @param {HTMLElement|Entry|String|Number} cidData 
 * @param {String} key 
 * @param {String} type label|field
 * @param {String} prop txt|vis
 * @param {String} [version] short|long which label to return, short by default
 * @returns {String|undefined}
 */
function getCardValue(cidData, key, type, prop, version = 'short') {
    let cid = idHelper.toCid(cidData);
    return type === 'label' && prop === 'txt' ?
        cardStore.get(getCardPath(cid, key, type, prop, version)) :
        cardStore.get(getCardPath(cid, key, type, prop));
}

/**
 * Retrieve the default value for an entry
 * @param {String} key 
 * @param {String} type label|field
 * @param {String} prop txt|vis
 * @param {String} [version] short|long which label to return, short by default
 * @returns 
 */
function getPresetValue(key, type, prop, version = 'short') {
    return type === 'label' && prop === 'txt' ?
        presetStore.get(getPresetPath(key, type, prop, version)) :
        presetStore.get(getPresetPath(key, type, prop));
}

/**
 * Retrieve the text portions of an entry
 * @param {HTMLElement|Entry|String|Number} cidData 
 * @param {String} key 
 * @param {String} type label|field
 * @param {String} prop txt|vis
 * @param {String} [version] short|long which label to return, short by default
 * @returns 
 */
function getValue(cidData, key, type, prop, version = 'short') {
    const cardValue = getCardValue(cidData, key, type, prop, version);
    const presetValue = getPresetValue(key, type, prop, version);
    // undefined means card value isn't set
    // '' means it has been set to empty deliberately
    return typeof cardValue !== 'undefined' ? cardValue : presetValue;
}

export default {
    isVisible,
    getValue,
    getCardPath,
    getPresetPath,
    getPresetValue,
    getCardValue
}