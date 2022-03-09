import CharTree from "../../app/storage/CharTree.js";
import TabTree from "../../app/storage/TabTree.js";
import {
    tabStore,
    cardStore
} from "../../app/storage/storage.js";
import {
    sanitizeText
} from "../string/string.js";
import tabManager from "../../app/components/tabs/tab-manager.js";
import cardManager from "../../app/components/character-cards/card-manager.js";
import properties from '../properties/properties.js';

let cardQuarantine;
let tabQuarantine;

/**
 * Sanitize values from uploaded data (e.g. removing script injections)
 * @param {Object} base 
 * @param {Object} uploaded 
 * @returns 
 */
const sanitizeObject = (base, uploaded) => {
    const sanitized = {};
    // make sure to use only valid keys
    Object.keys(base).forEach(key => {
        sanitized[key] = sanitizeText(uploaded[key]);
    })
    return sanitized;
}

/**
 * Put cards into a temporary store
 * @param {Object} cards 
 */
const quarantineCards = cards => {
    cards.forEach(card => {
        const model = cardQuarantine.getBlank();
        ['props', 'labels', 'visibility'].forEach(key => {
            if (!card[key]) {
                delete model[key];
            } else {
                model[key] = sanitizeObject(model[key], card[key])
            }
        })
        model.cid = cardQuarantine.nextIncrement();
        // at this point cards still have the old TID!
        tabQuarantine.set(model.cid, model);
    })
}

/**
 * Put tabs into a temporary store
 * @param {Object} tabs 
 */
const quarantineTabs = tabs => {
    tabs.forEach(tab => {
        const model = tabQuarantine.getBlank();
        if (!tab.styles) {
            delete model.styles;
        } else {
            model.styles = sanitizeObject(model.styles, tab.styles)
        }
        // preserve custom titles, update Roman number titles
        if (!(/^[CDILMVX]+$/.test(tab.title))) {
            model.title = tab.title;
        }
        // update card TID
        for (let [cid, card] of cardQuarantine.entries()) {
            if (cardQuarantine.toTid(card) === tabQuarantine.toTid(tab)) {
                cardQuarantine.set(`${cid}.tid`, model.tid);
            }
        }
        // at this point cards still have the old TID!
        cardQuarantine.set(model.tid, model);
    })
}

/**
 * Check the structure of a dataset
 * @param {Object} data 
 * @returns {Boolean}
 */
const structureIsValid = data => {
    const keys = Object.keys(data);
    return keys.includes('tabs') &&
        keys.includes('cards') &&
        Array.isArray(data.tabs) &&
        Array.isArray(data.cards)
}

/**
 * Process uploaded data
 * @param {Array} dataArr Data from upload, each element represents the content of one uploaded file.
 */
const process = dataArr => {

    if (!tabQuarantine) {
        tabQuarantine = new TabTree({
            data: {},
            minIncrement: tabStore.nextIncrement()
        });
    }

    if (!cardQuarantine) {
        cardQuarantine = new CharTree({
            data: {},
            minIncrement: cardStore.nextIncrement()
        });
    }

    dataArr = dataArr.map(e => JSON.parse(e));

    dataArr.forEach(data => {
        if (!structureIsValid(data)) {
            console.error(`Invalid import data`);
        }

        // tmp store for cleaned up and updated copies of tabs and cards
        quarantineCards(data.cards);
        quarantineTabs(data.tabs);

        tabQuarantine.values().forEach(tab => {
            tabManager.add(tab);
        })

        cardQuarantine.values().forEach(card => {
            cardManager.add(card);
        })

        // delete quarantined data
        cardQuarantine.flush();
        tabQuarantine.flush();

        properties.unset('importState');
    })
}

export default {
    process
}