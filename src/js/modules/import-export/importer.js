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
import cardManager from "../../app/components/cards/card-manager.js";
import domProps from '../dom-props/dom-props.js';
import idHelper from '../../app/storage/id-helper.js';

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
        sanitized[key] = uploadedData[key]; //todo: this needs to work on objects, not just strings! sanitizeText(uploadedData[key] || '');
    })
    return sanitized;
}

/**
 * Put cards into a temporary store
 * @param {Object} uploadedCards 
 */
const quarantineCards = uploadedCards => {
    uploadedCards.forEach(card => {
        // pull an empty card
        const model = cardQuarantine.getBlank();

        // memorize the original tid
        model.originalTid = idHelper.toTid(card.tid);

        // go over the properties that are objects
        ['props', 'labels', 'visibility'].forEach(type => {
            model[type] = sanitizeObject(model[type], card[type]);
        })
        cardQuarantine.set(model.cid, model);
    })
}

/**
 * Put tabs into a temporary store
 * @param {Object} uploadedTabs 
 */
const quarantineTabs = uploadedTabs => {
    uploadedTabs.forEach(tab => {
        // pull an empty tab
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
    const condition = !tid ? ['originalTid', '===', idHelper.toTid(tab.originalTid)] : undefined;

    for (let [cid, card] of cardQuarantine.entries(condition)) {
        // delete `card.originalTid` if any
        delete card.originalTid;
        card.tid = tid || idHelper.toTid(tab);
        // update card with new tid
        cardQuarantine.set(cid, card);
    }

    // delete `tab.originialTid` if any
    if (!tid) {
        tabQuarantine.unset(`${tab.tid}.originalTid`);
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
 * @returns {Integer|Boolean} Either the TID of the first card or false
 */
const process = (dataArr, tid) => {


    // convert entries to actual arrays
    dataArr = dataArr.map(e => JSON.parse(e));

    // validate data structure and size
    for (let i = 0; i < dataArr.length; i++) {
        if (!structureIsValid(dataArr[i])) {
            dataArr.splice(i, 1);
            console.error(`Invalid import data discarded`);
        }
    }

    // check if any data are left after validation
    if (!dataArr.length) {
        console.error(`No valid import data found, aborting`);
        // remove upload UI
        domProps.unset('importState');
        return false;
    }

    // ensure there is a fresh quarantine for cards and tabs
    cardQuarantine = new CharTree({
        data: {},
        minIncrement: cardStore.nextIncrement()
    });

    tabQuarantine = new TabTree({
        data: {},
        minIncrement: tabStore.nextIncrement()
    });

    let tabs = [];

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
            tabs.push(tabManager.getTab(tid));
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
                tab = tabManager.add(tab);
                tabs.push(tab)
            })
        }

        // add the card to either their original tab or a prespecified tab, depending on their TID
        cardQuarantine.values().forEach(card => {
            cardManager.add(card);
        })

        // remove upload UI
        domProps.unset('importState');

    })
    return tabs;
}

export default {
    process
}