import fn from 'fancy-node';
import softDelete from '../../../modules/softDelete/softdelete.js';
import {
    presetStore,
    tabStore
} from '../../storage/storage.js';
import idHelper from '../../storage/id-helper.js';

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
        tabStore.unset(`${idHelper.toTid(tab)}.active`);
        tab.removeAttribute('style');
    });

    // set the selected tab active
    const tid = idHelper.toTid(activeTab);
    // DOM Tab
    activeTab.classList.add('active');
    // DOM Panel
    activeTab.panel.classList.add('active');
    // model
    tabStore.set(`${tid}.active`, true);

    app.trigger('styleUpdate', {
        css: tabStore.get(`${tid}.css`) || {}
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
    return fn.$(`tab-handle[tid="${idHelper.toTid(tabData)}"]`, navi);
}

/**
 * Retrieve tabs as array
 * @param {HTMLElement|String|Number|Array|NodeList} [exclude] tabs to exclude 
 * @returns 
 */
const getTabs = exclude => {
    let tabs = Array.from(fn.$$(`tab-handle`, navi));

    if (!exclude) {
        return tabs
    }

    // case remove empty tabs
    if (exclude === 'populated') {
        return tabs.filter(tab => !fn.$('card-base', tab.panel));
    }

    if (exclude === 'soft-deleted') {
        return tabs.filter(tab => !tab.dataset.softDeleted);
    }


    // transform exclude to an array
    if (exclude.forEach) {
        exclude = Array.from(exclude);
    } else if (exclude instanceof customElements.get('tab-handle')) {
        exclude = [exclude];
    }

    return tabs.filter(tab => !exclude.includes(tab));
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
    tabStore.set(idHelper.toTid(tabEntry), tabEntry);

    if (activate) {
        setActiveTab(tab);
    }

    return tab;
}

/**
 * Hard delete multiple tab, optionally some can be excluded
 * @param {HTMLElement|String|Number} [exclude] tabs to exclude 
 */
const bulkDeleteExcept = exclude => {
    // cancel all ongoing soft deletions
    // not absolutely necessary, but otherwise the result would be chaotic
    softDelete.cancel();


    // candidates to be deleted
    let deletables = getTabs(exclude);

    // is the active tab amongst the deletables?
    let deleteActive = !!deletables.find(tab => tab.classList.contains('active'));

    // get all tabs that will survive the deletion
    let survivors = getTabs(deletables);

    // delete 
    deletables.forEach(tab => {
        handleRemoval(tab, 'remove');
    })

    // if no tabs are left, create a new one
    if (!survivors.length) {
        add({
            activate: true
        });
    }

    // if the active tab is going to be deleted, activate another one
    else if (deleteActive) {
        setActiveTab(getTabs()[0]);
    }
}

/**
 * Tabs are usually first soft deleted and expire after 10 secs
 * All display functionality is handled by `softDelete`
 * @param {HTMLElement|Object} tab
 * @param {String} action
 */
const handleRemoval = (tab, action) => {
    // ensure that tab is an element and not an object
    tab = getTab(tab);

    switch (action) {
        // trigger soft deletion process
        case 'soft':
            // DOM
            softDelete.initiate(tab, 'Tab ' + tab.title)
                .then(data => {
                    handleRemoval(tab, data.action);
                })

            // local model
            tabStore.set(`${idHelper.toTid(tab)}.softDeleted`, true);

            //if no visible tab has been left add a new one
            if (!tabStore.values(['softDeleted', '!==', true]).length) {
                add({
                    activate: true
                });
            }

            // when deleting the active tab
            if (tab.isSameNode(activeTab)) {
                setActiveTab(getTabs('soft-deleted')[0])
            }

            break;

            // restore a previously soft deleted tab
        case 'restore':
            tabStore.unset(`${idHelper.toTid(tab)}.softDeleted`);
            break;

            // delete a tab for good
        case 'remove':
            // inform app to delete cards
            app.trigger(
                'tabDelete',
                Array.from(fn.$$('card-base', tab.panel)).map(card => idHelper.toCid(card))
            )
            tabStore.remove(tab);
            tab.remove();
            break;

            // bulk delete all empty tabs (hard)
        case 'empty':
            bulkDeleteExcept('populated');
            //  setActiveTab(getTabs()[0]);
            break;

            // bulk delete all empty tabs but the one in the argument (hard)
        case 'others':
            bulkDeleteExcept(tab);
            setActiveTab(tab);
            break;

            // bulk delete all tabs (hard)
        case 'all':
            bulkDeleteExcept();
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
    const activeTid = activeSet.length ? idHelper.toTid(activeSet[0]) : tabStore.keys()[0];

    for (let tabEntry of entries) {
        add({
            tabEntry
        });
    }
    setActiveTab(getTab(activeTid));
}

/**
 * Apply or remove a single css property
 * @param {HTMLElement} panel 
 * @param {String} property 
 * @param {String} value 
 */
const handleStyleProp = (panel, property, value) => {
    const tid = idHelper.toTid(panel);
    // .replace(/"+/g, "'") fixes different formats of font names
    // This cannot be avoided because they are partially generated by the browser
    // and can be inconsistent between browsers.
    // The replacement won't hurt other values
    let presetValue = presetStore.get(`css.${property}`).replace(/"+/g, "'");
    let newValue = value.replace(/"+/g, "'");
    if (presetValue === newValue) {
        tabStore.unset(`${tid}.css.${property}`);
        panel.style.removeProperty(property);
    } else {
        tabStore.set(`${tid}.css.${property}`, newValue);
        panel.style.setProperty(property, newValue);
    }
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

    // events
    // add a style property to the tab and store it
    // typically triggered by any of the style controls
    app.on('singleStyleChange', e => {
        const tab = e.detail.tab || activeTab;
        const panel = tab.panel;
        handleStyleProp(panel, e.detail.name, e.detail.value);
    });

    // bulk apply styles to a tab
    // typically triggered by pasting styles
    app.on('bulkStyleChange', e => {
        const tab = e.detail.tab || activeTab;
        const panel = tab.panel;
        const tid = idHelper.toTid(panel);
        // fetch all styles that apply to this tab
        // redundancies will be handled by `handleStyleProp()`
        const css = {
            ...presetStore.get('css'),
            ...tabStore.get(`${tid}.css`)
        }
        for (let [property, value] of Object.entries(css)) {
            handleStyleProp(panel, property, value);
        }
        // update the form controls if required
        if (tab.isSameNode(activeTab)) {
            app.trigger('styleUpdate', {
                css: tabStore.get(tid).css || {}
            });
        }
    })

    // restore tabs and cards from earlier sessions
    restore();
}

export default {
    init,
    add,
    handleRemoval,
    setActiveTab,
    getTab,
    getTabs
}