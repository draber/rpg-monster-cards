import fn from 'fancy-node';
import properties from '../properties/properties.js';

let toast;

const initiate = (element, label) => {
    if (!toast) {
        toast = fn.div({
            data: {
                undoDialogs: true
            }
        })
        document.body.append(toast);
    }
    properties.set('softDeleted', true, element);
    const dialog = document.createElement('undo-dialog');
    dialog.element = element;
    if (label) {
        dialog.label = label;
    }
    toast.append(dialog);

    return new Promise(resolve => {
        dialog.on('restore', e => {
            properties.unset('softDeleted', element);
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

const cancel = () => {
    if (toast) {
        toast = fn.empty(toast);
    }
}

export default {
    initiate,
    cancel
};