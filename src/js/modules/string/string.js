import {
    remove as removeDiacritics
} from 'remove-accents-diacritics';


/**
 * Convert a štrïng wîth diäcritics to a string without diacritics
 * @param {String} str 
 * @returns {String}
 */
export {
    remove as removeDiacritics
}
from 'remove-accents-diacritics';

/**
 * Convert a Štrïng wîth Diäcritics to a lower-case-string-without-diacritics 
 * @param {String} str 
 * @returns {String}
 */
export const toIdFormat = str => {
    str = removeDiacritics(str);
    return dash(removeDiacritics(str));
}

/**
 * Convert a string to camelCase
 * @see https://stackoverflow.com/a/2970667 with some modifications
 * @param {String} term
 */
export const camel = term => {
    return term.replace(/[_-]+/, ' ').replace(/(?:^[\w]|[A-Z]|\b\w|\s+)/g, function (match, index) {
        if (+match === 0) return '';
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
};

/**
 * Convert a string to dash-case
 * @see https://stackoverflow.com/a/52964182 with some modifications
 * @param {String} term
 * @returns {String}
 */
export const dash = term => {
    return term.replace(/[\W_]+/g, ' ')
        .trim()
        .split(/ |\B(?=[A-Z])/)
        .map(word => word.toLowerCase())
        .join('-');
};

export const ucFirst = term => {
    return term.charAt(0).toUpperCase() + term.slice(1);
}