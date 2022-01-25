import fs from 'fs-extra';
import { toIdFormat, ucFirst } from '../../string/string.js';
import path from 'path';

/**
 * Convert the pattern file name into an Object with label, id and name
 * 
 * This works only on file names that are not expected to have accents or something after conversion:
 * - `big-fat-foo.png` becomes `Big Fat Foo`
 * - `motorhead-03` will become `Motorhead 03` and not `Motörhead`. In fact nothing will ever become Motörhead again.
 * 
 * @param {String} filePath 
 * @returns {Object}
 */
const dataFromPath = filePath => {
    const name = path.basename(filePath);
    const ext = path.extname(filePath);
    const fileWoExt = path.basename(name, ext);
    const label = fileWoExt.split(/\W+/).map(entry => ucFirst(entry)).join(' ');
    return {
        label,
        id: toIdFormat(label),
        name 
    }
}

const getPatterns = sourceDir => {
    return fs.readdirSync(sourceDir)
        .map(path => dataFromPath(path));
}

export default getPatterns;
