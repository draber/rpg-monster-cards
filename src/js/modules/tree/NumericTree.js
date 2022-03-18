import Tree from './Tree.js';

class NumericTree extends Tree {

    /**
     * Get all or some keys as integers
     * @param {Array} [...conditions] Unlimited set of conditions that can be built with `this.where()`. Conditions are always joined with `AND`!
     * @returns {Array}
     */
    keys(...conditions) {
        return super.keys.apply(this, conditions).map(e => parseInt(e));
    }

    /**
     * Auto increment entry id
     * @returns {Number}
     */
    nextIncrement() {
        let keys = this.length ? this.keys().map(e => parseInt(e)) : [this.minIncrement - 1];
        return Math.max(...keys) + 1;
    }

    constructor({
        data = {},
        minIncrement = 1,
        lsKey
    } = {}) {
        super({
            data,
            lsKey
        });
        this.minIncrement = minIncrement;
    }
}

export default NumericTree;