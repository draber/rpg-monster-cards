import fs from 'fs-extra';
import {
    toIdFormat
} from '../../string/string.js';

const getFonts = sourceFile => {

    let families = [];
    fs.readJsonSync(sourceFile, 'utf-8').forEach(family => {
        let fontArr = family.split(',').map(entry => entry.trim().replace(/'/g, ''));

        families.push({
            label: fontArr[0],
            id: toIdFormat(fontArr[0]),
            family
        })

    })

    return families;
}

export default getFonts;