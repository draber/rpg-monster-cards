import sorter from '../../../modules/sorter/sorter.js';
import {
    characterStore,
    presetStore
} from '../../storage/storage.js';


/**
 * Map 'group by' to a label and a value
 * @param {Object} character
 * @param {String} groupBy
 * @returns {Object} modified entry
 */
const prepareGroupSort = (character, groupBy) => {
    switch (groupBy) {
        case 'name':
            character._groupValue = character.fields.name.field.txt.charAt(0).toUpperCase();
            character._groupLabel = presetStore.get(`lib.${groupBy}.txt`) + ': ' + character._groupValue;
            break
        default:
            character._groupValue = character.fields[groupBy].field.txt;
            character._groupLabel = presetStore.get(`lib.${groupBy}.txt`) + ': ' + character._groupValue
    }

    return character;
}

/**
 * Retrieve characters grouped and sorted
 * @param {String} groupBy
 * @param {String} sortBy
 * @param {String} groupDir
 * @param {String} sortDir
 * @returns {Object}
 */
const getSortedCharacters = ({
    groupBy = 'name',
    sortBy = 'name',
    groupDir = 'asc',
    sortDir = 'name'
} = {}) => {
    let grouped = {};
    for (let character of characterStore.values()) {
        character = prepareGroupSort(character, groupBy);
        grouped[character._groupValue] = grouped[character._groupValue] || [];
        grouped[character._groupValue].push(character)
    }
    grouped = sorter.group(grouped, groupDir);
    for (let [key, values] of Object.entries(grouped)) {
        grouped[key] = sorter.sort(values, `fields.${sortBy}.field.txt`, sortDir);
    }
    return grouped;
}


export default {
    getSortedCharacters
}