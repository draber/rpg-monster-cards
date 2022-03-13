import {
    cardStore,
    tabStore
} from "../../app/storage/storage.js";
import idHelper from "../../app/storage/id-helper.js";

/**
 * Build a file name in the style 'ghastly-creatures-2022-03-07-21-02-22.json'
 * @returns {String}
 */
const getFileName = () => {
    return `ghastly-creatures-${new Date().toISOString().substring(0,19).replace(/[T\:]/g, '-')}.json`;
}

/**
 * Tabs might have the active flag which is irrelevant in this scenario
 * @param {Object} entry 
 * @returns 
 */
const removeActiveKey = entry => {
    delete entry.active;
    return entry;
}

/**
 * Retrieve data combined from both the card and the tab store
 * @param {HTMLElement|Entry|String|Number|undefined} cidData [cidData] 
 * @param {HTMLElement|Entry|String|Number|undefined} tidData [tidData] 
 * @returns {Object}
 */
const getData = ({
    cidData,
    tidData
} = {}) => {
    
    // data exported from a specific card
    if (cidData) {
        let cid = idHelper.toCid(cidData)
        let card = cardStore.get(cid);
        let tid = idHelper.toTid(card);
        let tab = tabStore.get(tid);
        return {
            tabs: {
                [tid]: [tab].map(removeActiveKey)
            },
            cards: {
                [cid]: [card]
            }
        }
    }

    // data exported from a specific tab
    if (tidData) {
        return {
            cards: cardStore.values(['tid', '===', idHelper.toTid(tidData)]),
            tabs: tabStore.values(['tid', '===', idHelper.toTid(tidData)]).map(removeActiveKey)
        }
    }

    return {
        cards: cardStore.values(),
        tabs: tabStore.values().map(removeActiveKey)
    }
}

const getUrl = (fileName, {
    cidData,
    tidData
} = {}) => {
    const data = [JSON.stringify(getData({
        cidData,
        tidData
    }))];
    return URL.createObjectURL(new File(
        data,
        fileName, {
            type: 'application/json',
        }
    ))
}

export default {
    getFileName,
    getUrl
}