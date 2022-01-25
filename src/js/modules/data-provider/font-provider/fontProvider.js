import fs from 'fs-extra';
import {
    toIdFormat
} from '../../string/string.js';

const getFonts = source => {
    let families = [];
    const data = fs.readFileSync(source, 'utf-8')
        .split('\n')
        .filter(e => e.includes('font-family'))
        .map(e => e.trim().replace(';', '').replace('font-family: ', ''));

    data.forEach(family => {
        let fontArr = family.split(',').map(entry => entry.trim().replace(/'/g, ''));
        let label = !fontArr[0].includes(' ') ? fontArr[0].trim().split(/ |\B(?=[A-Z])/).join(' ') : fontArr[0];
        let id = toIdFormat(label);
        families.push({
            label,
            id,
            family
        })
    })

    return families;
};

export default getFonts;