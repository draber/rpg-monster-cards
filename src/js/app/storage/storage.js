import TabTree from './TabTree.js';
import CharTree from './CharTree.js';
import settings from '../../modules/settings/settings.js';

let tabStore;
let systemStore;
let cardStore;
let copyStore;
let importStore;

const initStorage = launchData => {
    tabStore = new TabTree({
        data: launchData.tabs,
        lsKey: settings.get('storageKeys.tabs')
    });
    systemStore = new CharTree({
        data: launchData.system
    });
    cardStore = new CharTree({
        data: launchData.stored,
        lsKey: settings.get('storageKeys.cards'),
        minIncrement: 3000
    });
    copyStore = new CharTree({
        minIncrement: 6000
    });
    importStore = new CharTree({
        minIncrement: 9000
    });
}

export {
    tabStore,
    systemStore,
    cardStore,
    copyStore,
    importStore
}
export default initStorage;