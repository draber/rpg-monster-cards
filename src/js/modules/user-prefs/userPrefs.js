import settings from '../settings/settings.js';

const lsKey = settings.get('storageKeys.user');

settings.set('userPrefs', JSON.parse(localStorage.getItem(lsKey) || '{}'));

const getAll = () => {
    return settings.get(`userPrefs`);
}

const get = key => {    
    return settings.get(`userPrefs.${key}`);
}

const set = (key, value) => {    
    settings.set(`userPrefs.${key}`, value);
    localStorage.setItem(lsKey, JSON.stringify(getAll()));
    return true;
}

export default {
    getAll,
    get,
    set
}