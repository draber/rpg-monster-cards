import TabTree from './TabTree.js';
import CharTree from './CharTree.js';
import Tree from '../../modules/tree/Tree.js';
import cssProps from '../../../data/css-props.json';
import labels from '../../../data/labels.json';

let tabStore;
let systemStore;
let cardStore;
let copyStore;
let importStore;
let prefStore;
let styleStore;
let settings;
let labelStore;

const initStorage = launchData => {
    // configuration
    settings = launchData.settings;

    // tabs
    tabStore = new TabTree({
        data: launchData.tabs,
        lsKey: settings.get('storageKeys.tabs')
    });

    // ensure there is always at least one tab available
    if(tabStore.length === 0){
        const blank = tabStore.getBlank();
        tabStore.set(blank.tid, blank);
    }

    // characters provided by the system
    systemStore = new CharTree({
        data: launchData.system
    });

    // characters created by the user
    cardStore = new CharTree({
        data: launchData.stored,
        lsKey: settings.get('storageKeys.cards'),
        minIncrement: 3000
    });

    // characters ready for pasting
    copyStore = new CharTree({
        minIncrement: 6000
    });

    // user preferences
    prefStore = new Tree({
        data: JSON.parse(localStorage.getItem(settings.get('storageKeys.user') || '{}')),
        lsKey: settings.get('storageKeys.user')
    })

    // css custom properties
    styleStore = new Tree({
        data: cssProps[':root']
    })

    // label store
    labelStore = new Tree({
        data: labels
    })
}

export {
    tabStore,
    systemStore,
    cardStore,
    copyStore,
    importStore,
    prefStore,
    styleStore,
    labelStore,
    settings
}
export default initStorage;