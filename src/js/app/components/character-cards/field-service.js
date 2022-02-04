import labels from '../../../../data/labels.json';

let props;
let visibility;
let order;

let rendered = {};

const move = (fromIdx, toIdx) => {
    if (fromIdx < 0) {
        return false
    }
    if (toIdx > order.length) {
        return false
    }
    const entry = order.splice(fromIdx, 1)
    order.splice(toIdx, 0, entry.pop());
    return true;
}

const getLabel = key => labels[key].short;

const isVisible = (key, type) => {
    return visibility[key][type] && !!props[key];
}


// const setProp = (key, value, origin) => {
//     order = Object.keys(data)
//     order.delete('name');
//     order.delete('img');
// }

const getProp = key => props[key];

const getProps = () => props;

const getOrder = (ignoreList = []) => {
    return order.filter(entry => !ignoreList.includes(entry))
}

const setRendered = (origin, key, value, label) => {
    rendered[origin] = rendered[origin] || {};
    rendered[origin][key] = rendered[origin][key] || [];
    rendered[origin][key].push({
        value,
        label
    });
}

const init = character => {
    visibility = character.meta.visibility;
    props = character.props;
    order = Object.keys(character.props);
}

export default {
    getProp,
    // setProp,
    move,
    init,
    getProps,
    setRendered,
    getLabel,
    isVisible,
    getOrder,
    rendered
}