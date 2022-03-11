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
 * @param {Object} modelData 
 * @param {Object} uploadedData 
 * @returns 
 */
const sanitizeObject = (modelData, uploadedData) => {
    const sanitized = {};
    // make sure to use only valid keys
    Object.keys(modelData).forEach(key => {
        sanitized[key] = uploadedData[key]; //sanitizeText(uploadedData[key] || '');
    })
    return sanitized;
}

/**
 * Put cards into a temporary store
 * @param {Object} cards 
 */
const quarantineCards = cards => {
    cards.forEach(card => {
        // pull an empty card
        const model = cardQuarantine.getBlank();
        // go over the properties that are objects
        ['props', 'labels', 'visibility'].forEach(type => {
            model[type] = sanitizeObject(model[type], card[type]);
        })
        // memorize the original tid
        model.originalTid = cardQuarantine.toTid(card.tid);
        cardQuarantine.set(model.cid, model);
    })
}

/**
 * Put tabs into a temporary store
 * @param {Object} tabs 
 */
const quarantineTabs = tabs => {
    tabs.forEach(tab => {
        const model = tabQuarantine.getBlank();

        // memorize the tab's original tid as it's needed to identify the matching cards later on
        model.originalTid = tab.tid;
        model.styles = sanitizeObject(model.styles, (tab.styles || {}));

        // preserve custom titles, update Roman number titles
        if (!(/^[CDILMVX]+$/.test(tab.title))) {
            model.title = tab.title;
        }
        // save tab data with a new tid
        tabQuarantine.set(model.tid, model);
    })
}

/**
 * Update the card's tid to the tab they should now inhabit
 * @param {Array} tab 
 * @param {Number} [tid] 
 */
const updateCardTids = (tab, tid) => {
    // it doesn't matter of which tree's `toTid()` is used, they all return the same value
    // tabQuarantine only exists when no tid is given
    const condition = !tid ? ['originalTid', '===', tabQuarantine.toTid(tab.originalTid)] : undefined;
    cardQuarantine.entries(condition).forEach((card, cid) => {
        delete card.originalTid;
        card.tid = tid || tabQuarantine.toTid(tab);
        // update card with new tid
        cardQuarantine.set(cid, card);
        if (!tid) {
            // delete old TID if applicable
            cardQuarantine.unset(`${cid}.originalTid`);
        }
    })
    if (!tid) {
        // delete `originialTid`
        tabQuarantine.unset(`${tid}.originalTid`);
    }
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
        Array.isArray(data.cards) &&
        data.tabs.length &&
        data.cards.length
}

/**
 * Process uploaded data
 * @param {Array} dataArr Data from upload, each element represents the content of one uploaded file.
 * @param {*} [tid] TID, in case the cards need to be added to a specific tab
 */
const process = (dataArr, tid) => {


    // convert entries to actual arrays
    dataArr = dataArr.map(e => JSON.parse(e));

    // validate data structure and size
    for (let i = 0; i < dataArr.length; i++) {
        if (!structureIsValid(dataArr[i])) {
            dataArr.splice(i, 1);
            console.error(`Invalid import data found`);
        }
    }
    if (!dataArr.length) {
        console.error(`No valid import data found, aborting`);
        // remove upload UI
        properties.unset('importState');
        return false;
    }

    // ensure there is a quarantine for cards, regardless whether there is a tid or not
    if (!cardQuarantine) {
        cardQuarantine = new CharTree({
            data: {},
            minIncrement: cardStore.nextIncrement()
        });
    }

    // for tabs quarantine is only needed if we dont have a tid
    if (!tid && !tabQuarantine) {
        tabQuarantine = new TabTree({
            data: {},
            minIncrement: tabStore.nextIncrement()
        });
    }

    dataArr.forEach(data => {

        // Cards must go first
        // tid: cards go into a pre-specified tab by its tid
        if (tid) {
            data.cards.map(card => {
                card.tid = tid;
                return card;
            })
            quarantineCards(data.cards);

            // assign the specified tab's tid to the cards, tabs from the import will be discarded
            updateCardTids(tabStore.get(tid), tid);
        }
        // !tid: cards go into their original tab
        else {
            quarantineCards(data.cards);

            // quarantine new tabs
            quarantineTabs(data.tabs);

            // add them to the ui
            tabQuarantine.values().forEach(tab => {
                // reassign the card's tid
                updateCardTids(tab);
                tabManager.add(tab);
            })
        }

        // add the card to either their original tab or a prespecified tab, depending on their TID
        cardQuarantine.values().forEach(card => {
            console.log({
                c: card,
                t: card.tid
            })
            // cardManager.add(card);
        })

        // delete quarantined data
        cardQuarantine.flush();
        if (tabQuarantine && !tid) {
            tabQuarantine.flush();
        }

        // remove upload UI
        properties.unset('importState');
    })
}

export default {
    process
}