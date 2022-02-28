import cssProps from '../../../data/css-props.json';

let props = {};

for (let values of Object.values(cssProps)) {
    props = {
        ...props,
        ...values
    }
}

const get = key => {
    return props[key];
}


export default {
    get
}