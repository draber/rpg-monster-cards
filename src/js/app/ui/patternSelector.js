import fn from 'fancy-node';
import {
    camel,
    dash
} from '../../modules/string/string.js';
import events from './events.js';

const url = (img, area) => {
    
// http://127.0.0.1:5500/public/css/media/patterns/background/dark-natural-paper.png
//                       public\media\patterns\background\dark-natural-paper.png   
    return `url(/public/media/patterns/${area}/${img})`
}

const patternSelector = (patterns, styleProp, area, selected, {
    attributes = {},
    classNames = []
} = {}) => {

    attributes = {
        ...{
            id: dash(styleProp)
        },
        ...attributes
    }

    return fn.ul({
        attributes,
        classNames,
        content: patterns.map(entry => {
            return fn.li({
                style: {
                    backgroundImage: url(entry.name, area)
                },
                content: [
                    fn.input({
                        attributes: {
                            type: 'radio',
                            name: `${area}-pattern`,
                            value: url(entry.name, area),
                            id: `${area}-${entry.id}`,
                            checked: entry.name === selected
                        }
                    }),
                    fn.label({
                        attributes: {
                            for: `${area}-${entry.id}`
                        }
                    })
                ]
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

export default patternSelector;
   