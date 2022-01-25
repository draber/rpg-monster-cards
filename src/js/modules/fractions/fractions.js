import Fraction from "fraction.js";

const asciiFractions = {
    '¼': [1, 4],
    '½': [1, 2],
    '¾': [3, 4],
    '⅐': [1, 7],
    '⅑': [1, 9],
    '⅒': [1, 10],
    '⅓': [1, 3],
    '⅔': [2, 3],
    '⅕': [1, 5],
    '⅖': [2, 5],
    '⅗': [3, 5],
    '⅘': [4, 5],
    '⅙': [1, 6],
    '⅚': [5, 6],
    '⅛': [1, 8],
    '⅜': [3, 8],
    '⅝': [5, 8],
    '⅞': [7, 8]
}

/**
 * Convert ASCII fraktions to plain objects
 *
 * @param symbol
 * @returns {{numerator, denominator}|boolean}
 */
export const breakUpFractionSymbol = symbol => {
    return asciiFractions[symbol] ? {
        numerator: asciiFractions[symbol][0],
        denominator: asciiFractions[symbol][1]
    } : false;
}

/**
 * Build an ASCII style symbol from any number, e.g. ⅞.
 * Don't confuse the fraction slash ⁄ with the regular slash /
 * 
 * @param {Number} numerator
 * @param {Number} denominator
 * @returns {`${string}⁄${string}`}
 */
export const toFractionSymbol = (numerator, denominator) => {
    return `${numerator}⁄${denominator}`
}

export const resolveFraction = (fraction, precision = 2) => {
    const data = breakUpFractionSymbol(fraction);
    if (!data) {
        return fraction;
    }
    return Number.parseFloat(data.numerator / data.denominator).toPrecision(precision);
}