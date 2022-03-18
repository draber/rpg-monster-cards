import NumericTree from '../../modules/tree/NumericTree.js';
import visibility from '../../../data/visibility.json';
import idHelper from './id-helper.js';

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

class CharTree extends NumericTree {

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
     * Remove one or multiple entries
     * @param {...String|Number} cidData 
     */
    remove(...cidData) {
        super.remove(...cidData.map(e => idHelper.toCid(e)))
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

export default CharTree;