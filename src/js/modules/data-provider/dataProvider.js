import getFonts from './font-provider/fontProvider.js';
import getPatterns from './pattern-provider/patternProvider.js';
import getCharacters from './character-provider/characterProvider.js';
import getCustomProperties from './custom-property-provider/customPropertyProvider.js';
//import getFields from './field-provider/fieldProvider.js';
import getCardPresets from './field-provider/cardPresetProvider.js';
import getLibPresets from './field-provider/libPresetProvider.js';
import {
    config
} from '../../builder/bootstrap.js';

const getData = () => {
    return {
        // labels: getFields(config.fields.src, 'labels'),
        // visibility: getFields(config.fields.src, 'visibility'),
        // fonts: getFonts(config.fonts.src),
        // backgrounds: getPatterns(config.backgrounds.src),
        // borders: getPatterns(config.borders.src),
        // cssProps: getCustomProperties(config.cssProps.src),
        characters: getCharacters(config.characters.src, config.fields.src),
        presets: {
            fonts: getFonts(config.fonts.src),
            backgrounds: getPatterns(config.backgrounds.src),
            borders: getPatterns(config.borders.src),
            css: getCustomProperties(config.cssProps.src)[':root'],
            cards: getCardPresets(config.fields.src),
            lib: getLibPresets(config.fields.src)
        }
    }
};

export default getData;