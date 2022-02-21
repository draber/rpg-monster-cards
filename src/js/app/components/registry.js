import CharacterLibrary from './character-library/CharacterLibrary.js';
import LibraryOrganizer from './character-library/LibraryOrganizer.js';
import TabNavi from './tabs/TabNavi.js';
import TabHandle from './tabs/TabHandle.js';
import TabContent from './tabs/TabContent.js';
import TabPanel from './tabs/TabPanel.js';
import StyleEditor from './styles/style-editor/StyleEditor.js';
import FontSelector from './styles/font-selector/FontSelector.js';
import FontSize from './styles/font-selector/FontSize.js';
import PatternSelector from './styles/pattern-selector/PatternSelector.js';
import ColorSelector from './styles/color-selector/ColorSelector.js';
import CardBase from './character-cards/CardBase.js';
import CardForm from './character-cards/CardForm.js';
import CardRecto from './character-cards/CardRecto.js';
import CardToolbar from './character-cards/CardToolbar.js';
import CardVerso from './character-cards/CardVerso.js';
import UndoDialog from './undo-dialog/UndoDialog.js';


const components = [
    CharacterLibrary,
    LibraryOrganizer,
    TabNavi,
    TabHandle,
    TabContent,
    TabPanel,
    StyleEditor,
    FontSelector,
    FontSize,
    PatternSelector,
    ColorSelector,
    CardBase,
    CardForm,
    CardRecto,
    CardToolbar,
    CardVerso,
    UndoDialog
];

const register = app => {
    components.forEach(component => {
        component.register(app);
    })
}

export default {
    register
}