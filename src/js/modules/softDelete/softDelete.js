import fn from 'fancy-node';
import domProps from '../dom-props/dom-props.js';

/**
 * Container for soft delete messages
 */
let toast;

/**
 * Initiate a soft deletion proecess
 * @param {HTMLElement} element 
 * @param {String} label text dispayed on the deletion message
 * @returns 
 */
const initiate = (element, label) => {
    // create a toast if it doesn't exist
    if (!toast) {
        toast = fn.div({
            data: {
                undoDialogs: true
            }
        })
        document.body.append(toast);
    }
    // mark the element as soft deleted. I's no longer displayed but still in its place
    domProps.set('softDeleted', true, element);
    // create the pop-up
    const dialog = document.createElement('undo-dialog');
    dialog.element = element;
    if (label) {
        dialog.label = label;
    }
    toast.append(dialog);

    return new Promise(resolve => {
        // either restore or hard delete the element
        dialog.on('restore', e => {
            domProps.unset('softDeleted', element);
            resolve({
                action: 'restore',
                element: e.detail.element
            })
        })
        dialog.on('remove', e => {
            resolve({
                action: 'remove',
                element: e.detail.element
            })
        })
    })
}

/**
 * Empty the toast
 */
const cancel = () => {
    if (toast) {
        toast = fn.empty(toast);
    }
}

export default {
    initiate,
    cancel
};