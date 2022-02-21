import fn from 'fancy-node';
import settings from '../../../modules/settings/settings.js';
import convertToRoman from '../../../modules/roman-numerals/roman-numerals.js';
import softDelete from '../../../modules/softDelete/softdelete.js';
import styleManager from '../styles/styleManager.js';

/**
 * Key of the user's collection in localStorage
 */
const lsKey = settings.get('storageKeys.tabs');

let app;
let tabList = {}
let navi;
let contentArea;

let activeTab;
let activeTid;


/**
 * Storage handling
 */
const storage = {
    read: () => {
        const stored = JSON.parse(localStorage.getItem(lsKey) || '{}');
        return Object.keys(stored).length ? stored : {
            // ensure there is always at least one tab
            1: createTabEntry()
        };
    },
    update: () => {
        return localStorage.setItem(lsKey, JSON.stringify(tabList || {}))
    }
}

/**
 * Auto increment tab id (TID)
 * @returns {Number}
 */
const nextIncrement = () => {
    return Math.max(...[0].concat(Object.keys(tabList))) + 1;
}

/**
 * Create data for a new tab (tid as in Tab ID)
 * @returns {{title, tid: {Integer}}}
 */
const createTabEntry = () => {
    const tid = nextIncrement();
    return {
        tid,
        title: convertToRoman(tid),
        styles: {}
    }
}

/**
 * Set current ab to active
 * @param {HTMLElement} tab
 */
const setActiveTab = tab => {
    activeTab = tab || (activeTid ? fn.$(`tab-handle[tid="${activeTid}"]`, navi) : fn.$(`tab-handle`, navi));
    activeTid = parseInt(activeTab.tid, 10);
    fn.$$('tab-handle', navi).forEach(tab => {
        tab.classList.remove('active');
        tab.panel.classList.remove('active');
        delete tabList[parseInt(tab.tid, 10)].active;
        tab.removeAttribute('style');
    });
    // DOM Tab
    activeTab.classList.add('active');
    styleManager.setStyles(activeTab.styles, activeTab.panel);
    app.trigger('activeTabChange', activeTab);

    const naviRect = navi.getBoundingClientRect();
    const atRect = activeTab.getBoundingClientRect();
    const addRect = navi.lastChild.getBoundingClientRect();
    const space = naviRect.width - (addRect.width - 5) - atRect.width;
    
    navi.classList.remove('overflown');

    if (navi.scrollWidth > navi.clientWidth) {
        navi.classList.add('overflown');
        const nonActiveTabs = getTabs(activeTab);
        const tabMaxWidth = space / nonActiveTabs.length
        nonActiveTabs.forEach(tab => {
            tab.style.maxWidth = tabMaxWidth + 'px'
        })
    }

    // DOM Panel
    activeTab.panel.classList.add('active');
    // model
    tabList[activeTid].active = true;
    storage.update();
    return activeTab;
}

/**
 * get the currently active tab
 * @returns {HTMLElement}
 */
const getActiveTab = () => {
    return activeTab;
}

const getTabByTid = tid => {
    return fn.$(`tab-handle[tid="${tid}"]`, navi);
}

/**
 * Retrieve tabs as array
 * @param {HTMLElement|String} exclude 
 * @returns 
 */
const getTabs = exclude => {
    let tabs = Array.from(fn.$$(`tab-handle`, navi));
    switch (true) {
        // all but this
        case exclude instanceof customElements.get('tab-handle'):
            return tabs.filter(tab => !tab.isSameNode(exclude));
            // non active
        case exclude instanceof customElements.get('tab-handle'):
            return tabs.filter(tab => !tab.isSameNode(activeTab));
            // empty tabs
        case exclude === 'empty':
            return tabs.filter(tab => !fn.$('card-base', tab));
        case exclude === 'nonEmpty':
            return tabs.filter(tab => !!fn.$('card-base', tab));
        default:
            return tabs;
    }
}

const renameTab = (tab, title) => {
    tabList[parseInt(tab.tid, 10)].title = title;
    storage.update();
}

