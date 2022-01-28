import sorter from '../../../modules/sorter/sorter.js';
import characters from '../../../../data/characters.json';
import visibility from '../../../../data/visibility.json';
import labels from '../../../../data/labels.json';

/**
 * Map 'group by' to a label and a value
 * @param character
 * @param groupBy
 * @returns {*&{_groupValue: *, _groupLabel: *}}
 */
const prepareGroupSort = (character, groupBy) => {
    let _groupLabel;
    let _groupValue;
    if (character[groupBy] === '') {
        character[groupBy] = 'n/a';
    }
    switch (groupBy) {
        case 'name':
            _groupValue = character.name.charAt(0).toUpperCase();
            _groupLabel = `${labels[groupBy].group}: ${_groupValue}`;
            break
        default:
            _groupValue = character[groupBy];
            _groupLabel = `${labels[groupBy].group}: ${character[groupBy]}`
    }

    return {
        ...character,
        ...{
            _groupLabel,
            _groupValue
        }
    };
}

/**
 * Retrieve characters grouped and sorted
 * @param groupBy
 * @param sortBy
 * @param groupDir
 * @param sortDir
 * @returns {Object}
 */
const getSortedCharacters = ({
    groupBy,
    sortBy,
    groupDir,
    sortDir
}) => {
    let grouped = {};
    characters.forEach(character => {
        character = prepareGroupSort(character, groupBy);
        grouped[character._groupValue] = grouped[character._groupValue] || [];
        grouped[character._groupValue].push(character)
    });
    grouped = sorter.group(grouped, groupDir);
    for (let [key, values] of Object.entries(grouped)) {
        grouped[key] = sorter.sort(values, sortBy, sortDir);
    }
    return grouped;
}

/**
 * Retrieve a clone of a character to build a card from.
 * This falls back to the first available character
 * @param {Int} cid
 * @returns {{img?: string, notes?: string, con?: string, hp?: string, "full attack"?: string, attack_parameters?: string, feats?: string, speed?: string, skills?: string, "base attack/grapple"?: string, attack?: string, dex?: string, treasure?: string, cha?: string, wis?: string, ac?: string, ini?: string, "special attacks"?: string, will?: string, reflex?: string, int?: string, "level adjustment"?: string, cr?: number, str?: string, environment?: string, "space/reach"?: string, organization?: string, name?: string, fort?: string, alignment?: string, base?: string}}
 */
const getSingleCharacter = cid => {
    return {
        meta: {
            characterId: parseInt(cid, 10),
            visibility
        },
        character: characters[cid]
    }
}

export default {
    getSortedCharacters,
    getSingleCharacter
}