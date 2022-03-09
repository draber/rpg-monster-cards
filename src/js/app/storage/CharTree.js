import Tree from '../../modules/tree/Tree.js';
import visibility from '../../../data/visibility.json';

// can't use labelStore (circular dependency)
import labels from '../../../data/labels.json';

const getLabels = () => {
    const _labels = {};
    for (let [key, value] of Object.entries(labels)) {
        if (key.startsWith('__')) {
            continue;
        }
        _labels[key] = value.short;
    }
    return _labels;
}

class CharTree extends Tree {

    /**
     * Retrieve the CID from either a DOM card or character or a {String|Number} CID 
     * @param {HTMLElement|Entry|String|Number} cidData 
     * @returns 
     */
    toCid(cidData) {
        const cid = cidData.cid || cidData;
        if (isNaN(cid)) {
            throw `${cid} is not a valid character identifier`;
        }
        return parseInt(cid, 10);
    }
    
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
    getBlank() {
        const props = {};
        Object.keys(labels).forEach(key => {
            props[key] = '';
        })
        return {
            cid: this.nextIncrement(),
            props,
            visibility,
            labels: getLabels()
        }
    }

    /**
     * Auto increment tab id (CID)
     * @returns {Number}
     */
    nextIncrement() {
        let keys = this.length ? this.keys().map(e => parseInt(e)) : [this.minIncrement];
        return Math.max(...keys) + 1;
    }

    /**
     * Remove one or multiple entries
     * @param {...String|Number} cidData 
     */
    remove(...cidData) {
        super.remove(...cidData.map(e => this.toCid(e)))
    }

    constructor({
        data = {},
        minIncrement = 0,
        lsKey
    } = {}) {
        super({
            data,
            lsKey
        });
        this.minIncrement = minIncrement;
    }
}

export default CharTree;