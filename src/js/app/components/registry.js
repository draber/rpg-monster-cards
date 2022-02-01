import CharacterLibrary from './character-library/CharacterLibrary.js';
import LibraryOrganizer from './character-library/LibraryOrganizer.js';
import FontSelector from './font-selector/FontSelector.js';
import PatternSelector from './pattern-selector/PatternSelector.js';
import ColorSelector from './color-selector/ColorSelector.js';

const components = [
    CharacterLibrary,
    LibraryOrganizer,
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