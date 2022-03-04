import {
    cardStore,
    tabStore
} from "../../app/storage/storage.js";

const getFileName = () => {
    return `ghastly-creatures-${new Date().toISOString().substring(0,19).replace(/[T\:]/g, '-')}.json`;
}

const getData = ({
    cidData,
    tidData
}) => {
    if (cidData) {
        let card = cardStore.get(cidData);
        let tab = tabStore.get(card);
        return {
            tabs: {
                [tabStore.toTid(tab)]: tab
            },
            cards: {
                [cardStore.toCid(card)]: card
            }
        }
    }

    if (tidData) {
        return {
            cards: cardStore.object('tid', '===', tabStore.toTid(tidData)),
          //  tabs: tabStore.object('tid', 'equals', tabStore.toTid(tidData))
        }
    }

    return {
        cards: cardStore.object(),
        tabs: tabStore.object()
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