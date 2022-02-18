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
            1: createTabEntry()
        };
    },
    update: () => {
        return localStorage.setItem(lsKey, JSON.stringify(tabList || {}))
    }
}


const nextIncrement = () => {
    return Math.max(...[0].concat(Object.keys(tabList))) + 1;
}

const setActiveTab = tab => {
    activeTab = tab || (activeTid ? fn.$(`tab-handle[tid="${activeTid}"]`, navi) : fn.$(`tab-handle`, navi));
    activeTid = activeTab.tid;
    fn.$$('tab-handle', navi).forEach(tab => {
        tab.classList.remove('active');
        tab.panel.classList.remove('active');
        delete tabList[tab.tid].active;
    });
    activeTab.classList.add('active');
    activeTab.panel.classList.add('active');
    tabList[activeTid].active = true;
    storage.update();
}

const getActiveTab = () => {
    return activeTab;
}

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
    tabList[tab.tid] = tabEntry;
    storage.update();
    return tab;
}

const handleRemoval = (tab, action) => {

    switch (action) {
        case 'soft':
            softDelete(tab, 'Tab ' + tab.label)
                .then(data => {
                    handleRemoval(tab, data.action);
                })
            tabList[tab.tid].softDeleted = true;
            if (tab.isSameNode(activeTab)) {
                setActiveTab(
                    fn.$(`tab-handle[tid="${activeTid}"] ~ tab-handle`, navi) ||
                    tab.previousElementSibling
                );
            }
            break;
        case 'restore':
            delete tabList[tab.tid].softDeleted;
            break;
        case 'remove':
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