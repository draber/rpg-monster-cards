# Data

Data in this directory are used by various files in the code.

## Contents

Data in the root folder are generated, data inside `raw` are source data.

| Path                 | Target or Source                  | Editable |
|:---------------------|:----------------------------------|:--------:|
| backgrounds.json     | public/media/patterns/backgrounds | ✗        | 
| borders.json         | public/media/patterns/borders     | ✗        | 
| css-props.json       | src/css/inc/card-defs.css         | ✗        | 
| fonts.json           | raw/fonts.txt                     | ✗        | 
| labels.json          | raw/field-config.yml              | ✗        | 
| visibility.json      | raw/field-config.yml              | ✗        | 
| raw/fonts.txt        | fonts.json                        | ✓        | 
| raw/monsters.json    | public/js/characters.json         | ✓        | 
| raw/field-config.yml | public/js/characters.json         | ✓        |

## NPM commands

| Command              | Purpose                             |
|:---------------------|:------------------------------------|
| `npm run data:once`  | Generates uncompressed config files |
| `npm run data:build` | Generates compressed config files   |
| `npm run build`      | Includes `npm run data:build`       |
