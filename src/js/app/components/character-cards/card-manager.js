import tabManager from '../tabs/tab-manager.js';
import {
    tabStore,
    cardStore
} from '../../storage/storage.js';
import softDelete from '../../../modules/softDelete/softDelete.js';
import fn from 'fancy-node';

let app;

/**
 * Add a new card to a tab
 * @param {Object} character 
 */
const add = character => {

    let cid; // character ID
    let tid; // tab ID
    let tab;
    // if the character comes from a previous session
    if (character.tid) {
        cid = cardStore.toCid(character);
        tab = tabManager.getTab(character.tid);
        // This is a 'just in case'. When tabs are deleted and cards for some reasons 
        // aren't removed from the tree, these 'Ghost Cards' will cause an error
        // if their original tab isn't available anymore
        if (!tab) {
            handleRemoval(character, 'remove');
            return;
        }
        tid = tabStore.toTid(tab);
    } else {
        cid = cardStore.nextIncrement();
        tab = tabManager.getTab('active');
        tid = tabStore.toTid(tab);
    }
    // setup everything
    character = {
        ...cardStore.getBlank(),
        ...character,
        ...{
            tid,
            cid
        }
    }
    // build the card, both as a model and a DOM element
    cardStore.set(cid, character);
    const card = document.createElement('card-base');
    card.setAttribute('cid', cid);
    card.setAttribute('tid', tid);
    card.character = character;
    tab.panel.append(card);
}

/**
 * Retrieve a card from the DOM based on its CID
 * @param {HTMLElement|Object|String|Number} cidData 
 * @returns 
 */
const getCard = cidData => {
    return fn.$(`[cid="${cardStore.toCid(cidData)}"]`);
}

/**
 * Restore all cards from previous session
 * Tabs already exist at this point
 */
const restoreLastSession = () => {
    for (let character of cardStore.values()) {
        add(character);
    }
}

/**
 * Cards are usually first soft deleted and expire after 10 secs
 * All display functionality is handled by `softDelete`
 * @param {HTMLElement|Object} card 
 * @param {String} action 
 */
const handleRemoval = (card, action) => {

    const cid = cardStore.toCid(card);
    switch (action) {
        case 'soft':
            // DOM
            softDelete.initiate(card, cardStore.get(`${cid}.props.name`))
                .then(data => {
                    handleRemoval(card, data.action);
                })
            // local model
            cardStore.set(`${cid}.softDeleted`, true);
            break;
        case 'restore':
            cardStore.unset(`${cid}.softDeleted`);
            break;
        case 'remove':
            cardStore.remove(card);
            // another 'just in case', see full comment in `add()`
            if (card instanceof HTMLElement) {
                card.remove();
            }
            break;
    }
}

/**
 * Initialize the card manager and its events
 * @param {HTMLElement} _app 
 */
const init = _app => {
    // app container
    app = _app;
    // hard delete all cards from a specific tab 
    app.on('tabDelete', e => {
        e.detail.forEach(card => {
            handleRemoval(card, 'remove');
        })
    })
    // character has been selected in library
    app.on('characterSelection', e => {
        add(e.detail)
    })
    // restore cards from a previous session
    restoreLastSession()
}

export default {
    init,
    handleRemoval,
    add,
    getCard
}