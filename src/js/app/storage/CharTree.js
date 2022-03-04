import Tree from '../../modules/tree/Tree.js';
import visibility from '../../../data/visibility.json';

// can't use labelStore (circular dependency)
import labels from '../../../data/labels.json';

class CharTree extends Tree {

    #getLabels() {
        const _labels = {};
        for (let [key, value] of Object.entries(labels)) {
            if (key.startsWith('__')) {
                continue;
            }
            _labels[key] = value.short;
        }
        return _labels;
    }

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
     * Create data for a new tab (tid as in Tab ID)
     * @returns {{title, tid: {Integer}}}
     */
    blank() {
        const props = {};
        Object.keys(labels).forEach(key => {
            props[key] = '';
        })
        return {
            cid: this.nextIncrement(),
            props,
            visibility,
            labels: this.#getLabels()
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