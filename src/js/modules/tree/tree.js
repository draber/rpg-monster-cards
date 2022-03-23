import getCmpFn from "./cmp-functions.js";
import {
    deepClone
} from "../deep-clone/deep-clone.js";

/**
 * Private function area
 * Functions in this area could be implemented as `#fn()` inside the class.
 * Unfortunately this seem to confuse some formatters and they turn `#fn()` into `# fn()`
 */

/**
 * Returns a value based on a key, can also be `foo.bar`
 * @param {String} key
 * @returns {String|undefined}
 * @private
 */
const _get = (key, obj) => {
    const keys = key.toString().split('.');
    let current = Object.create(obj);
    for (let token of keys) {
        if (typeof current[token] === 'undefined') {
            return undefined;
        }
        current = current[token];
    }
    return current;
}

/**
 * CRUD extension of a plain object
 */
class Tree {

    get length() {
        return this.keys().length;
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
        return this;
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
        this.save();
        return this;
    }

    /**
     * Retrieve a single (sub-)entry, supports 'a.b.c.d' string syntax
     * @param {String|Number} key 
     * @returns {String|Object}
     */
    get(key) {
        return _get(key, this.obj);
    }

    /**
     * Retrieve a deep clone of a single (sub-)entry, supports 'a.b.c.d' string syntax
     * @param {String|Number} key 
     * @returns {String|Object}
     */
    getClone(key) {
        return deepClone(this.get(key))
    }

    /**
     * Whether or not a certain key exists in this tree
     * @param {String|Number} key 
     * @returns {Boolean}
     */
    has(key) {
        return typeof this.get(key) !== 'undefined';
    }

    /**
     * Syntactical sugar to make condition building easy
     * @param {String} searchKey Path to the value to compare against. 
     *                           The first key is ommited and added in the loop, e.g. 'b.c.d' looks for a.b.c.d, b.b.c.d etc.
     * @param {String|Function} cmpFn Any function from ./cmp-functions.js or a custom function. They receive to arguments, the found and the expected value
     * @param {Any} [expected] Whatever you need to compare against. Can be omitted when `cmpFn` is a function and does all the magic itself
     * @returns {Array}
     */
    where(searchKey, cmpFn, expected = null) {
        return [searchKey, cmpFn, expected];
    }

    /**
     * Retrieve all or some data 
     * @param {Array} [...conditions] Unlimited set of conditions that can be built with `this.where()`. Conditions are always joined with `AND`!
     * @returns {Object}
     */
    object(...conditions) {        
        conditions = conditions.filter(e => Array.isArray(e));
        if (!conditions.length) {
            return this.obj;
        }

        const result = {};
        for (let [key, entry] of Object.entries(this.obj)) {
            conditions.forEach(condition => {
                const comperator = _get(`${key}.${condition[0]}`, this.obj);
                const expected = condition[2];
                const fn = getCmpFn(condition[1]);
                if (fn(comperator, expected)) {
                    result[key] = entry;
                }
            })
        }
        return result;
    }

    /**
     * Retrieve all or some entries 
     * @param {Array} [...conditions] Unlimited set of conditions that can be built with `this.where()`. Conditions are always joined with `AND`!
     * @returns {Iterator}
     */
    entries(...conditions) {
        return Object.entries(this.object.apply(this, conditions));
    }

    /**
     * Retrieve all or some entries 
     * @param {Array} [...conditions] Unlimited set of conditions that can be built with `this.where()`. Conditions are always joined with `AND`!
     * @returns {Array}
     */
    values(...conditions) {
        return Object.values(this.object.apply(this, conditions));
    }

    /**
     * Get all or some keys
     * @param {Array} [...conditions] Unlimited set of conditions that can be built with `this.where()`. Conditions are always joined with `AND`!
     * @returns {Array}
     */
    keys(...conditions) {
        return Object.keys(this.object.apply(this, conditions));
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
        lsKey = false
    } = {}) {
        this.obj = data;
        this.lsKey = lsKey;
    }
}

export default Tree;