import CharacterLibrary from './components/character-library/CharacterLibrary.js';
import LibraryOrganizer from './components/character-library/LibraryOrganizer.js';
import TabNavi from './components/tabs/TabNavi.js';
import TabHandle from './components/tabs/TabHandle.js';
import TabContent from './components/tabs/TabContent.js';
import TabPanel from './components/tabs/TabPanel.js';
import TabMenu from './components/tabs/TabMenu.js';
import StyleEditor from './components/styles/style-editor/StyleEditor.js';
import FontSelector from './components/styles/font-selector/FontSelector.js';
import FontSize from './components/styles/font-selector/FontSize.js';
import PatternSelector from './components/styles/pattern-selector/PatternSelector.js';
import ColorSelector from './components/styles/color-selector/ColorSelector.js';
import CardBase from './components/character-cards/CardBase.js';
import CardForm from './components/character-cards/CardForm.js';
import CardRecto from './components/character-cards/CardRecto.js';
import CardToolbar from './components/character-cards/CardToolbar.js';
import CardVerso from './components/character-cards/CardVerso.js';
import UndoDialog from './components/undo-dialog/UndoDialog.js';
import cardManager from './components/character-cards/card-manager.js';
import characterStorage from './components/character-library/character-storage.js';
import tabManager from './components/tabs/tab-manager.js';
import {
    on,
    trigger
} from '../modules/events/eventHandler.js';


class App extends HTMLElement {

    connectedCallback() {
        // load characters
        characterStorage.init()
            .then(() => {
                [
                    TabContent,
                    TabHandle,
                    TabNavi,
                    TabPanel,
                    TabMenu
                ].forEach(component => {
                    component.register(this);
                })

                // tabs must be created before cards can be added
                // or styles can be handled
                tabManager.init(this);
                cardManager.init(this);

                [
                    CharacterLibrary,
                    LibraryOrganizer,
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
                ].forEach(component => {
                    component.register(this);
                })
            })

    }
    constructor(self) {
        self = super(self);
        self.on = on;
        self.trigger = trigger;
        self.styleStorage = false;
        return self;
    }
}

customElements.define('app-container', App, {
    extends: 'main'
});