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
 * @returns {{label, tid: {Integer}}}
 */
const createTabEntry = () => {
    const tid = nextIncrement();
    return {
        tid,
        label: convertToRoman(tid)
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
    activeTid = activeTab.tid;
    fn.$$('tab-handle', navi).forEach(tab => {
        tab.classList.remove('active');
        tab.panel.classList.remove('active');
        delete tabList[tab.tid].active;
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
    tabList[tab.tid] = tabEntry;
    storage.update();
    return tab;
}

/**
 * Determine the next tab to activate upon deletion, can be the tab after (default), before or a newly create one
 * @returns {HTMLElement}
 */
const getUpcomingActiveTab = () => {
    let tabs = Array.from(fn.$$(`tab-handle:not([data-soft-deleted])`, navi));
    if(!tabs.length) {
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

/**
 * Tabs are first soft deleted and expire after 10 secs
 * All display functionality is handled by `softDelete()`
 *
 * @param {HTMLElement} tab
 * @param {String} action
 */
const handleRemoval = (tab, action) => {

    switch (action) {
        case 'soft':
            // when deleting the active tab
            if (tab.isSameNode(activeTab)) {
                setActiveTab(getUpcomingActiveTab());
            }
            // DOM
            softDelete(tab, 'Tab ' + tab.label)
                .then(data => {
                    handleRemoval(tab, data.action);
                })
            // local model
            tabList[tab.tid].softDeleted = true;
            break;
        case 'restore':
            delete tabList[tab.tid].softDeleted;
            break;
        case 'remove':
            // inform app to delete cards
            app.trigger('tabDelete', {
                tid: tab.tid
            })
            delete tabList[tab.tid];
            tab.panel.remove();
            tab.remove();
            if (Object.keys(tabList).length === 0) {
                createTab();
                setActiveTab();
            }
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
    setActiveTab
}