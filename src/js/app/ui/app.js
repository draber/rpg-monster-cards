import fn from 'fancy-node';
// import colorSelector from './colorSelector.js';
// import cards from './cards.js';
import cssProps from '../../../data/css-props.json';
import userPrefs from '../../modules/user-prefs/userPrefs.js';
import props from '../../modules/properties/properties.js';
import events from '../../modules/events/events.js';

import registry from '../components/registry.js';

registry.register();

events.on('characterSelection', e => {
    console.log(e.detail)
})

events.on('styleChange', e => {
    [fn.$('#editor'), fn.$('#skin-editor')].forEach(panel => {
        props.set(e.detail.name, e.detail.value, panel);
    })
})

const getCurrentValue = key => {
    let value = userPrefs.get(key) || cssProps[':root'][key];
    if (value && value.startsWith('url(')) {
        value = value.split('/').pop().slice(0, -1)
    }
    return value;
}

const getColorConfig = prefix => {
    const config = {};
    ['h', 's', 'l'].forEach(channel => {
        let key = prefix + '-' + channel;
        config[channel] = {
            key,
            value: getCurrentValue(key)
        }
    })
    return config;
}


const areas = {
    cardListing: fn.$('#card-listing'),
    badgeColorSelector: fn.$('#badge-color-selector'),
    cardBgColorSelector: fn.$('#card-bg-color-selector'),
    cardBorderHueSelector: fn.$('#card-border-color-selector'),
    smoke: fn.$('#smoke')
}



function init() {

    // cards.init({
    //     area: areas.cardListing,
    //     smoke: areas.smoke,
    //     characterLibrary: areas.characterLibrary
    // })

    // areas.cardBgColorSelector.append(
    //     colorSelector(getColorConfig('--c-bg'))
    // );

    // areas.cardBorderHueSelector.append(
    //     colorSelector(getColorConfig('--c-border'))
    // );

    // areas.badgeColorSelector.append(
    //     colorSelector(getColorConfig('--c-badge'))
    // );
}

export default {
    init
};