import registry from './components/registry.js';
import events from '../modules/events/events.js';
import props from '../modules/properties/properties.js';
import cardManager from './components/character-cards/card-manager.js';
import characterMap from './components/character-library/character-map.js';
import tabManager from './components/tabs/tabManager.js';
import {
    on,
    trigger
} from '../modules/events/eventHandler.js';
import fn from 'fancy-node';

class AppContainer extends HTMLElement {

    connectedCallback() {
        characterMap.init()
            .then(() => {
                registry.register();

                // tabs must be created before any card can be added
                tabManager.init(this);
                cardManager.init(this);
            })


        events.on('styleChange', e => {
            [editor, fn.$('#style-editor')].forEach(panel => {
                props.set(e.detail.name, e.detail.value, panel);
            })
        })

    }
    constructor(self) {
        self = super(self);
        self.on = on;
        self.trigger = trigger;
        return self;
    }
}

customElements.define('app-container', AppContainer, {
    extends: 'main'
});