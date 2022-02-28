import characterStorage from '../character-library/character-storage.js';
import visibility from '../../../../data/visibility.json';
import labels from '../../../../data/labels.json';
import tabManager from '../tabs/tab-manager.js';
import tabStorage from '../tabs/tab-storage.js';
import softDelete from '../../../modules/softDelete/softDelete.js';
import fn from 'fancy-node';

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

    let cid; // character ID
    let tid; // tab ID
    let tab;
    // if the character comes from a previous session
    if (character.meta && character.meta.tid) {
        cid = characterStorage.parseCid(character);
        tab = tabManager.getTab(character.meta.tid);
        tid = tabStorage.parseTid(tab);
    } else {
        cid = characterStorage.nextIncrement(origin);
        character = structuredClone(character);
        tab = tabManager.getTab('active');
        tid = tabStorage.parseTid(tab);
    }
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
    characterStorage.set(origin, cid, character);
    const card = document.createElement('card-base');
    card.cid = cid;
    card.tid = tid;
    card.character = character;
    tab.panel.append(card);
}

const restoreLastSession = () => {
    for (let character of Object.values(characterStorage.getAllByType('user'))) {
        add(character);
    }
}

const bulkDelete = (type, tidData) => {
    fn.$$('card-base', tabManager.getTab(tidData)).forEach(card => {
        characterStorage.remove(type, card);
        handleRemoval(card, 'remove');
    })
}

const handleRemoval = (element, action) => {

    switch (action) {
        case 'soft':
            // DOM
            softDelete.initiate(element, characterStorage.get(origin, element).props.name)
                .then(data => {
                    handleRemoval(element, data.action);
                })
            // local model
            characterStorage.update(origin, element, 'softDeleted', true);
            break;
        case 'restore':
            characterStorage.update(origin, element, 'softDeleted', null);
            break;
        case 'remove':
            characterStorage.remove(origin, element);
            element.remove();
            break;
        case 'all':
            bulkDelete(origin, element);
            break;
    }
}


const init = _app => {
    app = _app;
    app.on('tabDelete', e => {
        handleRemoval(e.detail.tab, 'all');
    })
    app.on('characterSelection', e => {
        add(e.detail)
    })
   // restoreLastSession()
}

export default {
    init,
    handleRemoval
}