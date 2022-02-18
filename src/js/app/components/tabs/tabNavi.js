import fn from 'fancy-node';
import tabManager from './tabManager.js';
import {on, trigger}from '../../../modules/events/eventHandler.js';

/**
 * Custom element containing the list of fonts
 */
class TabNavi extends HTMLElement {

    /**
     * Called on element launch
     */
    connectedCallback() {

        const contextMenu = fn.ul({
            classNames: ['tab-context-menu'],
            content: [
                fn.li({
                    content: 'Delete tab',
                    events: {
                        pointerup: e => {
                            if (e.button !== 0) {
                                return true;
                            }
                           // tabManager.handleRemoval(this, 'soft');
                           // this.classList.remove('context');
                        }
                    }
                }),
                fn.li({
                    classNames: ['context-danger'],
                    content: 'Delete others (irreversible)',
                    events: {
                        pointerup: e => {
                            if (e.button !== 0) {
                                return true;
                            }
                           // tabManager.handleRemoval(this, 'others');
                           // this.classList.remove('context');
                        }
                    }
                }),
                fn.li({
                    classNames: ['context-danger'],
                    content: 'Delete all (irreversible)',
                    events: {
                        pointerup: e => {
                            if (e.button !== 0) {
                                return true;
                            }
                           // tabManager.handleRemoval(this, 'destroy');
                           // this.classList.remove('context');
                        }
                    }
                })
            ]
        })

        const adder = fn.span({
            content: '🞤',
            classNames: ['adder', 'btn', 'tab'],
            events: {
                pointerup: e => {
                    if (e.button !== 0) {
                        return true;
                    }
                    const tab = tabManager.createTab();
                    tabManager.setActiveTab(tab)
                }
            }
        })

        this.append(adder);

        document.body.append(contextMenu);

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
const register = () => {
    customElements.get('tab-navi') || customElements['define']('tab-navi', TabNavi)
}

export default {
    register
}