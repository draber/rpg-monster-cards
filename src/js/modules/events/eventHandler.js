/**
 * Assign an event to the ui
 * @param {String} type
 * @param {Function} action
 */
export const on = function(type, action)  {
    this.addEventListener(type, action);
}

/**
 * Fire an event from the ui
 * @param {String } type
 * @param {*} data
 */
export const trigger = function(type, data)  {
    this.dispatchEvent(data ? new CustomEvent(type, {
        detail: data
    }) : new Event(type));
}