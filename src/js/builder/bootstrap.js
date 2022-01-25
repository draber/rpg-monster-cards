import minimist from 'minimist';
import config from '../../config/config.json';

const args = minimist(process.argv.slice(2));

export { config };

// 'config-env' => compat with rollup
export const env = args.env || args['config-env'] || 'dev';

export const jsonOptions = env === 'dev' ? {
    spaces: '\t'
} : {};

