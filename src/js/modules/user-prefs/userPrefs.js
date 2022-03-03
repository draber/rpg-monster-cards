import Tree from '../tree/Tree.js';
import settings from '../settings/settings.js';

const lsKey = settings.get('storageKeys.user');

const userPrefs = new Tree({
    data: JSON.parse(localStorage.getItem(lsKey) || {}),
    lsKey
})

export default userPrefs;