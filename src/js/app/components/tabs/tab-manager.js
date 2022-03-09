import fn from 'fancy-node';
import softDelete from '../../../modules/softDelete/softdelete.js';
import { tabStore } from '../../storage/storage.js';

let app;
let navi;
let contentArea;

let activeTab;

/**
 * Set current ab to active
 * @param {HTMLElement} [tab]
 */
const setActiveTab = tab => {
    // active tab | any tab | first tab
    activeTab = tab || activeTab || fn.$(`tab-handle`, navi);

    // deactivate all tabs
    fn.$$('tab-handle', navi).forEach(tab => {
        tab.classList.remove('active');
        tab.panel.classList.remove('active');
        tabStore.unset(`${tabStore.toTid(tab)}.active`);
        tab.removeAttribute('style');
    });

    // set the selected tab active
    const tid = tabStore.toTid(activeTab);
    // DOM Tab
    activeTab.classList.add('active');
    // DOM Panel
    activeTab.panel.classList.add('active');
    // model
    tabStore.set(`${tid}.active`, true);
    app.trigger('tabStyleChange', {
        tab: activeTab,
        styles: tabStore.get(tid).styles
    });

    // avoid scrollbars in the tab bar
    // 1: figure out how much room we have
    const naviRect = navi.getBoundingClientRect();
    const atRect = activeTab.getBoundingClientRect();
    const addRect = navi.lastChild.getBoundingClientRect();
    const space = naviRect.width -
        (addRect.width + parseInt(getComputedStyle(navi.lastChild).marginLeft)) -
        atRect.width;

    navi.classList.remove('overflown');
    
    // 2: set the non-active tabs to as tiny as needed
    if (navi.scrollWidth > navi.clientWidth) {
        navi.classList.add('overflown');
        const nonActiveTabs = getTabs(activeTab);
        const tabMaxWidth = space / nonActiveTabs.length
        nonActiveTabs.forEach(tab => {
            tab.style.maxWidth = tabMaxWidth + 'px'
        })
    }

    return activeTab;
}

/**
 * 
 * @param {HTMLElement|Object|String|Number} tabData 
 * @returns 
 */
const getTab = tabData => {
    // return the active tab
    if (tabData === 'active') {
        return activeTab;
    }
    // return the element as long as it's a tab
    if (tabData instanceof customElements.get('tab-handle')) {
        return tabData
    }
    // parse tabData for a TID and return the matching tab
    return fn.$(`tab-handle[tid="${tabStore.toTid(tabData)}"]`, navi);
}

/**
 * Retrieve tabs as array
 * @param {HTMLElement|String|Number} [exclude] tabs to exclude 
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
 * Add a new tab, either from existing or freshly created data
 * @param {Object} [tabEntry] tab model
 * @param {HTMLElement} [previousTab] the tab left to the insertion point
 * @param {Boolean} [activate] wheteher or not to activate the tab
 * @returns 
 */
const add = ({
    tabEntry,
    previousTab,
    activate = false
} = {}) => {
    // existing or fresh model
    tabEntry = tabEntry || tabStore.getBlank();

    // build DOM elements
    const tab = document.createElement('tab-handle');
    tab.panel = document.createElement('tab-panel');
    
    tab.container = navi;

    // copy properties to both parts
    for (let [key, value] of Object.entries(tabEntry)) {
        tab[key] = value;
        tab.panel[key] = value;
    }
    // remove the title agin from the panel to avoid unwanted 'tooltips'
    tab.panel.removeAttribute('title');

    // let the tab know its panel
    contentArea.append(tab.panel);

    // insert a predfine insertion point
    if (previousTab) {
        previousTab.after(tab)
    } 
    // add it at the very end but before the '+'
    else {
        fn.$('.adder', navi).before(tab);
    }

    // inform model
    tabStore.set(tabStore.toTid(tabEntry), tabEntry);

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
    // get all currently accessible tabs
    let tabs = Array.from(fn.$$(`tab-handle:not([data-soft-deleted])`, navi));
    if (!tabs.length) {
        return add();
    }
    // find the index of the currently active tab
    let activeIdx = Math.max(0, tabs.findIndex(e => e.isSameNode(activeTab)));
    // is there a tab to the right of the active one?
    if (tabs[activeIdx + 1]) {
        return tabs[activeIdx + 1];
    }
    // is there a tab to the left of the active one?
    if (tabs[activeIdx - 1]) {
        return tabs[activeIdx - 1];
    }
    // add a fresh tab
    return add();
}

