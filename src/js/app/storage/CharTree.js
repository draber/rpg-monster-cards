import NumericTree from '../../modules/tree/NumericTree.js';
import idHelper from './id-helper.js';

/**
 * Tree that specializes in character storage
 */
class CharTree extends NumericTree {

    /**
     * Create data for a new tab (tid as in Tab ID)
     * @returns {{title, tid: {Integer}}}
     */
    getBlank() {
        const fields = {};
        this.validFields.forEach(key => {
            fields[key] = {
                field: {
                    txt: ''
                }
            };
        })
        return {
            cid: this.nextIncrement(),
            fields
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
        lsKey,
        validFields = []
    } = {}) {
        super({
            data,
            lsKey,
            minIncrement
        });
        this.validFields = validFields

    }
}

export default CharTree;