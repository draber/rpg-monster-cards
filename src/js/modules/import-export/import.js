import dataUri from "../data-uri/data-uri.js";

const fromObject = (data, storage = 'localStorage') => {
    for(let [key, value] of Object.entries(data)) {
        window[storage].setItem(key, value)
    }
}

const fromJson = (data, storage = 'localStorage') => {
    return fromObject(JSON.parse(data), storage);
}

const fromDataUri = (data, storage = 'localStorage') => {
    return fromJson(dataUri.decode(data), storage);
}

export default {
    fromDataUri,
    fromJson,
    fromObject
}