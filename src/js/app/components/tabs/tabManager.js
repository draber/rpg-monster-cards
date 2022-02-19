import fn from 'fancy-node';
import settings from '../../../modules/settings/settings.js';
import convertToRoman from '../../../modules/roman-numerals/roman-numerals.js';
import softDelete from '../../../modules/softDelete/softdelete.js';

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
 * Create data for a new tab (tid as in Tab ID)
 * @returns {{title, tid: {Integer}}}
 */
const createTabEntry = () => {
    const tid = nextIncrement();
    return {
        tid,
        title: convertToRoman(tid)
    }
}


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
    });
    // DOM Tab
    activeTab.classList.add('active');
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

const renameTab = (tab, title) => {
    tabList[parseInt(tab.tid, 10)].title = title;
    storage.update();
}

/**
 * Create a new tab, either from existing or freshly create data
 * @param {Object} [tabEntry]
 * @returns {HTMLElement}
 */
const createTab = tabEntry => {
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

    fn.$('.adder', navi).before(tab);

    // inform model
    tabList[tabEntry.tid] = tabEntry;
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

const bulkDelete = triggerTab => {
    fn.$$(triggerTab ? `tab-handle:not([tid="${triggerTab.tid}"])` : `tab-handle`, navi).forEach(tab => {
        handleRemoval(tab, 'remove');
    })
}

/**
 * Tabs are first soft deleted and expire after 10 secs
 * All display functionality is handled by `softDelete()`
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
            softDelete(tab, 'Tab ' + tab.title)
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
                setActiveTab(createTab());
            }
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
        createTab(tabEntry);
    }

    setActiveTab();
}


const init = _app => {
    app = _app;
    navi = fn.$('tab-navi', app);
    contentArea = fn.$('tab-content', app);
    tabList = storage.read();
    restore();
}

export default {
    init,
    getActiveTab,
    createTab,
    handleRemoval,
    setActiveTab,
    renameTab,
    getTabByTid
}