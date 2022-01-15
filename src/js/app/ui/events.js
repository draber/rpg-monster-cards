const trigger = (type, data, target) => {
    (target || document.body).dispatchEvent(data ? new CustomEvent(type, {
        detail: data
    }) : new Event(type));
}


const on = (type, action, target) => {
    (target || document.body).addEventListener(type, action);
}

export default {
    trigger,
    on
}