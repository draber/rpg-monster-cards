import convertToRoman from '../../modules/roman-numerals/roman-numerals.js';
import Tree from '../../modules/tree/Tree.js';

class TabTree extends Tree {

    /**
     * Retrieve the TID from either a DOM tab or a {String|Number} TID 
     * @param {HTMLElement|Entry|String|Number} tidData 
     * @returns 
     */
    toTid(tidData) {
        const tid = tidData.tid || tidData;
        if (isNaN(tid)) {
            throw `${tid} is not a valid tab identifier`;
        }
        return parseInt(tid, 10);
    }

    /**
     * Create data for a new tab (tid as in Tab ID)
     * @returns {{title, tid: {Integer}}}
     */
    blank() {
        const tid = this.nextIncrement();
        return {
            tid,
            title: convertToRoman(tid),
            styles: {}
        }
    }

    /**
     * Auto increment tab id (TID)
     * @returns {Number}
     */
    nextIncrement() {
        let keys = this.length ? this.keys().map(e => parseInt(e)) : [0];
        return Math.max(...keys) + 1;
    }

    constructor({
        data = {},
        lsKey
    } = {}) {
        super({
            data: Object.keys(data).length ? data : {
                1: this.blank()
            },
            lsKey
        });
    }
}

export default TabTree;