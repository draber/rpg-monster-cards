import tabManager from '../tabs/tab-manager.js';
import {
    tabStore,
    cardStore
} from '../../storage/storage.js';
import softDelete from '../../../modules/softDelete/softDelete.js';
import fn from 'fancy-node';
import { deepClone } from '../../../modules/deep-clone/deep-clone.js'

let app;

const add = character => {

    let cid; // character ID
    let tid; // tab ID
    let tab;
    // if the character comes from a previous session
    if (character.tid) {
        cid = cardStore.toCid(character);
        tab = tabManager.getTab(character.tid);
        tid = tabStore.toTid(tab);
    } else {
        cid = cardStore.nextIncrement();
        character = deepClone(character);
        tab = tabManager.getTab('active');
        tid = tabStore.toTid(tab);
    }
    character = {
        ...cardStore.blank(),
        ...character,
        ...{
            tid,
            cid
        }
    }
    cardStore.set(cid, character);
    const card = document.createElement('card-base');
    card.cid = cid;
    card.tid = tid;
    card.character = character;
    tab.panel.append(card);
}

const restoreLastSession = () => {
    for (let character of cardStore.values()) {
        add(character);
    }
}

const bulkDelete = (tidData) => {
    fn.$$('card-base', tabManager.getTab(tidData)).forEach(card => {
        cardStore.remove(card);
        handleRemoval(card, 'remove');
    })
}

const handleRemoval = (element, action) => {

    switch (action) {
        case 'soft':
            // DOM
            softDelete.initiate(element, cardStore.get(`${cardStore.toCid(element)}.props.name`))
                .then(data => {
                    handleRemoval(element, data.action);
                })
            // local model
            cardStore.set(`${cardStore.toCid(element)}.softDeleted`, true);
            break;
        case 'restore':
            cardStore.unset(`${cardStore.toCid(element)}.softDeleted`);
            break;
        case 'remove':
            cardStore.remove(cardStore.toCid(element));
            element.remove();
            break;
        case 'all':
            bulkDelete(element);
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
    restoreLastSession()
}

export default {
    init,
    handleRemoval
}