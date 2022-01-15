import fs from 'fs-extra';
import {
    customPropsToObject
} from '../../custom-property-converter/customPropertyConverter.js';

const getCustomProperties = sourceFile => {
    return customPropsToObject(fs.readFileSync(sourceFile, 'utf-8'));
}

export default getCustomProperties;