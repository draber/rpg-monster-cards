export const isMandatory = key => {
    return ['img', 'name'].includes(key);
}

export const display = (key, type) => {
    return isMandatory(key) ? 'mandatory' : this.meta.visibility[key][type] && !!this.props[key];
}

export const label = key => {
    return labels[key].short;
}
