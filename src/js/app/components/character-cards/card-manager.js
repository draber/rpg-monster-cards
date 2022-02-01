import events from '../../../modules/events/events.js';
import tabs from '../tabs/tabManager.js';
import CardBase from './CardBase.js';
import characterMap from '../character-library/character-map.js';
import visibility from '../../../../data/visibility.json';
import fields from './field-service.js';

// these two could be done with a tab manager at some point
const currentTab = tabs.getCurrentTab();
const tabId = 1;

/**
 * The context in which this character is handled, i.e. system|user
 */
const origin = 'user';

const add = character => {
    const cardId = characterMap.nextIncrement(origin);
    character.meta = {
        ...character.meta,
        ...{
            visibility,
            tabId,
            cardId,
            origin
        }
    }
    characterMap.set(origin, cardId, character);
    fields.init(character);
    const card = document.createElement('card-base');
    currentTab.append(card);
}

const remove = card => {
    characterMap.remove(origin, card.meta.cardId);
    card.remove();
}

const enableEdit = card => {
    card.classList.add('editable');
}

const update = (cardId, character) => {
    userCards[cardId] = character;
}


const init = () => {
    CardBase.register();
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