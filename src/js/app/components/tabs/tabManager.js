import fn from 'fancy-node';
import settings from '../../../modules/settings/settings.js';

/**
 * Key of the user's collection in localStorage
 */
const lsKey = settings.get('storageKeys.tabs');
let data = {}
let navi;
let content;
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
        8: 'VII',
        9: 'IX',
        10: 'X'
    }
    if(numerals[tid]){
        return numerals[tid];
    }
    if(tid > 10 && tid < 21) {
        return 'X' + numerals[tid - 10]
    }
    return tid;
}

const getTabData = () => {
    const tid = nextIncrement();
    return {
        tid,
        label: toLatin(tid),
        state: 'visible'
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
        return localStorage.setItem(lsKey, JSON.stringify(data || {}))
    }
}


const nextIncrement = () => {
    return Math.max(...[0].concat(Object.keys(data))) + 1;
}


const getCurrentTab = () => {
    return currentTab;
}

const createTab = tabData => {
    tabData = tabData || getTabData();
    currentTab = document.createElement('tab-handle');
    currentTab.data = tabData;
    data[currentTab.data.tid] = currentTab;
    fn.$('.adder', navi).before(currentTab);
    return currentTab;
}

const init = () => {
    navi = fn.$('tab-navi');
    content = fn.$('tab-content');
    data = storage.read();
    for (let tab of Object.values(data)) {
        createTab(tab);
    }
}

export default {
    init,
    getCurrentTab,
    createTab
}