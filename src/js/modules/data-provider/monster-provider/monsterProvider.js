import fs from 'fs-extra';

const getMonsters = sourceFile => {
    return fs.readJsonSync(sourceFile);
}

export default getMonsters;
