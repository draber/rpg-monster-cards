import CharacterLibrary from './character-library/character-library.js';
import CharacterSorter from './character-sorter/character-sorter.js';
import FontSelector from './font-selector/font-selector.js';
import PatternSelector from './pattern-selector/pattern-selector.js';
import ColorSelector from './color-selector/color-selector.js';

const components = [
    CharacterLibrary,
    CharacterSorter,
    FontSelector,
    PatternSelector,
    ColorSelector
];

const register = () => {
    components.forEach(component => {
        component.register();
    })
}

export default {
    register
}