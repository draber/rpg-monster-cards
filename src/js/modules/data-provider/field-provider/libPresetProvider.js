import getFieldConfig from './fieldConfigReader.js';

const getLibPresets = sourceFile => {
    const data = getFieldConfig(sourceFile);
    const result = {}
    for (let value of Object.values(data)) {
        result[value.key] = {
            txt: value.labels.group,
            vis: value.visibility.group
        };
    }
    return result;
}


export default getLibPresets;