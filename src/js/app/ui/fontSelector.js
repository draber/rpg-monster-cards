import fn from 'fancy-node';
import {
    dash
} from '../../modules/string/string.js';
import events from './events.js';

const fontSelector = (fonts, styleProp, selected, {
    attributes = {},
    classNames = []
} = {}) => {

    attributes = {
        ...{
            id: dash(styleProp)
        },
        ...attributes
    }

    return fn.select({
        attributes,
        classNames,
        style: {
            fontFamily: `var(${styleProp})`
        },
        content: fonts.map(entry => {
            return fn.option({
                attributes: {
                    value: entry.family,
                    selected: entry.family === selected
                },
                style: {
                    fontFamily: entry.family
                },
                content: entry.label
            })
        }),
        data: {
            prop: styleProp
        },
        events: {
            change: e => {
                events.trigger(`cardStyleChange`, {
                    prop: styleProp,
                    value: e.target.value
                });
            }
        }
    })
}

export default fontSelector;