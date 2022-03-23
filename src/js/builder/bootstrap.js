import minimist from 'minimist';
import beConfig from '../../config/config-backend.json';
import sharedConfig from '../../config/config-shared.json';

const args = minimist(process.argv.slice(2));

const config = {
    ...beConfig,
    ...sharedConfig
}

export {
    config
};

// 'config-env' => compat with rollup
export const env = args.env || args['config-env'] || 'dev';

export const jsonOptions = env === 'dev' ? {
    spaces: '\t'
} : {};