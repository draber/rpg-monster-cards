import config from '../../../config/config.json';

const prefs = JSON.parse(localStorage.getItem(config.storageKeys.user) || '{}');

const get = key => {    
    return prefs[key];
}

const set = (key, value) => {    
    prefs[key] = value;
    localStorage.setItem(config.storageKeys.user, JSON.stringify(prefs));
    return prefs[key];
}

const getAll = () => {
    return prefs;
}

export default {
    getAll,
    get,
    set
}