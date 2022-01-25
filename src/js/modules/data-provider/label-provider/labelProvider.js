import fs from 'fs-extra';

const getLabels = (sourceFile, type) => {
    const labels = {}
    for (let [key, value] of Object.entries(fs.readJsonSync(sourceFile))) {
        if (value[type]) {
            labels[key] = value[type];
        }
    }
    return labels;
}

export default getLabels;