/**
 * Create a new tab, either from existing or freshly create data
 * @param {Object} [tabEntry]
 * @returns {HTMLElement}
 */
const createTab = ({
    tabEntry,
    previousTab,
    activate = false
} = {}) => {
    tabEntry = tabEntry || createTabEntry();

    // build DOM elements
    const tab = document.createElement('tab-handle');
    tab.panel = document.createElement('tab-panel');
    tab.container = navi;

    for (let [key, value] of Object.entries(tabEntry)) {
        tab[key] = value;
        tab.panel[key] = value;
    }
    contentArea.append(tab.panel);

    if (previousTab) {
        previousTab.after(tab)
    } else {
        fn.$('.adder', navi).before(tab);
    }

    // inform model
    tabList[tabEntry.tid] = tabEntry;

    if (activate) {
        setActiveTab(tab);
    }

    storage.update();
    return tab;
}

/**
 * Determine the next tab to activate upon deletion, can be the tab after (default), before or a newly create one
 * @returns {HTMLElement}
 */
const getUpcomingActiveTab = () => {
    let tabs = Array.from(fn.$$(`tab-handle:not([data-soft-deleted])`, navi));
    if (!tabs.length) {
        return createTab();
    }
    let activeIdx = Math.max(0, tabs.findIndex(e => e.isSameNode(activeTab)));
    if (tabs[activeIdx + 1]) {
        return tabs[activeIdx + 1];
    }
    if (tabs[activeIdx - 1]) {
        return tabs[activeIdx - 1];
    }
    return createTab();
}

const bulkDelete = exclude => {
    getTabs(exclude).forEach(tab => {
        handleRemoval(tab, 'remove');
        softDelete.cancel();
    })
}

/**
 * Tabs are first soft deleted and expire after 10 secs
 * All display functionality is handled by `softDelete`
 *
 * @param {HTMLElement} tab
 * @param {String} action
 */
const handleRemoval = (tab, action) => {
    const tid = parseInt(tab.tid, 10);
    switch (action) {
        case 'soft':
            // when deleting the active tab
            if (tab.isSameNode(activeTab)) {
                setActiveTab(getUpcomingActiveTab());
            }
            // DOM
            softDelete.initiate(tab, 'Tab ' + tab.title)
                .then(data => {
                    handleRemoval(tab, data.action);
                })
            // local model
            tabList[tid].softDeleted = true;
            break;
        case 'restore':
            delete tabList[tid].softDeleted;
            break;
        case 'remove':
            // inform app to delete cards
            app.trigger('tabDelete', {
                tid
            })
            delete tabList[tid];
            tab.panel.remove();
            tab.remove();
            if (Object.keys(tabList).length === 0) {
                createTab({
                    activate: true
                });
            }
            break;
        case 'empty':
            bulkDelete('empty');
            setActiveTab();
            break;
        case 'others':
            bulkDelete(tab);
            setActiveTab(tab);
            break;
        case 'all':
            bulkDelete();
            break;
    }
    storage.update();
}

/**
 * Restore the tabs from earlier sessions, cards are added by the card manager
 */
const restore = () => {

    // find out which tab has been active in the last session, 
    // fall back to the first one
    const entries = Object.values(tabList);
    const activeSet = entries.filter(e => !!e.active)
    activeTid = activeSet.length ? activeSet[0].tid : Object.keys(tabList)[0];

    for (let tabEntry of entries) {
        createTab({
            tabEntry
        });
    }

    setActiveTab();
}




const init = _app => {
    app = _app;
    navi = fn.$('tab-navi', app);
    contentArea = fn.$('tab-content', app);
    tabList = storage.read();
    restore();

    // events
    app.on('styleChange', e => {
        activeTab.panel.style.setProperty(e.detail.name, e.detail.value);
        tabList[activeTid].styles[e.detail.area] = tabList[activeTid].styles[e.detail.area] || {};
        tabList[activeTid].styles[e.detail.area][e.detail.name] = e.detail.value;
        storage.update();
    });
}

export default {
    init,
    getActiveTab,
    createTab,
    handleRemoval,
    setActiveTab,
    renameTab,
    getTabByTid,
    getTabs
}