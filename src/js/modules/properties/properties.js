/**
 * All native style properties
 * @type {string[]}
 */
const styles = Array.from(getComputedStyle(document.body));

/**
 * Find out if a property is a style or something else
 * This is not bulletproof and will fail if you want to set something like data-width!
 * @param {String} key
 * @returns {Boolean}
 */
const isStyleProp = key => {
    // consider custom CSS properties
    return key.startsWith('--') || styles.includes(key);
}

/**
 * Set either a data property or a style property
 * @param {String} key
 * @param {String|Number|Boolean} value
 * @param {HTMLElement} [target]
 */
const set = (key, value, target) => {
    target = target || document.body;
    if (isStyleProp(key)) {
        return target.style.setProperty(key, value);
    }
    target.dataset[key] = value;
}
/**
 * Retrieve either a data property or a style property
 * @param {String} key
 * @param {HTMLElement} [target]
 * @returns {String|Number|Boolean}
 */
const get = (key, target) => {
    target = target || document.body;
    if (isStyleProp(key)) {
        return JSON.parse(target.style.getPropertyValue(key));
    }
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
 * Remove either a data property or a style property
 * @param {String} key
 * @param {HTMLElement} [target]
 * @returns {String|undefined}
 */
const unset = (key, target) => {
    target = target || document.body;
    if (isStyleProp(key)) {
        return target.style.removeProperty(key);
    }
    delete target.dataset[key];
}

export default {
    unset,
    get,
    set,
    toggle
}
