import {
    cardStore,
    tabStore
} from "../../app/storage/storage.js";

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
        let card = cardStore.get(cidData);
        let tab = tabStore.get(card);
        return {
            tabs: {
                [tabStore.toTid(tab)]: [tab].map(removeActiveKey)
            },
            cards: {
                [cardStore.toCid(card)]: [card]
            }
        }
    }

    // data exported from a specific tab
    if (tidData) {
        return {
            cards: cardStore.values(['tid', '===', cardStore.toTid(tidData)]),
            tabs: tabStore.values(['tid', '===', tabStore.toTid(tidData)]).map(removeActiveKey)
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