import TabTree from './TabTree.js';
import CharTree from './CharTree.js';
import SystemPropTree from '../../modules/tree/SystemPropTree.js';
import Tree from '../../modules/tree/Tree.js';
import cssProps from '../../../data/css-props.json';
import labels from '../../../data/labels.json';

let tabStore;
let systemStore;
let cardStore;
let copyStore;
let importStore;
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
        minIncrement: 3001
    });

    // characters ready for pasting
    copyStore = new CharTree({
        minIncrement: 6001
    });

    // SystemPropTrees are readonly and 
    // css custom properties
    styleStore = new SystemPropTree({
        data: cssProps[':root']
    })

    // label store
    labelStore = new SystemPropTree({
        data: labels
    })
}

export {
    tabStore,
    systemStore,
    cardStore,
    copyStore,
    importStore,
    styleStore,
    labelStore,
    settings
}
export default initStorage;