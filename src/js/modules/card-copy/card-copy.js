import fn from 'fancy-node';
import characterStorage from '../../app/components/character-library/character-storage.js';
import tabStorage from '../../app/components/tabs/tab-storage.js';
import { deepClone } from '../deep-clone/deep-clone.js';

const origin = 'user';

const set = (element, mode) => {
    clear(element);
    element.app.pastableCard = {
        cid: characterStorage.parseCid(element),
        tid: tabStorage.parseTid(element),
        mode
    }
    element.classList.add(element.app.pastableCard.mode);
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
    character.tid = tabStorage.parseTid(element);

    element.app.trigger('characterSelection', character);

    if(element.app.pastableCard.mode === 'cut'){
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