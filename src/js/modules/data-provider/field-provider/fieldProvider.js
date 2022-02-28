import getFieldConfig from './fieldConfigReader.js';

const getFields = (sourceFile, type) => {
    const data = getFieldConfig(sourceFile);
    const result = {}
    for (let value of Object.values(data)) {
        result[value.key] = value[type];
    }
    return result;
}


export default getFields;