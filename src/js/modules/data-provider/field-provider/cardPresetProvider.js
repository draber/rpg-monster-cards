import getFieldConfig from './fieldConfigReader.js';

const getCardPresets = sourceFile => {
    const data = getFieldConfig(sourceFile);
    const result = {}
    for (let value of Object.values(data)) {
        result[value.key] = {
            field: {
                vis: value.visibility.card
            },
            label: {
                txt: {
                    long: value.labels.long,
                    short: value.labels.short,
                },
                vis: value.visibility.label
            }
        };
    }
    return result;
}


export default getCardPresets;