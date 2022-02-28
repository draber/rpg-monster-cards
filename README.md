# Ghastly Beasts
Printable RPG character cards

## Configuration
The main system configuration file isr `src/config/config.json`. Most items here relate to data generation. `js` is used to configure the JavaScript Bundler, `storageKeys` define the keys used in `localStorage`. `userCharacters.inLibrary` is meant to be used by the character library; this is for now experimental and not in use.

## System data
_Ghastly Creatures_ uses various data sources; all files but one are in the root of `src/data/` are generated, the files in `src/config` serve as sources. The actual character list needs to be available via HTTP and thus lives at `public/js/characters.json`.

### Patterns
`src/data/backgrounds.json` and `src/data/borders.json` are built by scanning `public/media/patterns/*`. The names of these files matter since they are used to build the `title`-attributes. The background textures come from [Transparent Textures](https://www.transparenttextures.com/), the border textures are custom-made.

### Fonts
`src/data/fonts.json` is built from `src/config/fonts.txt`. This list in return, is copied from [Google Fonts](https://tinyurl.com/ghastly-fonts).  

Modifying the font list requires the following steps:
- Open [your configuration page at Google Fonts](https://tinyurl.com/ghastly-fonts)
- Edit the collection
- Copy the list below _CSS rules to specify families_ to `src/config/fonts.txt`.
- Set _Use on the web_ to `<link>` and download the stylesheet from the URL that appears below.
- Before you overwrite `src/css/inc/fonts.css`, copy the settings for `size-adjust` for those fonts you wish to keep. You might need to find a good value for `size-adjust` for your new fonts. 
- Stylesheets from Google Fonts often contain multiple versions of the same font; the difference is in the value of `Unicode-range`. Regarding an international audience, all versions should be kept rather than just the Latin flavor.

Alternatively, or in addition, you can use locally stored fonts. The required files can be generated at [Font Squirrel](https://www.fontsquirrel.com). Follow [their instructions](https://www.fontsquirrel.com/blog/2010/12/how-to-use-the-generator); `src/config/font-squirrel-config.txt` is a configuration file that can help you to speed up the process. You will need to edit `src/css/inc/fonts.css` and `src/config/fonts.txt` manually in this case.

### Fields
_Field_ in this context refers to the different properties of a character such as _Challenge Rating_. These fields are configured in `src/config/field-config.yml`. 

Most fields have decent defaults to keep the configuration as simple as possible, i.e. the below scenario is mostly redundant.

```yaml     
cr:                         # the key as it appears in 'src/config/monsters.json'          
  labels:                   # various labels that used in a variety of places
    group: Challenge Rating # relevant for order/grouping inside the library, default: labels.long
    long: Challenge Rating  # full name of the field, only used for the label.group field, default: key from 'src/config/monsters.json' 
    short: CR               # the common abbreviation, used on the card
  visibility:               # whether or not a field is visible in specific areas
    card: true              # display this element on the card, default: true
    label: true             # display a label for this element on the card, default: true
    group: true             # display this element on 'Group by', default: false
  key: cr                   # the key for this element, default: key from 'src/config/monsters.json', e.g. 'cr'
```

### Overview

| Path                          | Source                              | Editable |
|:------------------------------|:------------------------------------|:--------:|
| src/data/backgrounds.json     | public/media/patterns/backgrounds/* | ✗        | 
| src/data/borders.json         | public/media/patterns/borders/*     | ✗        | 
| src/data/css-props.json       | src/css/inc/card-defs.css           | ✗        | 
| src/data/fonts.json           | src/config/fonts.txt                | ✗        | 
| src/data/labels.json          | src/config/field-config.yml         | ✗        | 
| src/data/visibility.json      | src/config/field-config.yml         | ✗        |
| public/js/characters.json     | src/config/monsters.json            | ✗        |
| src/config/fonts.txt          | https://tinyurl.com/ghastly-fonts   | ✓        | 
| src/config/monsters.json      | https://tinyurl.com/monster-index   | ✓        | 
| src/config/field-config.yml   | manually edited                     | ✓        |

### Compiling configurations to their final forms
Whenever you make changes to the underlying data, the files in the root folder need to be re-generated with one of the following commands:

| Command              | Purpose                             |
|:---------------------|:------------------------------------|
| `npm run data:once`  | Generates uncompressed config files |
| `npm run data:build` | Generates compressed config files   |
| `npm run build`      | Includes `npm run data:build`       |

## User data
User data are stored in `localStorage` under keys which are defined in `src/config/config.json#storageKeys`.

- `storageKeys.cards`: All cards and their modifications made along the way
- `storageKeys.tabs`:  All tabs along with their styles
- `storageKeys.user`:  Everything that doesn't fit the other two, such as the preferred order of characters in the library

## UI elements in general

### Fancy node in a nutshell
DOM elements anywhere in the code are accessed or created with [fancy-node](https://www.npmjs.com/package/fancy-node). This isn't a JS framework but a set of simple wrappers around `document.createElement`, `document.querySelector` and `document.querySelectorAll`:

- `fn.$('.foo')` is identical to `document.querySelector('.foo')`
- `fn.$$('.foo')` is identical to `document.querySelectorAll('.foo')`
- `fn.div()` is identical to `document.createElement('div')`

Check the [docs](https://www.npmjs.com/package/fancy-node) for a comprehensive list of examples.

_Note: Fancy Node doesn't support Web Components!_

### Web Components
Most of the UI elements are built as Web Components. Usually, all related files or variables share variations of the same name; let's take `src/js/app/components/character-cards/CardRecto.js` as an example:
- JS class:    `CardRecto`
- HTML element `<card-recto>`
- CSS file     `card-recto.css`

More complex scenarios, such as cards or tabs, where multiple components act alongside, are often controlled or supported by a `*manager.js` module. Notably, these components don't use the `Shadow DOM`. They act within a clearly defined scope where `<style>` or `<script>` encapsulations don't matter. 

## Character library
The library lists all characters and is built from `public/js/characters.json`. It can be ordered, or more correctly, grouped by using the order symbol above. Whether or not grouping by a specific criterion is possible depends on `src/config/field-config.yml#<field>.visibility.group`.

It would be easy to add user-created characters to the library, but it would require an investigation of the possible implications.

## Workbench

The workbench is organized in tabs. 

- _Add a new tab:_ click on the + icon or by double-click on the tab bar
- _Rename a tab:_ double-click on the tab or via context menu
- _Close a tab:_ click on the × icon or via context menu. Closing a tab also _destroys all cards_ on this tab. There is a 10-second timeout to undo closing a tab.
- _Close empty tabs:_ via the context menu, closes all empty tabs _and_ invalids all timeouts
- _Close other tabs:_ via the context menu, closes all tabs but the one that has issued the command. It also invalids all timeouts
- _Close all tabs:_ via the context menu, also invalids all timeouts

_Note that a new tab is created whenever all tabs are closed._

## Style editor
All styles are per-tab and can be copied form one tab to another. They are stored in `localStorage` as part of the tab configuration.

The editor has three sections, namely
- **Card:** Styles that apply to the cards directly
- **Badge:** Title and challenge rating
- **Frame:** Everything related to the card border

Four different widget types are used where applicable. Their default values are taken from `src/data/css-props.json`, i.e. based on the card stylesheet. 

The font families correspond to `src/data/fonts.json`, the patterns to `src/data/backgrounds.json` and `src/data/borders.json`.
