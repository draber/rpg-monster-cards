import CharacterLibrary from './components/library/CharacterLibrary.js';
import LibraryOrganizer from './components/library/LibraryOrganizer.js';
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
import CardBase from './components/cards/CardBase.js';
import CardForm from './components/cards/CardForm.js';
import CardRecto from './components/cards/CardRecto.js';
import CardToolbar from './components/cards/CardToolbar.js';
import CardVerso from './components/cards/CardVerso.js';
import UndoDialog from './components/undo-dialog/UndoDialog.js';
import ImportExport from './components/import-export/ImportExport.js';
import FileUpload from './components/import-export/FileUpload.js';
import cardManager from './components/cards/card-manager.js';
import tabManager from './components/tabs/tab-manager.js';
import {
    on,
    trigger
} from '../modules/events/eventHandler.js';
import initStorage from './storage/storage.js';
import Tree from '../modules/tree/Tree.js';
import feConfig from '../../config/config-frontend.json';
import sharedConfig from '../../config/config-shared.json';


const config = {
    ...feConfig,
    ...sharedConfig
};

class App extends HTMLElement {

    connectedCallback() {

        const settings = new Tree({
            data: config
        })

        const launchData = {
            tabs: JSON.parse(localStorage.getItem(config.storageKeys.tabs) || '{}'),
            system: {},
            presets: {},
            stored: JSON.parse(localStorage.getItem(config.storageKeys.cards) || '{}'),
            settings
        }

        // load system cards and presets
        Promise.all([
                fetch(config.characters.url),
                fetch(config.presets.url)
            ])
            .then(responses => Promise.all(responses.map(r => r.json())))
            .then(dataArr => {
                // add system cards to store
                launchData.characters = dataArr[0];
                
                // add presets and storage keys to launch data
                launchData.presets = {
                    ...dataArr[1],
                    ...{
                        storageKeys: config.storageKeys
                    }
                };

                initStorage(launchData);

                // load and initialize components
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
                    ImportExport,
                    FileUpload,
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
            });
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