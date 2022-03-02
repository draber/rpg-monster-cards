class Tree {

    /**
     * Returns a value based on a key, can also be `foo.bar`
     * @param {String} key
     * @returns {String|undefined}
     */
    #get(key) {
        let current = Object.create(this.obj);
        for (let token of key.toString().split('.')) {
            if (typeof current[token] === 'undefined') {
                return undefined;
            }
            current = current[token];
        }
        return current;
    }

    get(...keys){
        if(keys.length === 1) {
            return this.#get(keys[0]);
        }
        const result = [];
        keys.forEach(key => {
            result.push(this.#get(key));
        })
        return result;
    }

    getObject(searchKey = null, condition = null) {
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

    getEntries(searchKey = null, condition = null) {
        return Object.entries(this.getObject(searchKey, condition));
    }

    getValues(searchKey = null, condition = null) {
        return Object.values(this.getObject(searchKey, condition));
    }

    getKeys(searchKey = null, condition = null) {
        return Object.keys(this.getObject(searchKey, condition));
    }

    /**
     * Assign a new value to a key in settings
     * @param {String} key
     * @param {*} value
     */
    set(key, value) {
        const keys = key.split('.');
        const last = keys.pop();
        let current = this.obj;
        for (let part of keys) {
            if (!current[part]) {
                current[part] = {};
            }
            if (!!current && Object.getPrototypeOf(current) === Object.prototype) {
                throw (`${part} is not of the type Object`);
            }
            current = current[part];
        }
        current[last] = value;
    }

    remove(...keys) {
        keys.forEach(key => {
            delete this.obj[key]
        })
    }

    constructor(obj) {
        this.obj = obj;
    }
}