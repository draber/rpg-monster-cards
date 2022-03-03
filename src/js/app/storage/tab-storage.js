import TabTree from './TabTree.js';
import settings from '../../modules/settings/settings.js';

export default new TabTree(settings.get('storageKeys.tabs'));