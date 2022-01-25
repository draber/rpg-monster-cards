import getFonts from './font-provider/fontProvider.js';
import getPatterns from './pattern-provider/patternProvider.js';
import getCharacters from './character-provider/characterProvider.js';
import getCustomProperties from './custom-property-provider/customPropertyProvider.js';
import getLabels from './label-provider/labelProvider.js';
import {
    config
} from '../../builder/bootstrap.js';

const getData = () => {
    return {
        cardLabels: getLabels(config.cardLabels.src, 'card'),
        groupLabels: getLabels(config.groupLabels.src, 'group'),
        fonts: getFonts(config.fonts.src),
        backgrounds: getPatterns(config.backgrounds.src),
        borders: getPatterns(config.borders.src),
        cssProps: getCustomProperties(config.cssProps.src),
        characters: getCharacters(config.characters.src)
    }
};

export default getData;