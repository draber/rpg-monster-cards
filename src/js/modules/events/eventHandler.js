/**
 * Assign one or more events to an element
 * @param {String} types
 * @param {Function} action
 */
export const on = function(types, action)  {
    if (typeof types === 'string') {
        types = [types];
    }
    types.forEach(type => {
        this.addEventListener(type, action);
    });
}

/**
 * Fire one or more events from an element
 * @param {String } types
 * @param {*} data
 */
export const trigger = function(types, data)  {
    if (typeof types === 'string') {
        types = [types];
    }
    types.forEach(type => {
        this.dispatchEvent(data ? new CustomEvent(type, {
            detail: data
        }) : new Event(type));
    });
}
