import Tree from './Tree.js';

class PresetTree extends Tree {

    isDefault(key, value){
        return value === this.get(key)
    }

    set(){
        console.error('Preset values are readonly');
        return false;
    }

    unset() {
        return this.set()
    }

    constructor({
        data = {}
    } = {}) {
        super({
            data
        });
    }
}

export default PresetTree;