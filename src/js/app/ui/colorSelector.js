import fn from 'fancy-node';
import events from '../../modules/events/events.js';

/**
 * Build a multi channel color slider, for instance hsl(), hsv(), rgb(), all with optional alpha channel
 * Expected format for either channel
 * {
 *    h: {
 *            key: --bg-hue (will be used as id and in `colorChange` event),  
 *            value: initial value, strings such as `42%` are acceptable,
 *            min: 0 (optional), 
 *            max: 255 (optional),  
 *            label: 'Hue' (optional, defaults to 'H') 
 *       },
 *    s: ...
 * }
 * 
 * On `input` every channel dispatches a `colorChange` event with 
 * {String} `prop` (== x.key)
 * {Number|String} `value`(x% on `s`,`l`,`v`)
 * Event data can be accessed through `e.detail.prop|value`
 * 
 * `attributes`, `data`, `classNames` correspond to their counterparts in `fancy-node`.
 * They are optional and only used for the `input` element, not for the label!
 *  
 * 
 * @param {Object} { h, s, l, v, r, g, b, a } 
 * @param {Object} { attributes, data, classNames } 
 * @returns 
 */
const colorSelector = ({
    h,
    s,
    l,
    v,
    r,
    g,
    b,
    a
} = {}, {
    attributes = {},
    data = {},
    classNames = ['control', 'color-slider']
} = {}) => {
    const defaultAttributes = {
        h: {
            max: 359
        },
        s: {
            max: 100
        },
        l: {
            max: 100
        },
        v: {
            max: 100
        },
        r: {
            max: 255
        },
        g: {
            max: 255
        },
        b: {
            max: 255
        },
        a: {
            max: 100
        },
    }
    const sliders = [];

    for (let [channel, config] of Object.entries({
            h,
            s,
            l,
            v,
            r,
            g,
            b,
            a
        })) {
        if (typeof config === 'undefined') {
            continue;
        }
        if (typeof config.value === 'undefined' || typeof config.key === 'undefined') {
            console.error(`Missing 'key' or 'value' for '${channel}'`);
            continue;
        }
        sliders.push(
            fn.label({
                classNames: ['slider-label'],
                content: [fn.span({
                    content: (config.label || channel.toUpperCase())
                }), fn.input({
                    classNames: classNames,
                    attributes: {
                        ...defaultAttributes[channel],
                        ...{
                            type: 'range',
                            min: 0,
                            value: parseFloat(config.value, 10)
                        },
                        ...attributes
                    },
                    data: {
                        ...{
                            prop: config.key,
                            type: channel
                        },
                        ...data
                    },
                    events: {
                        input: e => {
                            events.trigger(`cardStyleChange`, {
                                prop: e.target.dataset.prop,
                                value: ['s','l','v'].includes(e.target.dataset.type) ? e.target.value + '%' : e.target.value
                            });
                        }
                    }
                })]
            })
        )
    }
    return fn.toNode(sliders);
}

export default colorSelector;