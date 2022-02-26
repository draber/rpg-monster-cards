# Ghastly Beasts
Printable RPG character cards

## Configuration
The system configuration lives under `src/config/config.json`. As you can see under System Data, the vast majority of items in here relates to data generation.

`js` is used to configure the JavaScript Bundler, `storageKeys` define the keys used in `localStorage`. `userCharacters.inLibrary` is meant to be used by the character library; this is for now experimenatl and not in use.

## System data
_Ghastly Creatures_ uses various data sources; all files but one are in the root of `src/data/` are generated, data inside `src/data/raw` serve as sources. The actual character list needs to be available via HTTP and thus lives at `public/js/characters.json`.

`src/data/backgrounds.json` and `src/data/borders.json` are built by scanning `public/media/patterns/*`. The names of these files matter, since they are use to build the `title`-attributes. The background textures come from [Transparent Textures](https://www.transparenttextures.com/), the border textures are custom-made.

`src/data/fonts.json` is built from `src/data/raw/fonts.txt`. This list in return is copied from [Google Fonts](https://tinyurl.com/ghastly-fonts).  

Modifying the font list requires the following steps:
- Open [your configuration page at Google Fonts](https://tinyurl.com/ghastly-fonts)
- Edit the collection
- Copy the list below _CSS rules to specify families_ to `src/data/raw/fonts.txt`.
- Set _Use on the web_ to `<link>` and download the stylesheet from the URL that appears below.
- Before you overwrite `src/css/inc/fonts.css` copy the settings for `size-adjust` for those fonts you wish to keep. You might need to find a good value for `size-adjust` for your new fonts. 
- Stylesheets from Google Fonts often contain multiple versions of the same font, the difference is in the value of `unicode-range`. With regards to an international audience you may want to keep all versions rather than just the Latin flavor.
- Run `npm run data:once`, `npm run js:once` and `npm run css:once` to see the result (resp. `npm run build` for the compressed version)

Alternatively, or in addition, you can use locally stored fonts. You can build all required files at [Font Squirrel](https://www.fontsquirrel.com). Follow [their instructions](https://www.fontsquirrel.com/blog/2010/12/how-to-use-the-generator), `src/data/raw/font-squirrel-config.txt` is a configuration file that can help you to speed up the process. You will need to edit `src/css/inc/fonts.css` and `src/data/raw/fonts.txt` manually in this case.

Below an overview of all system data sources:

| Path                          | Source                              | Editable |
|:------------------------------|:------------------------------------|:--------:|
| src/data/backgrounds.json     | public/media/patterns/backgrounds/* | ✗        | 
| src/data/borders.json         | public/media/patterns/borders/*     | ✗        | 
| src/data/css-props.json       | src/css/inc/card-defs.css           | ✗        | 
| src/data/fonts.json           | src/data/raw/fonts.txt              | ✗        | 
| src/data/labels.json          | src/data/raw/field-config.yml       | ✗        | 
| src/data/visibility.json      | src/data/raw/field-config.yml       | ✗        |
| public/js/characters.json     | src/data/raw/monsters.json          | ✗        |
| src/data/raw/fonts.txt        | https://tinyurl.com/ghastly-fonts   | ✓        | 
| src/data/raw/monsters.json    | https://tinyurl.com/monster-index   | ✓        | 
| src/data/raw/field-config.yml | manually edited                     | ✓        |


Whenever you make changes to the underlying data, the files in the root folder need to be re-generated with one of the following commands:

| Command              | Purpose                             |
|:---------------------|:------------------------------------|
| `npm run data:once`  | Generates uncompressed config files |
| `npm run data:build` | Generates compressed config files   |
| `npm run build`      | Includes `npm run data:build`       |

## User data
User data are stored in `localStorage` under keys defined in `src/config/config.json#storageKeys`.

- `storageKeys.cards`: All cards along with the modifications made along the way
- `storageKeys.tabs`: All tabs along with their styles
- `storageKeys.user`: Everything that doesn't fit the other two, such as the preferred order of characters in the library

## UI elements in general
Most of the UI elements are build as Web Components. Usually all related files or variables share variations of the same name; let's take `src/js/app/components/character-cards/CardRecto.js` as an example:
- JS class: `CardRecto`
- HTML element `<card-recto>`
- CSS file `card-recto.css`

More complex scenarios, such as cards or tabs, where multiple components act alongside, are controlled or supported by a `*manager.js` module. 

Notably, these components don't use `Shadow DOM`. They are acting within a clearly defined scope where style or script encapsulation doesn't matter. 

DOM elements anywhere in the code are accessed or created with [fancy-node](https://www.npmjs.com/package/fancy-node). This isn't a JS framework but a very simple wrapper around `document.createElement`. 

## Character library
The library is the list of all characters and built from `public/js/characters.json`. It can be ordered, or more correctly, grouped by using the order symbol above. Whether or not grouping by a certain criterion is possible depends on `src/data/raw/field-config.yml#<field>.visibility.group`.

It would be easy to add user-created characters to the library but it would require an investigation of the possible implications.

## Workbench

The workbench is organized in tabs. 

- _Add a new tab:_ click on the + icon or by double-click on the tab bar
-  _Rename a tab:_ double-click on the tab or via context menu
-  _Close a tab:_ click on the × icon or via context menu. Closing a tab also _destroys all cards_ on this tab. There is a 10 second timeout to undo closing a tab.
- _Close empty tabs:_ via context menu, closes all empty tabs _and_ invalids all timeouts
- _Close other tabs:_ via context menu, closes all tabs but the one that has issued the command. It also invalids all timeouts
- _Close all tabs:_ via context menu, also invalids all timeouts

_Note that a new tab is created whenever all tabs are closed_

## Style editor
All styles are on a per-tab basis and can be copied form on tab to another. They are stored in `localStorage` as part the tab configuration.

The editor has three sections, namely
- **Card:** Styles that are applicable to the cards directly
- **Badge:** Title and challenge rating
- **Frame:** Everything related to the card border

There are four different widget types that are used where applicable. Their default values are taken from `src/data/css-props.json`, i.e. based on the card stylesheet. 

The font families correspond to `src/data/fonts.json`, the patterns to `src/data/backgrounds.json` and `src/data/borders.json`.



