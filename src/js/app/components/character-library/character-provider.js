import sorter from '../../../modules/sorter/sorter.js';
import labels from '../../../../data/labels.json';
import {
    systemStore,
    cardStore
} from '../../storage/storage.js'


/**
 * Map 'group by' to a label and a value
 * @param {Object} entry
 * @param {String} groupBy
 * @returns {Object} modified entry
 */
const prepareGroupSort = (entry, groupBy) => {
    if (typeof entry.props[groupBy] === 'undefined') {
        entry.props[groupBy] = '';
    }
    switch (groupBy) {
        case '__user':
            entry._groupValue = labels.__user.group;
            entry._groupLabel = labels.__user.group;
            break;
        case 'name':
            entry._groupValue = entry.props.name.charAt(0).toUpperCase();
            entry._groupLabel = `${labels[groupBy].group}: ${entry._groupValue}`;
            break
        default:
            entry._groupValue = entry.props[groupBy];
            entry._groupLabel = `${labels[groupBy].group}: ${entry.props[groupBy]}`
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
    const store = type === 'user' ? cardStore : systemStore;
    for (let entry of store.values()) {
        entry = prepareGroupSort(entry, groupBy);
        grouped[entry._groupValue] = grouped[entry._groupValue] || [];
        grouped[entry._groupValue].push(entry)
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