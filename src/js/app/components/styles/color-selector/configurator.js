import format from './format.js';

/**
 * Convert a hex value to an RGB array
 *
 * @param {String} value
 * @returns {Array}
 */
const hexToArray = value => {
    const rgb = (value.length < 6 ? value.split('') : value.match(/\w{1,2}/g))
        .map(e => e.length === 1 ? e.padEnd(2, e) : e)
        .map(e => parseInt(e, 16).toString());
    // alpha channel = 0 to 1
    if (rgb.length === 4) {
        rgb[3] = (rgb[3] / 255).toString();
    }
    return rgb;
}

/**
 * The unit for a channel
 *
 * @param {String} channel
 * @param {String} type
 * @returns {String}
 */
const getUnit = (channel, type) => {
    switch (channel) {
        case 'b':
            return type === 'hwb' ? '%' : '';
        case 'l':
        case 's':
        case 'w':
            return '%';
    }
    return '';
}

/**
 * A normalized numeric representation of the channel value
 *
 * @param {String} value
 * @param {String} channel
 * @param {String} type
 * @returns {Number}
 */
const getValue = (value, channel, type) => {
    let numPart = parseFloat(value);
    let match = value.match(/[a-z%]+/);
    let textPart = match ? match[0] : '';
    switch (channel) {
        case 's':
        case 'l':
        case 'w':
        case 'c':
        case 'a':
            return numPart;
        case 'r':
        case 'g':
            return textPart === '%' ? numPart * 255 / 100 : numPart;
        case 'α':
            if (textPart === '%') {
                return numPart / 100
            }
            return numPart;
        case 'h':
            switch (textPart) {
                case 'grad':
                    return numPart * 360 / 400;
                case 'turn':
                    return numPart * 360;
                case 'rad':
                    return numPart * (180 / Math.PI);
                default:
                    return numPart;
            }
            case 'b':
                switch (type) {
                    case 'rgb':
                        return textPart === '%' ? numPart * 255 / 100 : numPart;
                    case 'hwb':
                    case 'lab':
                        return numPart;
                }
    }
    return 100;
}

/**
 * The `max` parameter for a channel
 *
 * @param {String} channel
 * @param {String} type
 * @returns {Number}
 */
const getMax = (channel, type) => {
    switch (channel) {
        case 'c':
            return 230;
        case 'h':
            return 360;
        case 'r':
        case 'g':
            return 255;
        case 'b':
            if (type === 'lab') {
                return 160;
            }
            if (type === 'rgb') {
                return 255;
            }
            return 100;
        case 'a':
            return 160;
        case 'α':
            return 1;
    }
    return 100;
}

/**
 * The `min` parameter for a channel
 *
 * @param {String} channel
 * @param {String} type
 * @returns {Number}
 */
const getMin = (channel, type) => {
    if (type === 'lab' && ['a', 'b'].includes(channel)) {
        return -160;
    }
    return 0;
}

/**
 * All parameters for a channel combined
 *
 * @param {String} value
 * @param {String} channel
 * @param {String} type
 * @returns {{min: Number, max: Number, value: Number}}
 */
const buildTrack = (value, channel, type) => {
    const track = {
        value: getValue(value, channel, type),
        unit: getUnit(channel, type),
        min: getMin(channel, type),
        max: getMax(channel, type)
    }
    track.step = (track.max - track.min) / 100;
    return track;
}

/**
 * Build a normalized configuration object from any CSS color function
 * 
 * @param value
 * @returns {boolean|{tracks: Object, type: String}}
 */
const buildConfig = value => {
    let config = {
        tracks: {}
    };
    let valueArr;
    let regEx = /^(?<type>hex|#|rgba|hsla|rgb|hsl|hwb|lab|lch)?\(?(?<value>[^\)]+)/g;
    let matches = regEx.exec(value.trim());
    if (!matches || !matches.groups) {
        console.error(`Invalid value "${value}"`);
        return false;
    }
    value = matches.groups.value;
    if (['hex', '#'].includes(matches.groups.type)) {
        config.type = 'rgb';
        valueArr = hexToArray(value);
    } else {
        config.type = matches.groups.type.substring(0, 3);
        valueArr = value.replace(/[,\/]+/g, ' ').split(/\s+/).map(v => v.trim());
    }
    const channels = config.type.split('').concat(['α']);
    valueArr.forEach((value, i) => {
        config.tracks[channels[i]] = buildTrack(value, channels[i], config.type);
    })
    config.original = format.tracksToColorStr(config.tracks, config.type);

    return config;
}

export default buildConfig;