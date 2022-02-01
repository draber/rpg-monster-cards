import fs from 'fs-extra';
import getFieldConfig from '../field-provider/fieldConfigReader.js';

const getCharacters = (characterSrcFile, fieldSrcFile) => {
    const fieldConfig = getFieldConfig(fieldSrcFile);
    const characters = fs.readJsonSync(characterSrcFile);
    let i = characters.length;
    let imgRe = /javascript\:ShowImage\('([^\.]+)\.[^;]+;/
    while (i--) {
        // convert keys
        for (let [charKey, value] of Object.entries(characters[i])) {

            if (typeof value === 'string') {
                characters[i][charKey] = value.trim();
            }
            // optimize payload
            if (/^\-?\d+$/.test(value)) {
                characters[i][charKey] = parseInt(value, 10);
            } else if (['—', 'Ø', '-'].includes(value)) {
                characters[i][charKey] = '';
            } else if (/\bft\./.test(value)) {
                characters[i][charKey] = value.replace(/(\bft)\./g, '$1');
            }
            // fix broken images
            else if (charKey === 'img' && !value) {
                characters[i][charKey] = 'media/character-fallback-image.png';
            } else if (charKey === 'img' && value.startsWith('javascript')) {
                characters[i][charKey] = value.replace(imgRe, '//wizards.com/dnd/images/$1.jpg');
            } 
            // get rid of redundant protocol and subdomain
            else if (charKey === 'img' && value.startsWith('http://www.wizards.com')) {
                characters[i][charKey] = value.replace('http://www.', '//');
            }
            // shorten keys
            if (fieldConfig[charKey].key !== charKey) {
                characters[i][fieldConfig[charKey].key] = characters[i][charKey];
                delete characters[i][charKey];
            }

        }
    }
    return characters;
}

export default getCharacters;