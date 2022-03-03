import config from '../../../config/config.json';
import Tree from '../tree/Tree.js';

const settings = new Tree({
    data: config
})

export default settings;