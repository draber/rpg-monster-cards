import events from '../../../modules/events/events.js';
import tabs from '../tabs/tabManager.js';
import characterMap from '../character-library/character-map.js';
import visibility from '../../../../data/visibility.json';
import labels from '../../../../data/labels.json';

// these two could be done with a tab manager at some point
const currentTab = tabs.getCurrentTab();
const tabId = 1;

/**
 * The context in which this character is handled, i.e. system|user
 */
const origin = 'user';

// polyfill for structuredClone()
// this is currently bleeding edge
// it works in all major browsers but only if the are up-to-date
// note that this polyfill is very superficial 
// but gets the job done for the usage below
if(typeof structuredClone !== 'function'){
    function structuredClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
}

const getLabels = () => {
    const characterLabels = {};
    for(let [key, value] of Object.entries(labels)){
        if(key.startsWith('__')){
            continue;
        }
        characterLabels[key] = value.short;
    }
    return characterLabels;
}

const add = character => {
    const cid = characterMap.nextIncrement(origin);
    character = structuredClone(character);    
    character.meta = {
        ...character.meta,
        ...{
            visibility,
            tabId,
            cid,
            origin
        }
    }
    if(!character.labels) {
        character.labels = getLabels();
    }
    characterMap.set(origin, cid, character);
    const card = document.createElement('card-base');
    card.character = character;
    currentTab.append(card);
}


const init = () => {
    events.on('characterSelection', e => {
        add(e.detail)
    })
}

export default {
    init
}