import Tree from './Tree.js';

class SystemPropTree extends Tree {

    isDefault(key, value){
        return this.has(key) && value === this.get(key)
    }

    set(){
        console.error('System properties are readonly');
        return false;
    }

    unset() {
        return this.set()
    }

    constructor({
        data = {},
        lsKey
    } = {}) {
        super({
            data,
            lsKey
        });
    }
}

export default SystemPropTree;