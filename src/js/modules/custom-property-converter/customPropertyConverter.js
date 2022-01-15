import beautify from 'beautify';

const isPlainObj = value => !!value && Object.getPrototypeOf(value) === Object.prototype;
const isEmptyObj = value => isPlainObj(value) && !Object.keys(value).length;

/**
 * Convert a 1-level CSS string to a JS object
 *
 * @param {String} css, expects a non-nested CSS string (no `&` or `@` rules)
 * @param {Object} rules, default {} - this allows for multiple calls with several style sheets
 * @returns {Object} CSS
 */
export const customPropsToObject = (css, rules = {}) => {

    let key;
    // normalize CSS
    beautify(css, {
            format: 'css'
        })
        // remove `/* */` comments
        .replace(/\/\*.*?\*\//gs, '')
        .split('\n')
        // normalize lines
        .map(line => line.replace(';', '').trim())
        // remove empty lines, `//` comments and `}`
        .filter(line => line && !line.startsWith('//') && line !== '}')
        .forEach(line => {
            // selectors become keys
            if (line.endsWith('{')) {
                key = line.slice(0, -1).trim();
                if (!rules[key]) {
                    rules[key] = {};
                }
                return false;
            }
            // ignore lines that don't define custom properties
            if (!line.startsWith('--')) {
                return false;
            }
            let [prop, value] = line.split(':').map(line => line.trim());
            rules[key][prop] = value;
        })

    // remove empty rules
    for (let [selector, entries] of Object.entries(rules)) {
        // ignore empty rule sets        
        if (isEmptyObj(entries)) {
            delete rules[selector];
            continue;
        }
        for (let [prop, value] of Object.entries(entries)) {
            if (isEmptyObj(entries)) {
                delete rules[selector][prop];
                continue;
            }
        }
    }

    return rules;

}

/**
 * Convert a 1-level JS object to CSS
 *
 * @param {Object} rules
 * @returns {String} CSS
 */
export const objectToCustomProps = rules => {
    let css = '';
    for (let [selector, entries] of Object.entries(rules)) {
        // ignore empty rule sets
        if (isEmptyObj(entries)) {
            continue;
        }
        css += `${selector}{`;
        for (let [prop, value] of Object.entries(entries)) {
            // ignore nested entries
            if (!prop.startsWith('--') || typeof value !== 'string') {
                continue;
            }
            css += `${prop}: ${value};`
        }
        css += `}`;
    }
    return beautify(css, {
        format: 'css'
    });
}