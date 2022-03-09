/**
 * Set of common comparison functions
 */
const cmpFns = {
    equal: (a, b) => {
        return a === b;
    },
    notEqual: (a, b) => {
        return a !== b;
    },
    greater: (a, b) => {
        return a > b;
    },
    greaterEqual: (a, b) => {
        return a >= b;
    },
    lesser: (a, b) => {
        return a < b;
    },
    lesserEqual: (a, b) => {
        return a <= b;
    },
    instanceof: (a, b) => {
        return a instanceof b;
    },
    typeof: (a, b) => {
        return typeof a === b;
    },
    match: (a, b) => {
        return b.test(a)
    }
}

/**
 * Shortcuts to some of the above
 */
const cmpMap = {
    ['===']: cmpFns.equal,
    ['!==']: cmpFns.notEqual,
    ['>']: cmpFns.greater,
    ['>=']: cmpFns.greaterEqual,
    ['<']: cmpFns.lesser,
    ['<=']: cmpFns.lesserEqual
}

/**
 * Acccessor for the above functions
 * @param {String|Function} fn 
 * @returns {Function}
 */
const getCmpFn = fn => {
    if(fn instanceof Function){
        return fn;
    }
    if (cmpFns[fn]) {
        return cmpFns[fn];
    }
    if (cmpMap[fn]) {
        return cmpMap[fn];
    }
    throw (`Unknown function ${fn}`);
}

export default getCmpFn;