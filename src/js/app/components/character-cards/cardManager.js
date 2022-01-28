import settings from '../../../modules/settings/settings.js';
import events from '../../../modules/events/events.js';
import tabs from '../tabs/tabManager.js';
import CharacterCard from './characterCard.js';
import fn from 'fancy-node';

const lsKey = settings.get('storageKeys.cards');
let userCards = JSON.parse(localStorage.getItem(lsKey) || '{}');
let autoincrement = Math.max(...[0].concat(Object.keys(userCards)));


// these two could be done with a tab manager at some point
const currentTab = tabs.getCurrentTab();
const tabId = 1;

const add = characterData => {

    autoincrement++;
    const cardId = autoincrement;

    characterData.meta = {
        ...characterData.meta,
        ...{
            tabId,
            cardId
        }
    }
    userCards[cardId] = characterData;

    const card = document.createElement('character-card');
    card.character = characterData.character;
    card.meta = characterData.meta;
    currentTab.append(card);

    save();
}

const remove = card => {
    delete userCards[card.meta.cardId];
    card.remove();
    save();
}

const enableEdit = card => {
    card.classList.add('editable');
    fn.$('th,td', card).forEach(cell => {
        cell.contentEditable = true;
    })
}

const read = cardId => {
    return userCards[cardId];
}

const update = (cardId, character) => {
    userCards[cardId] = character;
    save();
}

const save = () => {
    localStorage.setItem(lsKey, JSON.stringify(userCards));
}

const init = () => {
    CharacterCard.register();
    events.on('characterSelection', e => {
        add(e.detail)
    })
    events.on('characterRemove', e => {
        remove(e.detail)
    })
    events.on('characterEdit', e => {
        enableEdit(e.detail);
    })
}

export default {
    init
}