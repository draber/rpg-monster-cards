import characterMap from '../character-library/character-map.js';
import visibility from '../../../../data/visibility.json';
import labels from '../../../../data/labels.json';
import tabManager from '../tabs/tabManager.js';
import tabStorage from '../tabs/tabStorage.js'

let activeTab;

let app;

/**
 * The context in which this character is handled, i.e. system|user
 */
const origin = 'user';

// polyfill for structuredClone()
// this is currently bleeding edge
// it works in all major browsers but only if the are up-to-date
// note that this polyfill is very superficial 
// but gets the job done for the usage below
if (typeof structuredClone !== 'function') {
    function structuredClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
}

const getLabels = () => {
    const characterLabels = {};
    for (let [key, value] of Object.entries(labels)) {
        if (key.startsWith('__')) {
            continue;
        }
        characterLabels[key] = value.short;
    }
    return characterLabels;
}

const add = character => {
    activeTab = tabManager.getTab('active');
    const cid = characterMap.nextIncrement(origin);
    character = structuredClone(character);
    // this is the case when cards are restored
    const tab = character.meta.tid ?
        tabManager.getTab(character.meta.tid) :
        activeTab
    const tid = tabStorage.parseTid(tab)
    character.meta = {
        ...character.meta,
        ...{
            visibility,
            tid,
            cid,
            origin
        }
    }
    if (!character.labels) {
        character.labels = getLabels();
    }
    characterMap.set(origin, cid, character);
    const card = document.createElement('card-base');
    card.character = character;
    tab.panel.append(card);
}

const restoreLastSession = () => {
    for (let character of Object.values(characterMap.getAllByType('user'))) {
        add(character);
    }
}

const handleRemoval = (card, action) => {
    const character = characterMap.get(origin, card.cid)
    switch (action) {
        case 'soft':
            character.meta.softDeleted = true;
            characterMap.set(origin, card.cid, character);
            break;
        case 'restore':
            delete character.meta.softDeleted;
            characterMap.set(origin, card.cid, character);
            break;
        case 'remove':
            delete tabs[tab.tid];
            characterMap.remove(type, cid);
            break;
    }
}


const init = _app => {
    app = _app;
    app.on('tabDelete', e => {
        characterMap.bulkDeleteByTid(e.detail.tid);
    })
    app.on('characterSelection', e => {
        add(e.detail)
    })
    restoreLastSession()
}

export default {
    init,
    handleRemoval
}