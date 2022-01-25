import fs from 'fs-extra';

const getCharacters = sourceFile => {
    return fs.readJsonSync(sourceFile);
}

export default getCharacters;
