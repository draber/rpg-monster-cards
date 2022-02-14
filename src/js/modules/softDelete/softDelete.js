import fn from 'fancy-node';
import properties from '../properties/properties.js';

const toast = fn.$('#toast');

const softDelete = (element, label) => {
    properties.set('softDeleted', true, element);
    const dialog = document.createElement('undo-dialog');
    dialog.element = element;
    if(label) {
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

export default softDelete;
