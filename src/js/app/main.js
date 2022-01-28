import registry from './components/registry.js';
import events from '../modules/events/events.js';
import props from '../modules/properties/properties.js';
import cardManager from './components/character-cards/cardManager.js';
import fn from 'fancy-node';

registry.register();
cardManager.init();

events.on('styleChange', e => {
    [fn.$('#editor'), fn.$('#style-editor')].forEach(panel => {
        props.set(e.detail.name, e.detail.value, panel);
    })
})
