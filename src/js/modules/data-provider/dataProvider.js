import getFonts from './font-provider/fontProvider.js';
import getPatterns from './pattern-provider/patternProvider.js';
import getMonsters from './monster-provider/monsterProvider.js';
import getCustomProperties from './custom-property-provider/customPropertyProvider.js';
import { config } from '../../builder/bootstrap.js';

const getData = () => {
    return {
        fonts: getFonts(config.fonts.families),
        patterns: {
            borders: getPatterns(config.patterns.borders),
            backgrounds: getPatterns(config.patterns.backgrounds)
        },
        customProperties: getCustomProperties(config.css.cardDefCss),
        monsters: getMonsters(config.monsters)
    }
};

export default getData;