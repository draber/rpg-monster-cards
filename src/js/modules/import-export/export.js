import dataUri from "../data-uri/data-uri.js";

const asObject = (keys, storage = 'localStorage') => {
    const data = {};
    keys.forEach(key => {
        data[key] = window[storage].getItem(key);
    });

    return data;
}

const asJson = (keys, storage = 'localStorage') => {
    return JSON.stringify(asObject(keys, storage));
}

const asDataUri = (keys, storage = 'localStorage') => {
    return dataUri.encode(asJson(keys, storage), {
        mime: 'application/json',
        charset: 'utf-8'
    });
}

export default {
    asDataUri,
    asJson,
    asObject
}