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
import properties from '../properties/properties.js';


const set = (card, mode) => {
    clear(card.app);
    card.classList.add(mode);

    const original = cardStore.get(cardStore.toCid(card));
    const copy = {
        ...deepClone(original),
        ...{
            mode
        }
    }

    copy.originalCard = original;
    copy.cid = copyStore.nextIncrement();

    copyStore.set(copy.cid, copy);
    properties.set('cardStorage', true);
}

const cut = element => {
    set(element, 'cut');
}

const copy = element => {
    set(element, 'copy');
}

const paste = tab => {
    copyStore.values().forEach(copy => {
        // assign the new tab
        copy.tid = tabStore.toTid(tab);
        if (copy.mode === 'cut') {
            console.log(copy.originalCard)
            cardManager.handleRemoval(copy.originalCard, 'remove');
        }
        delete copy.originalCard;
        // assign regular card cid
        copy.cid = cardStore.nextIncrement();
        tab.app.trigger('characterSelection', copy);
    });

    // remove class names
    clear(tab.app);

    // forget copies
    copyStore.flush();

    properties.unset('cardStorage');
}

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