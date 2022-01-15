import getData from '../modules/data-provider/dataProvider.js';
import fs from 'fs-extra';
import {
    config,
    jsonOptions
} from './bootstrap.js';

const buildData = () => {
    fs.outputJson(config.combinedData, getData(), jsonOptions);
}

export default buildData();