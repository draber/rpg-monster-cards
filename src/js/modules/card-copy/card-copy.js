import fn from 'fancy-node';
import characterStorage from '../../app/components/character-library/character-storage.js';
import tabStore from '../../app/storage/tab-storage.js';
import {
    deepClone
} from '../deep-clone/deep-clone.js';

const origin = 'user';
const target = 'clone';

const set = (element, mode) => {
    clear(element);
    element.classList.add(mode);

    const original = characterStorage.get(origin, element);
    const character = deepClone(original);
    if (mode === 'cut') {
        characterStorage.update(origin, element, mode, mode);
    }

    character.oldCid = character.cid;

    character.cid = characterStorage.nextIncrement(origin);
    character.tid = tabStore.toTid(element);
    characterStorage.set(target, cid, character);
}

const cut = element => {
    set(element, 'cut');
}

const copy = element => {
    set(element, 'copy');
}

const paste = element => {

    const character = deepClone(characterStorage.get(origin, element.app.pastableCard));

    character.cid = characterStorage.nextIncrement(origin);
    character.tid = tabStore.toTid(element);

    element.app.trigger('characterSelection', character);

    if (element.app.pastableCard.mode === 'cut') {
        characterStorage.remove(origin, element.app.pastableCard);
    }

    clear();
}

const clear = element => {
    const lastCopied = fn.$('card-base.cut, card-base.copy', element.app);
    if (lastCopied) {
        lastCopied.classList.remove('cut', 'copy');
    }
    delete element.app.pastableCard;
}

export default {
    copy,
    cut,
    paste,
    clear
}