# Ghastly Creatures
Printable RPG character cards

## Configuration
The system configuration files are `src/config/config-backend.json`, `src/config/config-frontend.json` and `src/config/config-shared.json`. These files are combined as required and mostly relate to data generation or data storage. `rollup.js` is used to configure the JavaScript Bundler.

## System data
_Ghastly Creatures_ are generated from various data sources found in `data` and `config`. The resulting files `presets.json` and `characters.json` need to be available via HTTP and thus live at `public/js`.

### Patterns
Pattern presest are built by scanning `public/media/patterns/*`. The names of these files matter since they are used to build the `title`-attributes. The background textures come from [Transparent Textures](https://www.transparenttextures.com/), the border textures are custom-made.

### Fonts
Font presets are built from `src/data/fonts.txt`. This list in return, is copied from [Google Fonts](https://tinyurl.com/ghastly-fonts).  

Modifying the font list requires the following steps:
- Open the configuration page at [Google Fonts](https://tinyurl.com/ghastly-fonts)
- Edit the collection
- Copy the list below _CSS rules to specify families_ to `src/data/fonts.txt`.
- Set _Use on the web_ to `<link>` and download the stylesheet from the URL that appears below.
- Before you overwrite `src/css/inc/fonts.css`, copy the settings for `size-adjust` for those fonts you wish to keep. You might need to find a good value for `size-adjust` for your new fonts. 
- Stylesheets from Google Fonts often contain multiple versions of the same font; the difference is in the value of `Unicode-range`. All versions rather than just the Latin flavor should be kept to serve an international audience.

Alternatively, or in addition, you can use locally stored fonts. The required files can be generated at [Font Squirrel](https://www.fontsquirrel.com), here are the [relevant instructions](https://www.fontsquirrel.com/blog/2010/12/how-to-use-the-generator). `src/config/font-squirrel-config.txt` is a configuration file that can help you to speed up the process. You will need to edit `src/css/inc/fonts.css` and `src/data/fonts.txt` manually in this case.

### Fields
_Field_ in this context refers to the different properties of a character such as _Challenge Rating_. These fields are configured in `src/data/fields.yml`. 

Most fields have reasonable defaults to keep the configuration as simple as possible, i.e. the below scenario is mostly redundant.

```yaml     
cr:                         # the key as it appears in 'src/data/raw/monsters.json'          
  labels:                   # various labels
    group: Challenge Rating # used for order/grouping inside the library, default: labels.long
    long: Challenge Rating  # full name of the field, only used for the label.group field, default: key from 'src/data/raw/monsters.json' 
    short: CR               # the common abbreviation, used on the card
  visibility:               # whether or not a field is visible in specific areas
    card: true              # display this element on the card, default: true
    label: true             # display a label for this element on the card, default: true
    group: true             # display this element on 'Group by', default: false
  key: cr                   # rename the key, default: key from 'src/data/raw/monsters.json', e.g. 'cr'; the goal is to use short keys that are valid JS variable names
```

### Overview

| Path                                 | Source                              | Editable |
|:-------------------------------------|:------------------------------------|:--------:|
| public/js/presets.json#backgrounds   | public/media/patterns/backgrounds/* | ✗        | 
| public/js/presets.json#borders       | public/media/patterns/borders/*     | ✗        | 
| public/js/presets.json#css           | src/css/inc/card-defs.css           | ✗        | 
| public/js/presets.json#fonts         | src/data/fonts.txt                  | ✗        | 
| public/js/presets.json#cards.*.label | src/data/fields.yml                 | ✗        | 
| public/js/characters.json            | src/data/raw/monsters.json          | ✗        |
| src/data/fonts.txt                   | https://tinyurl.com/ghastly-fonts   | ✓        | 
| src/data/monsters.json               | https://tinyurl.com/monster-index   | ✓        | 
| src/data/fields.yml                  | manually edited                     | ✓        |

### Compiling configurations to their final forms
Whenever you make changes to the underlying data, the files in the root folder need to be re-generated with one of the following commands:

| Command              | Purpose                             |
|:---------------------|:------------------------------------|
| `npm run data:once`  | Generates uncompressed config files |
| `npm run data:build` | Generates compressed config files   |
| `npm run build`      | Includes `npm run data:build`       |

## User data
All user data are stored in `localStorage` under keys which are defined in `src/config/config-frontend.json#storageKeys`:

| Key                 | Purpose             |
|:--------------------|:--------------------|
| `storageKeys.cards` | Card data           |
| `storageKeys.tabs`  | Tab data and styles |

## UI elements in general

### Fancy node in a nutshell
DOM elements anywhere in the code are accessed or created with [Fancy Node](https://www.npmjs.com/package/fancy-node). This isn't a JS framework but a simple set of wrappers around `document.createElement`, `document.querySelector` and `document.querySelectorAll`. All of the functions below return valid HTML or SVG elements:

| Fancy Node    | JS Equivalent                       |
|:--------------|:------------------------------------|
|`fn.$('.foo')` | `document.querySelector('.foo')`    |
|`fn.$$('.foo')`| `document.querySelectorAll('.foo')` |
|`fn.div()`     | `document.createElement('div')`     |

Check the [docs](https://www.npmjs.com/package/fancy-node) to understand the benefits of Fancy Node and for a comprehensive list of examples.

_Note: Fancy Node doesn't support Web Components, you will need to create them with `document.createElement('my-component')`._

### Web Components
Most of the UI elements are built as Web Components. Usually, all related files or variables share variations of the same name; let's take `src/js/app/components/character-cards/CardRecto.js` as an example:

| Part         | Name             |
|:-------------|:-----------------|
| JS file      | CardRecto.js     |
| JS class     | `CardRecto`      |
| HTML element | `<card-recto>`   |
| CSS file     | card-recto.css   |

More complex scenarios, such as cards or tabs, where multiple components act alongside, are usually controlled or supported by a `*-manager.js` module. Storage is handled handled by `src/js/app/storage/storage.js`. 

Notably, the components don't use the `Shadow DOM`. They act within a clearly defined scope where `<style>` or `<script>` encapsulations don't matter. 

## Character library
The library lists all characters and is built from `public/js/characters.json`. It can be grouped by using the order symbol above the library. Whether or not grouping by a specific criterion is possible depends on `src/data/fields.yml#<field>.visibility.group`.

It would be easy to add user-created characters to the library, but it would require an investigation of the possible implications.

## Workbench

The workbench is organized into tabs; all cards live inside these tabs. Launching the app will restore all tabs and cards to their last state.

### Tabs 

Tabs have a context menu that can be accessed by right-clicking. There will always be at least one tab open, even after closing all. Closing a tab will also destroy all its cards. Some tasks can be undone within a 10-second window. By default, tabs are named with Roman numerals, but they can be renamed.

| Task             | Access                                 | Undo | Note                             |
|:-----------------|:---------------------------------------|:----:|:---------------------------------|
| Add tab          | + icon / double-click on the tab bar   | n/a  |                                  |
| Rename tab       | context menu / double-click on the tab | n/a  |                                  |
| Close tab        | × icon / context menu                  | ✓    | destroys all cards on this tab   |
| Close empty tabs | context menu                           | ✗    | invalids pending _undo_ timeouts |
| Close other tabs | context menu                           | ✗    | invalids pending _undo_ timeouts |
| Close all tabs   | context menu                           | ✗    | invalids pending _undo_ timeouts |
| Paste card       | context menu                           | ✗    |                                  |
| Copy style       | context menu                           | n/a  |                                  |
| Paste style      | context menu                           | ✗    |                                  |
| Reset style      | context menu                           | ✗    |                                  |

### Cards

Cards have a toolbar that appears when hovering over the card. This implies that the application in its current form can't be used with touch screens only. The toolbar has five buttons of which initially only four are visible:

| Button | Task                                                            | Undo |
|:-------|:----------------------------------------------------------------|:----:|
| Delete | removes a card from the canvas                                  | ✓    | 
| Cut    | takes a reference to the card, removes original after pasting   | n/a  |
| Copy   | takes a reference to the card, keeps original after pasting     | n/a  |
| Edit   | opens the card editor                                           | n/a  |
| Done   | closes the card editor, only visible in editor                  | n/a  |  


## Style editor
All styles are per-tab and can be copied from one tab to another. They are stored in `localStorage[storageKeys.tabs]` as part of the tab configuration.

| Feature / Section  | Card | Badge | Frame | Data source                        |
|:-------------------|:----:|:-----:|:-----:|:-----------------------------------|
| Font selection     | ✓    | ✓    | ✗     | public/js/presets.json#fonts       |
| Font size          | ✓    | ✓    | ✗     | public/js/presets.json#css         |
| Color picker       | ✓    | ✓    | ✓     | public/js/presets.json#css         |
| Background pattern | ✓    | ✗    | ✗     | public/js/presets.json#backgrounds |
| Border pattern     | ✗    | ✗    | ✓     | public/js/presets.json#borders     |
