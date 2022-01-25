import getData from '../modules/data-provider/dataProvider.js';
import fs from 'fs-extra';
import {
    config,
    jsonOptions
} from './bootstrap.js';

const buildData = () => {
    for (let [type, data] of Object.entries(getData())) {
        fs.outputJson(config[type].target, data, jsonOptions);
    }
}

export default buildData();