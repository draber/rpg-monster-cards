import CharTree from "../../app/storage/CharTree.js";
import TabTree from "../../app/storage/TabTree.js";
import {
    tabStore,
    cardStore,
    presetStore
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
 * Put cards into a temporary store
 * @param {Object} uploadedCards 
 */
const quarantineCards = uploadedCards => {
    uploadedCards.forEach(card => {
        // pull an empty card
        const model = cardQuarantine.getBlank();

        // memorize the original tid
        model.originalTid = idHelper.toTid(card.tid);

        // store the card
        cardQuarantine.set(model.cid, model);


        // Consider only keys that exist in the model
        // This is an awfully deep nesting. Don't so this at home.
        for (let key of Object.keys(model.fields)) {
            if (!card.fields[key]) {
                continue
            }
            if (card.fields[key].field) {
                if (card.fields[key].field.txt) {
                    // clean up field text
                    cardQuarantine.set(
                        `${model.cid}.fields.${key}.field.txt`,
                        sanitizeText(card.fields[key].field.txt)
                    );
                }
                if (typeof card.fields[key].field.vis !== 'undefined') {
                    // enforce boolean on text visibility
                    cardQuarantine.set(
                        `${model.cid}.fields.${key}.field.vis`,
                        !!card.fields[key].field.vis
                    );
                }
            }
            if (card.fields[key].label) {
                if (typeof card.fields[key].label.txt !== 'undefined') {
                    // clean up label short text
                    if (typeof card.fields[key].label.txt.short !== 'undefined') {
                        cardQuarantine.set(
                            `${model.cid}.fields.${key}.label.txt.short`,
                            sanitizeText(card.fields[key].label.txt.short)
                        );
                    }
                    // clean up label long text
                    if (typeof card.fields[key].label.txt.long !== 'undefined') {
                        cardQuarantine.set(
                            `${model.cid}.fields.${key}.label.txt.long`,
                            sanitizeText(card.fields[key].label.txt.long)
                        );
                    }
                }
                if (typeof card.fields[key].label.vis !== 'undefined') {
                    // enforce boolean on label visibility
                    cardQuarantine.set(
                        `${model.cid}.fields.${key}.label.vis`,
                        !!card.fields[key].label.vis
                    );
                }
            }
        }
    })
}

/**
 * Put tabs into a temporary store
 * @param {Object} uploadedTabs 
 */
const quarantineTabs = uploadedTabs => {
    // css presets
    const validCssProps = Object.keys(presetStore.get('css'));
    uploadedTabs.forEach(tab => {
        // pull an empty tab
        const model = tabQuarantine.getBlank();

        // memorize the tab's original tid as it's needed to identify the matching cards later on
        model.originalTid = tab.tid;

        // preserve custom titles, update Roman number titles
        if (!(/^[CDILMVX]+$/.test(tab.title))) {
            model.title = sanitizeText(tab.title);
        }
        // save tab data with a new tid
        tabQuarantine.set(model.tid, model);

        if (!tab.css) {
            return;
        }

        // consider only keys found in presets
        for (let property in validCssProps) {
            if (!tab.css[property]) {
                continue;
            }
            tabQuarantine.set(`${model.tid}.css.${property}`, sanitizeText(tab.css[property]));
        }
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
        minIncrement: cardStore.nextIncrement(),
        validFields: Object.keys(presetStore.get('cards'))
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