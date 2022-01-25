const styles = Array.from(getComputedStyle(document.body));

const isStyleProp = key => {
    return key.startsWith('--') || styles.includes(key);
}

const set = (key, value, target) => {
    target = target || document.body;
    if (isStyleProp(key)) {
        return target.style.setProperty(key, value);
    }

    target.dataset[key] = value;
}

const get = (key, target) => {
    target = target || document.body;
    if (isStyleProp(key)) {
        return JSON.parse(target.style.getPropertyValue(key));
    }
    if (typeof target.dataset[key] === 'undefined') {
        return false;
    }
    return JSON.parse(target.dataset[key]);
}

const unset = (key, target) => {
    target = target || document.body;
    if (isStyleProp(key)) {
        return target.style.removeProperty(key);
    }
    delete target.dataset[key];
} 

export default {
    unset,
    get,
    set
}
