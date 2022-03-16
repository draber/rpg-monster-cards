import fn from 'fancy-node';
import {
    tabStore,
    cardStore,
    copyStore
} from '../../app/storage/storage.js';
import {
    deepClone
} from '../deep-clone/deep-clone.js';
import cardManager from '../../app/components/character-cards/card-manager.js'
import domProps from '../dom-props/dom-props.js';
import idHelper from '../../app/storage/id-helper.js';

/**
 * Prepare a card for copying|cutting
 * @param {HTMLElement} card 
 * @param {String} mode cut|copy
 */
const set = (card, mode) => {
    // remove class names
    clear(card.app);

    // add cut|copy class to the slected card
    card.classList.add(mode);

    // get the model of the card
    const original = cardStore.get(idHelper.toCid(card));

    // create a tmp copy and add the original
    const copy = {
        ...deepClone(original),
        ...{
            mode
        }
    }
    copy.originalCid = idHelper.toCid(original);
    copy.cid = copyStore.nextIncrement();

    // save the card in the store for pasting
    copyStore.set(copy.cid, copy);

    // set body[card-storage] to enable pasting in the context menu
    domProps.set('cardStorage', true);
}

/**
 * Prepare a card for cutting
 * @param {HTMLElement} card 
 */
const cut = card => {
    set(card, 'cut');
}

/**
 * Prepare a card for copying
 * @param {HTMLElement} card 
 */
const copy = card => {
    set(card, 'copy');
}

/**
 * Paste a card
 * @param {HTMLElement} tab the tab to paste to
 */
const paste = tab => {
    copyStore.values().forEach(copy => {
        // assign the new tab
        copy.tid = idHelper.toTid(tab);

        // delete the cut-out card if any
        if (copy.mode === 'cut') {            
            cardManager.handleRemoval(cardManager.getCard(copy.originalCid), 'remove');
        }
        delete copy.originalCid;

        // assign regular card cid
        copy.cid = cardStore.nextIncrement();
        cardManager.add(copy);
    });

    // remove class names
    clear(tab.app);

    // forget copies
    copyStore.flush();

    domProps.unset('cardStorage');
}

/**
 * Remove cut|copy classes from all cards
 * @param {HTMLElement} app 
 */
const clear = app => {
    const lastCopied = fn.$('card-base.cut, card-base.copy', app);
    if (lastCopied) {
        lastCopied.classList.remove('cut', 'copy');
    }
}

export default {
    copy,
    cut,
    paste,
    clear
}