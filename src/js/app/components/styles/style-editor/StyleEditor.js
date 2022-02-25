import {
    on,
    trigger
} from '../../../../modules/events/eventHandler.js'
import tabManager from '../../tabs/tabManager.js';

/**
 * Custom element containing the list of fonts
 */
class StyleEditor extends HTMLElement {

    /**
     * Called on element launch
     */
    connectedCallback() {

        // event listeners on this element
        // single change from one of the controls
        this.app.on('singleStyleChange', e => {
            const activeTab = tabManager.getTab('active');
            const tab = e.detail.tab || activeTab;
            if (tab.isSameNode(activeTab)) {
                this.style.setProperty(e.detail.name, e.detail.value);
            }
        })
    }

    constructor(self) {
        self = super(self);
        self.on = on;
        self.trigger = trigger;
        return self;
    }
}
/**
 * Register the element type to the DOM
 */
const register = app => {
    StyleEditor.prototype.app = app;
    customElements.get('style-editor') || customElements['define']('style-editor', StyleEditor)
}

export default {
    register
}