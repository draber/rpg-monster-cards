import fn from 'fancy-node';
import buildMonsterList from './monsterList.js';
import fontSelector from './fontSelector.js';
import patternSelector from './patternSelector.js';
import hueSelector from './hueSelector.js';
import cards from './cards.js';
import data from '../../../data/data.json';
import userPrefs from './userPrefs.js';
import props from './props.js';
import events from './events.js';

const getCurrentValue = key => {
    let value = userPrefs.get(key) || data.customProperties[':root'][key];
    if (value && value.startsWith('url(')) {
        value = value.split('/').pop().slice(0, -1)
    }
    return value;
}

const getHsl = h => {
    const prefix = h.slice(0, -2);
    return {
        h: getCurrentValue(h),
        s: getCurrentValue(prefix + '-s'),
        l: getCurrentValue(prefix + '-l'),
    }
}

const areas = {
    monsterListing: fn.$('#monster-listing'),
    cardListing: fn.$('#card-listing'),

    badgeFontSelector: fn.$('#badge-font-selector'),

    cardBgHueSelector: fn.$('#card-bg-hue-selector'),
    cardBgPatternSelector: fn.$('#card-bg-pattern-selector'),

    cardBorderHueSelector: fn.$('#card-border-hue-selector'),
    cardBorderPatternSelector: fn.$('#card-border-pattern-selector'),

    smoke: fn.$('#smoke')
}


areas.monsterListing.addEventListener('pointerdown', e => {
    const btn = e.target.closest('button');
    if (!btn) {
        return false;
    }
    cards.create(parseInt(btn.dataset.id));
})


function init() {

    cards.init({
        monsters: data.monsters,
        area: areas.cardListing,
        smoke: areas.smoke
    })

    events.on('cardStyleChange', data => {
        props.set(data.detail.prop, data.detail.value);
    })

    areas.monsterListing.append(buildMonsterList(data.monsters));

    const badgeFontKey = '--c-badge-font';
    areas.badgeFontSelector.append(
        fontSelector(
            data.fonts,
            badgeFontKey,
            getCurrentValue(badgeFontKey), {
                classNames: ['control']
            }
        )
    );

    const cardBgPatternKey = '--c-bg-pattern';
    areas.cardBgPatternSelector.append(
        patternSelector(
            data.patterns.backgrounds,
            cardBgPatternKey,
            'background',
            getCurrentValue(cardBgPatternKey), {
                classNames: ['control', 'pattern-selection']
            }
        )
    );

    const cardBorderPatternKey = '--c-border-pattern';
    areas.cardBorderPatternSelector.append(
        patternSelector(
            data.patterns.borders,
            cardBorderPatternKey,
            'border',
            getCurrentValue(cardBorderPatternKey), {
                classNames: ['control', 'pattern-selection']
            }
        )
    );

    const cardBgHueKey = '--c-bg-h';
    areas.cardBgHueSelector.append(
        hueSelector(
            cardBgHueKey,
            getHsl(cardBgHueKey), {
                classNames: ['control', 'color-slider']
            }
        )
    );

    const cardBorderHueKey = '--c-border-h';
    areas.cardBorderHueSelector.append(
        hueSelector(
            cardBorderHueKey,
            getHsl(cardBorderHueKey), {
                classNames: ['control', 'color-slider']
            }
        )
    );
}

export default {
    init
};