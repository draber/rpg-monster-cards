const trigger = (type, data, target) => {
    (target || document.body).dispatchEvent(data ? new CustomEvent(type, {
        detail: data
    }) : new Event(type));
}

/**
 * Adds one or more event listeners to an element 
 * @param {Array|String} types 
 * @param {Function} action 
 * @param {HTMLElement} target 
 */
const on = (types, action, target) => {
    if (typeof types === 'string') {
        types = [types];
    }
    types.forEach(type => {
        (target || document.body).addEventListener(type, action);
    })
}

export default {
    trigger,
    on
}