/**
 * Hard delete multiple tab, optionally some can be excluded
 * @param {HTMLElement|String|Number} [exclude] tabs to exclude 
 */
const bulkDelete = exclude => {
    // cancel all ongoing soft deletions
    // not absolutely necessary, but otherwise the result could chaotic
    softDelete.cancel();
    // hard delete all candidates
    getTabs(exclude).forEach(tab => {
        handleRemoval(tab, 'remove');
    })
    if (!tabStore.length) {
        add({
            activate: true
        });
    }
}

/**
 * Tabs are usually first soft deleted and expire after 10 secs
 * All display functionality is handled by `softDelete`
 * @param {HTMLElement|Object} tab
 * @param {String} action
 */
const handleRemoval = (tab, action) => {
    switch (action) {
        // trigger soft deletion process
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
            tabStore.set(`${tabStore.toTid(tab)}.softDeleted`, true);
            break;

        // restore a previously soft deleted tab
        case 'restore':
            tabStore.unset(`${tabStore.toTid(tab)}.softDeleted`);
            break;

        // delete a tab for good
        case 'remove':
            
            // inform app to delete cards
            app.trigger('tabDelete', {
                tab
            })
            tabStore.remove(tab);
            tab.remove();
            if (!tabStore.length) {
                add({
                    activate: true
                });
            }
            break;

        // bulk delete all empty tabs (hard)
        case 'empty':
            bulkDelete('empty');
            setActiveTab();
            break;

        // bulk delete all empty tabs but the one in the argument (hard)
        case 'others':
            bulkDelete(tab);
            setActiveTab(tab);
            break;

        // bulk delete all tabs (hard)
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
    const entries = tabStore.values();
    const activeSet = entries.filter(e => !!e.active);
    const activeTid = activeSet.length ? tabStore.toTid(activeSet[0]) : tabStore.keys()[0];
    
    for (let tabEntry of entries) {
        add({
            tabEntry
        });
    }

    setActiveTab(getTab(activeTid));
}


/**
 * Innitialize the manager
 * @param {HTMLElement} _app The outer container of the interactive area
 */
const init = _app => {

    // relevant conatiners
    app = _app;
    navi = fn.$('tab-navi', app);
    contentArea = fn.$('tab-content', app);

    // restore tabs and cards from earlier sessions
    restore();

    // events
    // add a style property to the tab and store it
    app.on('singleStyleChange', e => {
        const tab = e.detail.tab || activeTab;
        const tid = tabStore.toTid(tab);
        const entry = tabStore.get(tid);
        entry.styles[e.detail.area] = entry.styles[e.detail.area] || {};
        entry.styles[e.detail.area][e.detail.name] = e.detail.value;
        tabStore.set(tid, entry);
        if (tab.isSameNode(activeTab)) {
            tab.panel.style.setProperty(e.detail.name, e.detail.value);
        }
    });

    // remove all styles from a tab, flaling back to the default setup
    app.on('styleReset', e => {
        const tid = tabStore.toTid(e.detail.tab);
        tabStore.set(`${tid}.styles`, {});
        app.trigger('tabStyleChange', {
            tab: e.detail.tab,
            styles: {}
        });
    });
}

export default {
    init,
    add,
    handleRemoval,
    setActiveTab,
    getTab,
    getTabs
}