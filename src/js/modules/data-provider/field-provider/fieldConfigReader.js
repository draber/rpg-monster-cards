import YAML from 'yamljs';

/**
 * Read YAML config, apply defaults and return as Object
 * 
 * @param {String} sourceFile 
 * @returns {Object}
 */
const getFieldConfig = sourceFile => {
    let data = YAML.load(sourceFile);

    const visiblity = {
        card: true,
        group: false,
        label: true
    }

    for (let [key, value] of Object.entries(data)) {
        // apply defaults        
        data[key].labels.group = value.labels.group || value.labels.long;
        data[key].key = value.key || key;
        data[key].visibility = data[key].visibility ? {...visiblity, ...data[key].visibility} : visiblity;
    }
    return data;
}
  

export default getFieldConfig;