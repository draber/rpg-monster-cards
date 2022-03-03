/**
 * CRUD extension of a plain object
 */
class Tree {

    get length() {
        return this.keys().length;
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
     * @param {Function} [condition] callback function that receives the found value as an argument
     * @returns {Object}
     */
    object(searchKey = null, condition = null) {
        if (!searchKey || !(condition instanceof Function)) {
            return this.obj;
        }
        const result = {};
        for (let [key, value] of Object.entries(this.obj)) {
            const compVal = this.#get(`${key}.${searchKey}`);
            if (condition(compVal)) {
                result[key] = value;
            }
        }
        return result;
    }

    /**
     * Retrieve all or some entries 
     * @param {String} [searchKey] 
     * @param {Function} [condition] callback function that receives the found value as an argument
     * @returns {Iterator}
     */
    entries(searchKey = null, condition = null) {
        return Object.entries(this.object(searchKey, condition));
    }

    /**
     * Retrieve all or some entries 
     * @param {String} [searchKey] 
     * @param {Function} [condition] callback function that receives the found value as an argument
     * @returns {Array}
     */
    values(searchKey = null, condition = null) {
        return Object.values(this.object(searchKey, condition));
    }

    /**
     * Get all or some keys
     * @param {String} [searchKey] 
     * @param {Function} [condition] callback function that receives the found value as an argument
     * @returns {Array}
     */
    keys(searchKey = null, condition = null) {
        return Object.keys(this.object(searchKey, condition));
    }

    /**
     * Remove one or multiple entries
     * @param {...String|Number} keys 
     */
    remove(...keys) {
        keys.forEach(key => {
            delete this.obj[key]
        })
    }

    /**
     * Convert this.obj to JSON
     * @param {Boolean} pretty 
     * @returns 
     */
    toJson(pretty = false) {
        return JSON.stringify(this.obj, null, (pretty ? '\t' : null));
    }

    constructor(obj = {}) {
        this.obj = obj;
    }
}

export default Tree;