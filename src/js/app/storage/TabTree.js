import convertToRoman from '../../modules/roman-numerals/roman-numerals.js';
import NumericTree from '../../modules/tree/NumericTree.js';
import idHelper from './id-helper.js';

class TabTree extends NumericTree {

    /**
     * Create data for a new tab (tid as in Tab ID)
     * @returns {{title, tid: {Integer}}}
     */
    getBlank() {
        const tid = this.nextIncrement();
        return {
            tid,
            title: convertToRoman(tid),
            styles: {}
        }
    }

    /**
     * Remove one or multiple entries
     * @param {...String|Number} tidData 
     */
    remove(...tidData) {
        super.remove(...tidData.map(e => idHelper.toTid(e)))
    }

    constructor({
        data = {},
        minIncrement = 1,
        lsKey
    } = {}) {
        super({
            data,
            lsKey,
            minIncrement
        });
    }
}

export default TabTree;