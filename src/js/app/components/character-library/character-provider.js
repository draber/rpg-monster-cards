import sorter from '../../../modules/sorter/sorter.js';
import labels from '../../../../data/labels.json';
import characterMap from './character-map.js';


/**
 * Map 'group by' to a label and a value
 * @param {Object} entry
 * @param {String} groupBy
 * @returns {Object} modified entry
 */
const prepareGroupSort = (entry, groupBy) => {
    if (entry.props[groupBy] === '' || typeof entry.props[groupBy] === 'undefined') {
        entry.props[groupBy] = 'n/a';
    }
    switch (groupBy) {
        case '__user':
            entry.meta._groupValue = labels.__user.group;
            entry.meta._groupLabel = labels.__user.group;
            break;
        case 'name':
            entry.meta._groupValue = entry.props.name.charAt(0).toUpperCase();
            entry.meta._groupLabel = `${labels[groupBy].group}: ${entry.meta._groupValue}`;
            break
        default:
            entry.meta._groupValue = entry.props[groupBy];
            entry.meta._groupLabel = `${labels[groupBy].group}: ${entry.props[groupBy]}`
    }

    return entry;
}

/**
 * Retrieve characters grouped and sorted
 * @param {String} groupBy
 * @param {String} sortBy
 * @param {String} groupDir
 * @param {String} sortDir
 * @returns {Object}
 */
const getSortedCharacters = (type, {
    groupBy = 'name',
    sortBy = 'name',
    groupDir = 'asc',
    sortDir = 'name'
} = {}) => {
    let grouped = {};
    for (let entry of characterMap.values(type)) {
        entry = prepareGroupSort(entry, groupBy);
        grouped[entry.meta._groupValue] = grouped[entry.meta._groupValue] || [];
        grouped[entry.meta._groupValue].push(entry)
    }
    if (type === 'system') {
        grouped = sorter.group(grouped, groupDir);
    }
    for (let [key, values] of Object.entries(grouped)) {
        grouped[key] = sorter.sort(values, `props.${sortBy}`, sortDir);
    }
    return grouped;
}


export default {
    getSortedCharacters
}