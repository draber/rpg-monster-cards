/**
 * Set either a data property
 * @param {String} key
 * @param {String|Number|Boolean} value
 * @param {HTMLElement} [target]
 */
const set = (key, value, target) => {
    target = target || document.body;
    target.dataset[key] = value;
}
/**
 * Retrieve either a data property
 * @param {String} key
 * @param {HTMLElement} [target]
 * @returns {String|Number|Boolean}
 */
const get = (key, target) => {
    target = target || document.body;
    if (typeof target.dataset[key] === 'undefined') {
        return false;
    }
    return JSON.parse(target.dataset[key]);
}

/**
 * Toggle between two booleans
 * @param {String} key
 * @param {HTMLElement} target
 */
const toggle = (key, target) => {
    set(key, !get(key, target), target);
}

/**
 * Remove either a data property
 * @param {String} key
 * @param {HTMLElement} [target]
 * @returns {String|undefined}
 */
const unset = (key, target) => {
    target = target || document.body;
    delete target.dataset[key];
}

export default {
    unset,
    get,
    set,
    toggle
}
