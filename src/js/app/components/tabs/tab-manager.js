import fn from 'fancy-node';
import softDelete from '../../../modules/softDelete/softdelete.js';
import tabStorage from './tab-storage.js';

let app;
let navi;
let contentArea;

let activeTab;

/**
 * Set current ab to active
 * @param {HTMLElement} tab
 */
const setActiveTab = tab => {
    activeTab = tab || activeTab || fn.$(`tab-handle`, navi);
    fn.$$('tab-handle', navi).forEach(tab => {
        tab.classList.remove('active');
        tab.panel.classList.remove('active');
        tabStorage.update(tab, 'active', null);
        tab.removeAttribute('style');
    });
    // DOM Tab
    activeTab.classList.add('active');
    app.trigger('tabStyleChange', {
        tab: activeTab,
        styles: tabStorage.get(activeTab).styles
    });

    const naviRect = navi.getBoundingClientRect();
    const atRect = activeTab.getBoundingClientRect();
    const addRect = navi.lastChild.getBoundingClientRect();
    const space = naviRect.width -
        (addRect.width + parseInt(getComputedStyle(navi.lastChild).marginLeft)) -
        atRect.width;

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
    tabStorage.update(activeTab, 'active', true);
    return activeTab;
}

const getTab = tabData => {
    if (tabData === 'active') {
        return activeTab;
    }
    if (tabData instanceof HTMLElement) {
        return tabData
    }
    return fn.$(`tab-handle[tid="${tabStorage.parseTid(tabData)}"]`, navi);
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

        // empty tabs
        case exclude === 'empty':
            return tabs.filter(tab => !fn.$('card-base', tab));

        // all tabs
        default:
            return tabs;
    }
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
    tabEntry = tabEntry || tabStorage.get();

    // build DOM elements
    const tab = document.createElement('tab-handle');
    tab.panel = document.createElement('tab-panel');
    
    tab.container = navi;

    for (let [key, value] of Object.entries(tabEntry)) {
        tab[key] = value;
    }
    tab.panel.active = tab.active;
    tab.panel.tid = tab.tid;
    contentArea.append(tab.panel);

    if (previousTab) {
        previousTab.after(tab)
    } else {
        fn.$('.adder', navi).before(tab);
    }

    // inform model
    tabStorage.set(tabEntry, tabEntry);

    if (activate) {
        setActiveTab(tab);
    }

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
    softDelete.cancel();
    getTabs(exclude).forEach(tab => {
        handleRemoval(tab, 'remove');
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
            tabStorage.update(tab, 'softDeleted', true);
            break;
        case 'restore':
            tabStorage.update(tab, 'softDeleted', null);
            break;
        case 'remove':
            // inform app to delete cards
            app.trigger('tabDelete', {
                tab
            })
            tabStorage.remove(tab);
            tab.remove();
            if (Object.keys(tabStorage.get('all')).length === 0) {
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
}

/**
 * Restore the tabs from earlier sessions, cards are added by the card manager
 */
const restore = () => {

    // find out which tab has been active in the last session, 
    // fall back to the first one
    const entries = Object.values(tabStorage.get('all'));
    const activeSet = entries.filter(e => !!e.active);
    const activeTid = activeSet.length ? activeSet[0].tid : Object.keys(tabStorage.get('all'))[0];

    for (let tabEntry of entries) {
        createTab({
            tabEntry
        });
    }

    setActiveTab(getTab(activeTid));
}




const init = _app => {
    app = _app;
    navi = fn.$('tab-navi', app);
    contentArea = fn.$('tab-content', app);
    restore();

    // events
    app.on('singleStyleChange', e => {
        const tab = e.detail.tab || activeTab;
        const entry = tabStorage.get(tab);
        entry.styles[e.detail.area] = entry.styles[e.detail.area] || {};
        entry.styles[e.detail.area][e.detail.name] = e.detail.value;
        tabStorage.set(tab, entry);
        if (tab.isSameNode(activeTab)) {
            tab.panel.style.setProperty(e.detail.name, e.detail.value);
        }
    });

    app.on('styleReset', e => {
        tabStorage.update(e.detail.tab, 'styles', {});
        app.trigger('tabStyleChange', {
            tab: e.detail.tab,
            styles: {}
        });
    });
}

export default {
    init,
    createTab,
    handleRemoval,
    setActiveTab,
    getTab,
    getTabs
}