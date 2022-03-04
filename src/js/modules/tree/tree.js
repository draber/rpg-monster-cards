/**
 * CRUD extension of a plain object
 */
class Tree {

    get length() {
        return this.keys().length;
    }

    #getCmpFn(fnName) {
        if (this.cmpFns[fnName]) {
            return this.cmpFns[fnName];
        }
        if (this.cmpMap[fnName]) {
            return this.cmpMap[fnName];
        }
        throw (`Unknown function ${fnName}`);
    }

    /**
     * Returns a value based on a key, can also be `foo.bar`
     * @param {String} key
     * @returns {String|undefined}
     * @private
     */
    #get(key) {
        const keys = key.toString().split('.');
        let current = Object.create(this.obj);
        for (let token of keys) {
            if (typeof current[token] === 'undefined') {
                return undefined;
            }
            current = current[token];
        }
        return current;
    }

    flush() {
        this.obj = {};
        this.save();
    }

    /**
     * Storage handling: write to local storage
     */
    save() {
        return this.lsKey ? localStorage.setItem(this.lsKey, JSON.stringify(this.object())) : null;
    }

    /**
     * Set a new or overwrite an existing value
     * @param {String} key
     * @param {*} value
     */
    set(key, value) {
        const keys = key.toString().split('.');
        const last = keys.pop();
        let current = this.obj;
        for (let token of keys) {
            if (!current[token]) {
                current[token] = {};
            }
            if (Object.getPrototypeOf(current) !== Object.prototype) {
                throw (`${token} is not of the type Object`);
            }
            current = current[token];
        }
        current[last] = value;
        this.save();
    }

    /**
     * Delete an existing value
     * @param {String} key
     */
    unset(key) {
        const keys = key.toString().split('.');
        const last = keys.pop();
        let current = this.obj;
        for (let token of keys) {
            if (!current[token]) {
                current[token] = {};
            }
            if (Object.getPrototypeOf(current) !== Object.prototype) {
                throw (`${token} is not of the type Object`);
            }
            current = current[token];
        }
        delete current[last];
    }

    /**
     * Public version of #get, accepts multiple keys
     * @param {...String|Number} keys 
     * @returns {String|Object}
     */
    get(...keys) {
        if (keys.length === 1) {
            return this.#get(keys[0]);
        }
        const result = {};
        keys.forEach(key => {
            result[key] = this.#get(key);
        })
        return result;
    }

    /**
     * Retrieve all or some data 
     * @param {String} [searchKey] 
     * @param {String|Function} [cmpFn] Either the name or symbol of one of the built-in callbacks or a function. Arguments are the found value and `expectVal`.
     * @param {Any} [expectVal] The value to compare to.
     * @returns {Object}
     */
    object(searchKey = null, cmpFn = null, expectVal = null) { 
        if (!searchKey || !cmpFn) {
            return this.obj;
        }
        if (cmpFn && !(cmpFn instanceof Function)) {
            cmpFn = this.#getCmpFn(cmpFn);
        }
        const result = {};
        for (let [key, value] of Object.entries(this.obj)) {
            const compVal = this.#get(`${key}.${searchKey}`);
            if (cmpFn(compVal, expectVal)) {
                result[key] = value;
            }
        }
        return result;
    }

    /**
     * Retrieve all or some entries 
     * @param {String} [searchKey] 
     * @param {String|Function} [cmpFn] Either the name or symbol of one of the built-in callbacks or a function. Arguments are the found value and `expectVal`.
     * @param {Any} [expectVal] The value to compare to.
     * @returns {Iterator}
     */
    entries(searchKey = null, cmpFn = null, expectVal = null) {
        return Object.entries(this.object(searchKey, cmpFn, expectVal));
    }

    /**
     * Retrieve all or some entries 
     * @param {String} [searchKey] 
     * @param {String|Function} [cmpFn] Either the name or symbol of one of the built-in callbacks or a function. Arguments are the found value and `expectVal`.
     * @param {Any} [expectVal] The value to compare to.
     * @returns {Array}
     */
    values(searchKey = null, cmpFn = null, expectVal = null) {
        return Object.values(this.object(searchKey, cmpFn, expectVal));
    }

    /**
     * Get all or some keys
     * @param {String} [searchKey] 
     * @param {String|Function} [cmpFn] Either the name or symbol of one of the built-in callbacks or a function. Arguments are the found value and `expectVal`.
     * @param {Any} [expectVal] The value to compare to.
     * @returns {Array}
     */
    keys(searchKey = null, cmpFn = null, expectVal = null) {
        return Object.keys(this.object(searchKey, cmpFn, expectVal));
    }

    /**
     * Remove one or multiple entries
     * @param {...String|Number} keys 
     */
    remove(...keys) {
        keys.forEach(key => {
            delete this.obj[key]
        })
        this.save();
    }

    /**
     * Convert this.obj to JSON
     * @param {Boolean} pretty 
     * @returns 
     */
    toJson(pretty = false) {
        return JSON.stringify(this.obj, null, (pretty ? '\t' : null));
    }

    constructor({
        data = {},
        lsKey
    } = {}) {
        this.obj = data;
        this.lsKey = lsKey;

        this.cmpFns = {
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
            }
        }

        this.cmpMap = {
            ['===']: this.cmpFns.equal,
            ['!==']: this.cmpFns.notEqual,
            ['>']: this.cmpFns.greater,
            ['>=']: this.cmpFns.greaterEqual,
            ['<']: this.cmpFns.lesser,
            ['<=']: this.cmpFns.lesserEqual
        }
    }
}

export default Tree;