import registry from './components/registry.js';
import events from '../modules/events/events.js';
import props from '../modules/properties/properties.js';
import cardManager from './components/character-cards/card-manager.js';
import characterMap from './components/character-library/character-map.js';
import fn from 'fancy-node';

characterMap.init()
    .then(() => {
        registry.register();
        cardManager.init();
    })


events.on('styleChange', e => {
    [fn.$('#editor'), fn.$('#style-editor')].forEach(panel => {
        props.set(e.detail.name, e.detail.value, panel);
    })
})