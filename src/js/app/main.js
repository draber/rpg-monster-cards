import registry from './components/registry.js';
import cardManager from './components/character-cards/card-manager.js';
import characterMap from './components/character-library/character-map.js';
import tabManager from './components/tabs/tabManager.js';
import {
    on,
    trigger
} from '../modules/events/eventHandler.js';


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

    }
    constructor(self) {
        self = super(self);
        self.on = on;
        self.trigger = trigger;
        self.styleStorage = false;
        return self;
    }
}

customElements.define('app-container', App, {
    extends: 'main'
});