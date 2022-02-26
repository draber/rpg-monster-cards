import fn from 'fancy-node';
import tabManager from './tab-manager.js';
import {
    on,
    trigger
} from '../../../modules/events/eventHandler.js';

/**
 * Custom element containing the list of fonts
 */
class TabNavi extends HTMLElement {

    /**
     * Called on element launch
     */
    connectedCallback() {



        const adder = fn.span({
            content: '🞤',
            classNames: ['adder', 'btn', 'tab'],
            events: {
                pointerup: e => {
                    if (e.button !== 0) {
                        return true;
                    }
                    tabManager.createTab({
                        activate: true
                    })
                }
            }
        })

        this.addEventListener('dblclick', e => {
            if (e.target.isSameNode(this)) {
                tabManager.createTab({
                    activate: true
                })
            }
        })

        this.append(adder);

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
    TabNavi.prototype.app = app;
    customElements.get('tab-navi') || customElements['define']('tab-navi', TabNavi)
}

export default {
    register
}