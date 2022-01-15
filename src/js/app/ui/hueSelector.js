import fn from 'fancy-node';
import {
    camel,
    dash
} from '../../modules/string/string.js';
import events from './events.js';


const gradient = (saturation, lightness, direction, numSteps = 12) => {
    const increment = 360 / numSteps;
    const steps = [];

    for (let hue = 0; hue < 360; hue += increment) {
        steps.push(`hsl(${hue}, ${saturation}, ${lightness})`);
    }
    return `linear-gradient(${direction}, ${steps.join(',')}`
}


const hueSelector = (styleProp, hsl, {
    attributes = {},
    classNames = []
} = {}) => {

    attributes = {
        ...{
            id: dash(styleProp),
            type: 'range',
            min: 0,
            max: 359,
            value: hsl.h
        },
        ...attributes
    }

    return fn.input({
        classNames,
        attributes,
        data: {
            prop: styleProp
        },
        style: {
            background: gradient(hsl.s, hsl.l, 'to right', 12)
        },
        events: {
            input: e => {
                events.trigger(`cardStyleChange`, {
                    prop: styleProp,
                    value: e.target.value
                });
            }
        }
    })
}


export default hueSelector;