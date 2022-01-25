// note: postcss.config.js doesn't support ES6 syntax, bootstrap.js won't work here
const minimist = require('minimist');
const args = minimist(process.argv.slice(2));

const plugins = [
    require('postcss-import'),
    require('postcss-preset-env')({
        stage: 1,
        features: {
            'focus-visible-pseudo-class': false,
            'focus-within-pseudo-class': false
        }
    }),
    require('postcss-discard-comments')
]

if (args['config-env']) {
    plugins.push(require('cssnano'));
}

module.exports = {
    parser: 'postcss-scss',
    plugins
}