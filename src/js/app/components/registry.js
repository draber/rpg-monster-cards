import CharacterLibrary from './character-library/CharacterLibrary.js';
import LibraryOrganizer from './character-library/LibraryOrganizer.js';
import FontSelector from './font-selector/FontSelector.js';
import FontSize from './font-selector/FontSize.js';
import PatternSelector from './pattern-selector/PatternSelector.js';
import ColorSelector from './color-selector/ColorSelector.js';
import CardBase from './character-cards/CardBase.js';
import CardForm from './character-cards/CardForm.js';
import CardRecto from './character-cards/CardRecto.js';
import CardToolbar from './character-cards/CardToolbar.js';
import CardVerso from './character-cards/CardVerso.js';

const components = [
    CharacterLibrary,
    LibraryOrganizer,
    FontSelector,
    FontSize,
    PatternSelector,
    ColorSelector,
    CardBase,
    CardForm,
    CardRecto,
    CardToolbar,
    CardVerso
];

const register = () => {
    components.forEach(component => {
        component.register();
    })
}

export default {
    register
}