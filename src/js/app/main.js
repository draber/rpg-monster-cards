import registry from './components/registry.js';
import props from '../modules/properties/properties.js';
import cardManager from './components/character-cards/card-manager.js';
import characterMap from './components/character-library/character-map.js';
import tabManager from './components/tabs/tabManager.js';
import {
    on,
    trigger
} from '../modules/events/eventHandler.js';
import fn from 'fancy-node';


class App extends HTMLElement {

    connectedCallback() {
        // load characters
        characterMap.init()
            .then(() => {

                // register custom elements
                registry.register(this);

                // tabs must be created before any card can be added
                tabManager.init(this);
                cardManager.init(this);
            })

        // event listeners on this element
        this.on('styleChange', e => {
            [this.editor, this.styleEditor].forEach(panel => {
                props.set(e.detail.name, e.detail.value, panel);
            })
        })

    }
    constructor(self) {
        self = super(self);
        self.on = on;
        self.trigger = trigger;
        self.editor = fn.$('#editor');
        self.styleEditor = fn.$('#style-editor');
        return self;
    }
}

customElements.define('app-container', App, {
    extends: 'main'
});