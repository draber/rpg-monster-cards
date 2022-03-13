import Tree from './Tree.js';

class NumericTree extends Tree {

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