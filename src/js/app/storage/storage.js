import TabTree from './TabTree.js';
import CharTree from './CharTree.js';
import PresetTree from '../../modules/tree/PresetTree.js';

let tabStore;
let characterStore;
let cardStore;
let copyStore;
let presetStore;

const initStorage = launchData => {

    // system configuration
    presetStore = new PresetTree({
        data: launchData.presets
    })

    // tabs
    tabStore = new TabTree({
        data: launchData.tabs,
        lsKey: presetStore.get('storageKeys.tabs')
    });

    // ensure there is always at least one tab available
    if (tabStore.length === 0) {
        const blank = tabStore.getBlank();
        tabStore.set(blank.tid, blank);
    }

    // valid card/character fields
    const validFields = Object.keys(launchData.presets.cards);

    // characters provided by the system
    characterStore = new CharTree({
        validFields
    });

    launchData.characters.forEach(systemCharacter => {
        const finalCharacter = characterStore.getBlank();
        validFields.forEach(key => {
            if (systemCharacter[key]) {
                finalCharacter.fields[key].field.txt = systemCharacter[key];
            }
        })
        characterStore.set(finalCharacter.cid, finalCharacter);
    });


    // characters created by the user
    cardStore = new CharTree({
        data: launchData.stored,
        lsKey: presetStore.get('storageKeys.cards'),
        minIncrement: 3001,
        validFields
    });

    // characters ready for pasting
    copyStore = new CharTree({
        minIncrement: 6001
    });
}

export {
    tabStore,
    characterStore,
    cardStore,
    copyStore,
    presetStore
}
export default initStorage;