import fn from 'fancy-node';
import settings from '../../../modules/settings/settings.js';
import cardManager from '../character-cards/card-manager.js';

/**
 * Key of the user's collection in localStorage
 */
const lsKey = settings.get('storageKeys.tabs');
let tabs = {}
let navi;
let contentArea;
let currentTab;

const toLatin = tid => {
    const numerals = {
        1: 'I',
        2: 'II',
        3: 'III',
        4: 'IV',
        5: 'V',
        6: 'VI',
        7: 'VII',
        8: 'VIII',
        9: 'IX',
        10: 'X'
    }
    if (numerals[tid]) {
        return numerals[tid];
    }
    if (tid > 10 && tid < 21) {
        return 'X' + numerals[tid - 10]
    }
    return tid;
}

const getTabData = () => {
    const tid = nextIncrement();
    return {
        tid,
        label: toLatin(tid),
        active: true
    }
}



/**
 * Storage handling
 */
const storage = {
    read: () => {
        const stored = JSON.parse(localStorage.getItem(lsKey) || '{}');
        return Object.keys(stored).length ? stored : {
            1: getTabData()
        };
    },
    update: () => {
        return localStorage.setItem(lsKey, JSON.stringify(tabs || {}))
    }
}


const nextIncrement = () => {
    return Math.max(...[0].concat(Object.keys(tabs))) + 1;
}


const getCurrentTab = () => {
    return currentTab;
}

const createTab = tabData => {
    tabData = tabData || getTabData();
    currentTab = document.createElement('tab-handle');
    currentTab.panel = document.createElement('tab-panel');
    currentTab.container = navi;
   // console.log(tabData)
    if (tabData.active) {
        currentTab.classList.add('active');
        currentTab.panel.classList.add('active');
    }
    for (let [key, value] of Object.entries(tabData)) {
        currentTab[key] = value;
        currentTab.panel[key] = value;
    }
    contentArea.append(currentTab.panel);
    fn.$('.adder', navi).before(currentTab);
    for (let [tid, tab] of Object.entries(tabs)) {
        delete tabs[tid].active;
    }
    tabs[currentTab.tid] = {
        label: currentTab.label,
        tid: currentTab.tid,
        active: true
    }
    storage.update();
    return currentTab;
}

const handleRemoval = (tab, action) => {
    switch (action) {
        case 'soft':
            tabs[tab.tid].softDeleted = true;
            break;
        case 'restore':
            delete tabs[tab.tid].softDeleted;
            break;
        case 'remove':
            delete tabs[tab.tid];
            tab.panel.remove();
            tab.remove();
            if (Object.keys(tabs).length === 0) {
                createTab();
            }
            break;
    }
    storage.update();
    fn.$$('card-base', tab).forEach(card => {
        cardManager.handleRemoval(card, action);
    });
}


const init = () => {
    navi = fn.$('tab-navi');
    contentArea = fn.$('tab-content');
    tabs = storage.read();
    console.log(tabs)
    for (let [k,tabData] of Object.entries(tabs)) {
    console.log(k, tabData)
        createTab(tabData);
    }
    for (let tabData of Object.values(tabs)) {
    console.log(tabData)
        createTab(tabData);
    }
}

export default {
    init,
    getCurrentTab,
    createTab,
    handleRemoval
}