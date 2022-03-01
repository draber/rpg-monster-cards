(function () {
    'use strict';

    const dash = term => {
        return term.replace(/[\W_]+/g, ' ')
            .trim()
            .split(/ |\B(?=[A-Z])/)
            .map(word => word.toLowerCase())
            .join('-');
    };
    const cast = content => {
        if (typeof content === 'undefined') {
            return document.createDocumentFragment();
        }
        if (content instanceof Element || content instanceof DocumentFragment) {
            return content;
        }
        if (typeof content === 'number') {
            content = content.toString();
        }
        if (typeof content === 'string' ||
            content instanceof String
        ) {
            if (!(/<(.*)>/.test(content))) {
                return document.createTextNode(content);
            }
            let node;
            const mime = content.includes('<svg') ? 'image/svg+xml' : 'text/html';
            const doc = (new DOMParser()).parseFromString(content, mime);
            if (doc.body) {
                node = document.createDocumentFragment();
                const children = Array.from(doc.body.childNodes);
                children.forEach(elem => {
                    node.append(elem);
                });
                return node;
            }
            else {
                return doc.documentElement;
            }
        }
        console.error('Expected Element|DocumentFragment|String|HTMLCode|SVGCode, got', content);
    };
    const obj = {
        $: (selector, container = null) => {
            return typeof selector === 'string' ? (container || document).querySelector(selector) : selector || null;
        },
        $$: (selector, container = null) => {
            return [].slice.call((container || document).querySelectorAll(selector));
        },
        waitFor: function (selector, container = null) {
            return new Promise(resolve => {
                const getElement = () => {
                    const element = obj.$(selector, container);
                    if (element) {
                        resolve(element);
                    } else {
                        requestAnimationFrame(getElement);
                    }
                };
                getElement();
            })
        },
        toNode: content => {
            if (!content.forEach || typeof content.forEach !== 'function') {
                content = [content];
            }
            content = content.map(entry => cast(entry));
            if (content.length === 1) {
                return content[0]
            } else {
                const fragment = document.createDocumentFragment();
                content.forEach(entry => {
                    fragment.append(entry);
                });
                return fragment;
            }
        },
        empty: element => {
            while (element.lastChild) {
                element.lastChild.remove();
            }
            element.textContent = '';
            return element;
        }
    };
    const create = function ({
        tag,
        content,
        attributes = {},
        style = {},
        data = {},
        aria = {},
        events = {},
        classNames = [],
        isSvg = false
    } = {}) {
        if(!isSvg && /[A-Z]/.test(tag)){
            tag = dash(tag);
            if(!customElements.get(tag)){
                throw Error(`${tag} is not a defined as a Custom Element`);
            }
        }
        const el = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
        new Map([
            ['class', 'className'],
            ['for', 'htmlFor'],
            ['tabindex', 'tabIndex'],
            ['nomodule', 'noModule'],
            ['contenteditable', 'contentEditable'],
            ['colspan', 'colSpan'],
            ['accesskey', 'accessKey']
        ]).forEach((right, wrong) => {
            if (typeof attributes[right] === 'undefined' && attributes[wrong]) {
                attributes[right] = attributes[wrong];
            }
            delete attributes[wrong];
        });
        if (attributes.style) {
            const styleAttr = {};
            attributes.style.split(';').forEach(rule => {
                const parts = rule.split(':').map(entry => entry.trim());
                styleAttr[parts[0]] = parts[1];
            });
            style = {
                ...styleAttr,
                ...style
            };
            delete attributes.style;
        }
        for (let [key, value] of Object.entries(attributes)) {
            if (isSvg) {
                el.setAttributeNS(null, key, value.toString());
            } else if (value !== false) {
                el[key] = value;
            }
        }
        for (let [key, value] of Object.entries(aria)) {
            key = key === 'role' ? key : 'aria-' + key;
            el.setAttribute(key.toLowerCase(), value);
        }
        for (let [key, value] of Object.entries(data)) {
            value = value.toString();
            el.dataset[key] = value;
        }
        for (const [event, fn] of Object.entries(events)) {
            el.addEventListener(event, fn, false);
        }
        Object.assign(el.style, style);
        if (classNames.length) {
            el.classList.add(...classNames);
        }
        if (typeof content !== 'undefined') {
            el.append(obj.toNode(content));
        }
        return el;
    };
    var src = new Proxy(obj, {
        get(target, prop) {
            return function () {
                const args = Array.from(arguments);
                if (Object.prototype.hasOwnProperty.call(target, prop) && target[prop] instanceof Function) {
                    target[prop].bind(target);
                    return target[prop].apply(null, args);
                }
                return create({
                    ...{
                        tag: prop
                    },
                    ...args.shift()
                });
            }
        }
    });

    const group = (dataObj, direction = 'asc') => {
        let keys = sort(Object.keys(dataObj));
        if (direction === 'desc') {
            keys = keys.reverse();
        }
        return keys.reduce((result, key) => {
            result[key] = dataObj[key];
            return result;
        }, {});
    };
    const sort = (dataArr, sortBy = null, direction = 'asc') => {
        return dataArr.sort((a, b) => {
            a = sortBy ? sortBy.split('.').reduce((o, i) => o[i], a) : a;
            b = sortBy ? sortBy.split('.').reduce((o, i) => o[i], b) : b;
            if (!isNaN(a) && !isNaN(b)) {
                return direction === 'asc' ? Number(a - b) : Number(b - a);
            }
            if (a > b) {
                return direction === 'asc' ? 1 : -1;
            }
            if (a < b) {
                return direction === 'asc' ? -1 : 1;
            }
            return 0;
        })
    };
    var sorter = {
        group,
        sort
    };

    var name$1 = {
    	group: "First Letter",
    	long: "Name",
    	short: "Name"
    };
    var __user$1 = {
    	long: "Your Creatures",
    	group: "Your Creatures"
    };
    var img$1 = {
    	long: "Image URL",
    	short: "Img",
    	group: "Image URL"
    };
    var cr$1 = {
    	long: "Challenge Rating",
    	short: "CR",
    	group: "Challenge Rating"
    };
    var base$1 = {
    	long: "Base",
    	short: "Base",
    	group: "Base"
    };
    var type$1 = {
    	long: "Type",
    	short: "Type",
    	group: "Type"
    };
    var hp$1 = {
    	long: "Hit Points",
    	short: "HP",
    	group: "Hit Points"
    };
    var speed$1 = {
    	long: "Speed",
    	short: "Spd",
    	group: "Speed"
    };
    var bag$1 = {
    	long: "Base Attack/Grapple",
    	short: "BA/G",
    	group: "Base Attack/Grapple"
    };
    var atk$1 = {
    	long: "Attack",
    	short: "Atk",
    	group: "Attack"
    };
    var atk_f$1 = {
    	long: "Full Attack",
    	short: "Full Atk",
    	group: "Full Attack"
    };
    var atk_p$1 = {
    	long: "Attack Parameters",
    	short: "Atk Params",
    	group: "Attack Parameters"
    };
    var sp_r$1 = {
    	long: "Space/Reach",
    	short: "Sp/Re",
    	group: "Space/Reach"
    };
    var atk_s$1 = {
    	long: "Special Attacks",
    	short: "Sp Atk",
    	group: "Special Attacks"
    };
    var rfx$1 = {
    	long: "Reflex",
    	short: "Rfx",
    	group: "Reflex"
    };
    var will$1 = {
    	long: "Will",
    	short: "Wil",
    	group: "Will"
    };
    var str$1 = {
    	long: "Strength",
    	short: "Str",
    	group: "Strength"
    };
    var dex$1 = {
    	long: "Dexterity",
    	short: "Dex",
    	group: "Dexterity"
    };
    var con$1 = {
    	long: "Constitution",
    	short: "Con",
    	group: "Constitution"
    };
    var int$1 = {
    	long: "Intelligence",
    	short: "Int",
    	group: "Intelligence"
    };
    var wis$1 = {
    	long: "Wisdom",
    	short: "Wis",
    	group: "Wisdom"
    };
    var cha$1 = {
    	long: "Charisma",
    	short: "Cha",
    	group: "Charisma"
    };
    var skills$1 = {
    	long: "Skills",
    	short: "Skills",
    	group: "Skills"
    };
    var feats$1 = {
    	long: "Feats",
    	short: "Feats",
    	group: "Feats"
    };
    var env$1 = {
    	long: "Environment",
    	short: "Env",
    	group: "Environment"
    };
    var org$1 = {
    	long: "Organization",
    	short: "Org",
    	group: "Organization"
    };
    var tre$1 = {
    	long: "Treasure",
    	short: "Treas",
    	group: "Treasure"
    };
    var algn$1 = {
    	long: "Alignment",
    	short: "Algn",
    	group: "Alignment"
    };
    var l_adj$1 = {
    	long: "Level Adjustment",
    	short: "L Adj",
    	group: "Level Adjustment"
    };
    var notes$1 = {
    	long: "Notes",
    	short: "Notes",
    	group: "Notes"
    };
    var fort$1 = {
    	long: "Fortitude",
    	short: "Fort",
    	group: "Fortitude"
    };
    var ac$1 = {
    	long: "Armor Class",
    	short: "AC",
    	group: "Armor Class"
    };
    var ini$1 = {
    	long: "Initiative",
    	short: "Ini",
    	group: "Initiative"
    };
    var labels$1 = {
    	name: name$1,
    	__user: __user$1,
    	img: img$1,
    	cr: cr$1,
    	base: base$1,
    	type: type$1,
    	hp: hp$1,
    	speed: speed$1,
    	bag: bag$1,
    	atk: atk$1,
    	atk_f: atk_f$1,
    	atk_p: atk_p$1,
    	sp_r: sp_r$1,
    	atk_s: atk_s$1,
    	rfx: rfx$1,
    	will: will$1,
    	str: str$1,
    	dex: dex$1,
    	con: con$1,
    	int: int$1,
    	wis: wis$1,
    	cha: cha$1,
    	skills: skills$1,
    	feats: feats$1,
    	env: env$1,
    	org: org$1,
    	tre: tre$1,
    	algn: algn$1,
    	l_adj: l_adj$1,
    	notes: notes$1,
    	fort: fort$1,
    	ac: ac$1,
    	ini: ini$1
    };

    var css = {
    	entryPoint: "src/css/main.css",
    	"public": "public/css/main.css"
    };
    var cssProps$2 = {
    	src: "src/css/inc/card-defs.css",
    	target: "src/data/css-props.json"
    };
    var fonts$1 = {
    	src: "src/data/raw/fonts.txt",
    	target: "src/data/fonts.json"
    };
    var backgrounds$1 = {
    	src: "public/media/patterns/backgrounds",
    	target: "src/data/backgrounds.json"
    };
    var borders$1 = {
    	src: "public/media/patterns/borders",
    	target: "src/data/borders.json"
    };
    var characters = {
    	src: "src/data/raw/monsters.json",
    	target: "public/js/characters.json"
    };
    var fields = {
    	src: "src/config/field-config.yml"
    };
    var labels = {
    	target: "src/data/labels.json"
    };
    var visibility$1 = {
    	target: "src/data/visibility.json"
    };
    var js = {
    	entryPoint: "src/js/app/main.js",
    	"public": "public/js/main.js"
    };
    var storageKeys = {
    	user: "gc-user-prefs",
    	cards: "gc-cards",
    	tabs: "gc-tabs"
    };
    var userCharacters = {
    	inLibrary: true
    };
    var config = {
    	css: css,
    	cssProps: cssProps$2,
    	fonts: fonts$1,
    	backgrounds: backgrounds$1,
    	borders: borders$1,
    	characters: characters,
    	fields: fields,
    	labels: labels,
    	visibility: visibility$1,
    	js: js,
    	storageKeys: storageKeys,
    	userCharacters: userCharacters
    };

    let settings = {
        ...config
    };
    const get$5 = key => {
        let current = Object.create(settings);
        for (let token of key.split('.')) {
            if (typeof current[token] === 'undefined') {
                return undefined;
            }
            current = current[token];
        }
        return current;
    };
    const set$5 = (key, value) => {
        const keys = key.split('.');
        const last = keys.pop();
        let current = settings;
        for (let part of keys) {
            if (!current[part]) {
                current[part] = {};
            }
            if (Object.prototype.toString.call(current) !== '[object Object]') {
                console.error(`${part} is not of the type Object`);
                return false;
            }
            current = current[part];
        }
        current[last] = value;
    };
    var settings$1 = {
        get: get$5,
        set: set$5
    };

    const lsKey$2 = settings$1.get('storageKeys.cards');
    const data = {
        system: {},
        user: {}
    };
    const storage = {
        read: () => {
            return JSON.parse(localStorage.getItem(lsKey$2) || '{}')
        },
        update: () => {
            return localStorage.setItem(lsKey$2, JSON.stringify(data.user || {}))
        }
    };
    const values = type => {
        return Object.values(data[type]);
    };
    const set$4 = (type, cid, character) => {
        cid = parseCid(cid);
        data[type][cid] = character;
        if (type === 'user') {
            storage.update();
        }
    };
    const get$4 = (type, cidData) => {
        const cid = parseCid(cidData);
        return data[type][cid];
    };
    const parseCid = data => {
        let cid;
        switch (true) {
            case !!data.cid:
                cid = data.cid;
                break;
            case !!(data.meta && data.meta.cid):
                cid = data.meta.cid;
                break;
            default:
                cid = data;
        }
        if(isNaN(cid)){
            throw `${cid} is not a valid character identifier`;
        }
        return parseInt(cid, 10);
    };
     const update$2 = (type, cidData, key, value) => {
        const cid = parseCid(cidData);
        const character = get$4(type, cidData);
        if (value === null) {
            delete character[key];
        } else {
            character[key] = value;
        }
        set$4(type, cid, character);
    };
    const getAllByType = type => {
        return data[type];
    };
    const remove$1 = (type, cidData) => {
        const cid = parseCid(cidData);
        delete data[type][cid];
        if (type === 'user') {
            storage.update();
        }
    };
    const nextIncrement$1 = type => {
        const lowest = type === 'system' ? 0 : 5000;
        return Math.max(...[lowest].concat(Object.keys(data[type]))) + 1;
    };
    const init$4 = () => {
        data.user = storage.read();
        return (fetch('js/characters.json')
            .then(response => response.json())
            .then(data => {
                data.forEach((props, cid) => {
                    set$4('system', cid, {
                        meta: {
                            cid,
                            origin: 'system'
                        },
                        props
                    });
                });
            }));
    };
    var characterStorage = {
        init: init$4,
        get: get$4,
        set: set$4,
        update: update$2,
        remove: remove$1,
        parseCid,
        values,
        nextIncrement: nextIncrement$1,
        getAllByType
    };

    const prepareGroupSort = (entry, groupBy) => {
        if (entry.props[groupBy] === '' || typeof entry.props[groupBy] === 'undefined') {
            entry.props[groupBy] = 'n/a';
        }
        switch (groupBy) {
            case '__user':
                entry.meta._groupValue = labels$1.__user.group;
                entry.meta._groupLabel = labels$1.__user.group;
                break;
            case 'name':
                entry.meta._groupValue = entry.props.name.charAt(0).toUpperCase();
                entry.meta._groupLabel = `${labels$1[groupBy].group}: ${entry.meta._groupValue}`;
                break
            default:
                entry.meta._groupValue = entry.props[groupBy];
                entry.meta._groupLabel = `${labels$1[groupBy].group}: ${entry.props[groupBy]}`;
        }
        return entry;
    };
    const getSortedCharacters = (type, {
        groupBy = 'name',
        sortBy = 'name',
        groupDir = 'asc',
        sortDir = 'name'
    } = {}) => {
        let grouped = {};
        for (let entry of characterStorage.values(type)) {
            entry = prepareGroupSort(entry, groupBy);
            grouped[entry.meta._groupValue] = grouped[entry.meta._groupValue] || [];
            grouped[entry.meta._groupValue].push(entry);
        }
        if (type === 'system') {
            grouped = sorter.group(grouped, groupDir);
        }
        for (let [key, values] of Object.entries(grouped)) {
            grouped[key] = sorter.sort(values, `props.${sortBy}`, sortDir);
        }
        return grouped;
    };
    var characterProvider = {
        getSortedCharacters
    };

    const lsKey$1 = settings$1.get('storageKeys.user');
    settings$1.set('userPrefs', JSON.parse(localStorage.getItem(lsKey$1) || '{}'));
    const getAll = () => {
        return settings$1.get(`userPrefs`);
    };
    const get$3 = key => {
        return settings$1.get(`userPrefs.${key}`);
    };
    const set$3 = (key, value) => {
        settings$1.set(`userPrefs.${key}`, value);
        localStorage.setItem(lsKey$1, JSON.stringify(getAll()));
        return true;
    };
    var userPrefs = {
        getAll,
        get: get$3,
        set: set$3
    };

    const on = function(types, action)  {
        if (typeof types === 'string') {
            types = [types];
        }
        types.forEach(type => {
            this.addEventListener(type, action);
        });
    };
    const trigger = function(types, data)  {
        if (typeof types === 'string') {
            types = [types];
        }
        types.forEach(type => {
            this.dispatchEvent(data ? new CustomEvent(type, {
                detail: data
            }) : new Event(type));
        });
    };

    class CharacterLibrary extends HTMLElement {
        get groupBy() {
            return this.getAttribute('groupby');
        }
        set groupBy(value) {
            this.setAttribute('groupby', value);
        }
        get sortBy() {
            return this.getAttribute('sortby');
        }
        set sortBy(value) {
            this.setAttribute('sortby', value);
        }
        get groupDir() {
            return this.getAttribute('groupdir');
        }
        set groupDir(value) {
            this.setAttribute('groupdir', value);
        }
        get sortDir() {
            return this.getAttribute('sortdir');
        }
        set sortDir(value) {
            this.setAttribute('sortdir', value);
        }
        populate() {
            const characterList = new DocumentFragment();
            const groupContainers = [];
            let firstGroupClassNames = [];
            const systemCollection = Object.values(characterProvider.getSortedCharacters('system', this));
            const userCollection = Object.values(characterProvider.getSortedCharacters('user', {
                groupBy: '__user',
                sortBy: 'name'
            }));
            let collection = systemCollection;
            if (settings$1.get('userCharacters.inLibrary') && userCollection.length) ;
            collection.forEach((values, index) => {
                let list = src.ul();
                let groupContainer = src.details({
                    classNames: index === 0 ? firstGroupClassNames : [],
                    attributes: {
                        open: index === 0
                    },
                    content: [
                        src.summary({
                            content: values[0].meta._groupLabel,
                            attributes: {
                                title: values[0].meta._groupLabel
                            }
                        }),
                        list
                    ],
                    events: {
                        toggle: e => {
                            if (e.target.open) {
                                groupContainers.forEach(container => {
                                    if (container.isSameNode(e.target)) {
                                        return true;
                                    }
                                    container.open = false;
                                });
                            }
                        }
                    }
                });
                characterList.append(groupContainer);
                groupContainers.push(groupContainer);
                values.forEach(value => {
                    list.append(src.li({
                        content: value.props.name,
                        attributes: {
                            title: value.props.name
                        },
                        data: {
                            cid: value.meta.cid
                        }
                    }));
                });
            });
            src.empty(this).append(characterList);
        }
        connectedCallback() {
            this.on('pointerdown', e => {
                if (e.button !== 0) {
                    return true;
                }
                const li = e.target.closest('li');
                if (!li) {
                    return false;
                }
                this.app.trigger('characterSelection', (() => {
                    const type = li.closest('details').classList.contains('user-generated') ? 'user' : 'system';
                    const character = characterStorage.get(type, li.dataset.cid);
                    character.meta._groupLabel && delete character.meta._groupLabel;
                    character.meta._groupValue && delete character.meta._groupValue;
                    return character;
                })());
            });
            this.sortBy = userPrefs.get('characters.sortBy') || this.sortBy || 'name';
            this.groupBy = userPrefs.get('characters.groupBy') || this.groupBy || 'name';
            this.sortDir = userPrefs.get('characters.sortDir') || this.sortDir || 'asc';
            this.groupDir = userPrefs.get('characters.groupDir') || this.groupDir || 'asc';
            this.populate();
        }
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            self.app.on('characterOrderChange', e => {
                ['sortBy', 'groupBy', 'sortDir', 'groupDir'].forEach(crit => {
                    if (e.detail[crit]) {
                        self[crit] = e.detail[crit];
                    }
                });
                self.populate();
            });
            return self;
        }
    }
    const register$i = app => {
        CharacterLibrary.prototype.app = app;
        customElements.get('character-library') || customElements['define']('character-library', CharacterLibrary);
    };
    var CharacterLibrary$1 = {
        register: register$i
    };

    var name = {
    	card: true,
    	group: true,
    	label: true
    };
    var __user = {
    	card: true,
    	group: false,
    	label: true
    };
    var img = {
    	card: true,
    	group: false,
    	label: false
    };
    var cr = {
    	card: true,
    	group: true,
    	label: true
    };
    var base = {
    	card: false,
    	group: true,
    	label: true
    };
    var type = {
    	card: true,
    	group: false,
    	label: true
    };
    var hp = {
    	card: true,
    	group: true,
    	label: true
    };
    var speed = {
    	card: true,
    	group: true,
    	label: true
    };
    var bag = {
    	card: true,
    	group: true,
    	label: true
    };
    var atk = {
    	card: true,
    	group: true,
    	label: true
    };
    var atk_f = {
    	card: true,
    	group: true,
    	label: true
    };
    var atk_p = {
    	card: true,
    	group: true,
    	label: true
    };
    var sp_r = {
    	card: true,
    	group: true,
    	label: true
    };
    var atk_s = {
    	card: true,
    	group: true,
    	label: true
    };
    var rfx = {
    	card: true,
    	group: true,
    	label: true
    };
    var will = {
    	card: true,
    	group: true,
    	label: true
    };
    var str = {
    	card: true,
    	group: true,
    	label: true
    };
    var dex = {
    	card: true,
    	group: true,
    	label: true
    };
    var con = {
    	card: true,
    	group: true,
    	label: true
    };
    var int = {
    	card: true,
    	group: true,
    	label: true
    };
    var wis = {
    	card: true,
    	group: true,
    	label: true
    };
    var cha = {
    	card: true,
    	group: true,
    	label: true
    };
    var skills = {
    	card: true,
    	group: true,
    	label: true
    };
    var feats = {
    	card: true,
    	group: true,
    	label: true
    };
    var env = {
    	card: true,
    	group: true,
    	label: true
    };
    var org = {
    	card: true,
    	group: true,
    	label: true
    };
    var tre = {
    	card: true,
    	group: true,
    	label: true
    };
    var algn = {
    	card: true,
    	group: true,
    	label: true
    };
    var l_adj = {
    	card: true,
    	group: true,
    	label: true
    };
    var notes = {
    	card: true,
    	group: true,
    	label: true
    };
    var fort = {
    	card: true,
    	group: true,
    	label: true
    };
    var ac = {
    	card: true,
    	group: true,
    	label: true
    };
    var ini = {
    	card: true,
    	group: true,
    	label: true
    };
    var visibility = {
    	name: name,
    	__user: __user,
    	img: img,
    	cr: cr,
    	base: base,
    	type: type,
    	hp: hp,
    	speed: speed,
    	bag: bag,
    	atk: atk,
    	atk_f: atk_f,
    	atk_p: atk_p,
    	sp_r: sp_r,
    	atk_s: atk_s,
    	rfx: rfx,
    	will: will,
    	str: str,
    	dex: dex,
    	con: con,
    	int: int,
    	wis: wis,
    	cha: cha,
    	skills: skills,
    	feats: feats,
    	env: env,
    	org: org,
    	tre: tre,
    	algn: algn,
    	l_adj: l_adj,
    	notes: notes,
    	fort: fort,
    	ac: ac,
    	ini: ini
    };

    class LibraryOrganizer extends HTMLElement {
        get groupBy() {
            return this.getAttribute('groupby');
        }
        set groupBy(value) {
            this.setAttribute('groupby', value);
        }
        connectedCallback() {
            this.on('pointerdown', e => {
                if(e.button !== 0){
                    return true;
                }
                const li = e.target.closest('li');
                if (!li) {
                    return false;
                }
                userPrefs.set('characters.groupBy', li.dataset.groupBy);
                this.app.trigger('characterOrderChange', {
                    groupBy: li.dataset.groupBy
                });
            });
            this.groupBy = userPrefs.get('characters.groupBy') || this.groupBy || 'name';
            const icon = src.svg({
                isSvg: true,
                content: src.use({
                    isSvg: true,
                    attributes: {
                        href: 'media/icons.svg#icon-sort'
                    }
                })
            });
            const box = src.div({
                classNames: ['sort-box']
            });
            const title = src.h3({
                content: 'Order library by:'
            });
            const list = src.ul();
            box.append(title, list);
            for (let [key, value] of Object.entries(labels$1)) {
                if(!visibility[key].group){
                    continue;
                }
                let classNames = key === this.groupBy ? ['active'] : [];
                list.append(src.li({
                    classNames,
                    content: value.group,
                    data: {
                        groupBy: key
                    }
                }));
            }
            this.append(icon, box);
        }
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            return self;
        }
    }
    const register$h = app => {
        LibraryOrganizer.prototype.app = app;
        customElements.get('library-organizer') || customElements['define']('library-organizer', LibraryOrganizer);
    };
    var LibraryOrganizer$1 = {
        register: register$h
    };

    const set$2 = (key, value, target) => {
        target = target || document.body;
        target.dataset[key] = value;
    };
    const get$2 = (key, target) => {
        target = target || document.body;
        if (typeof target.dataset[key] === 'undefined') {
            return false;
        }
        return JSON.parse(target.dataset[key]);
    };
    const toggle$1 = (key, target) => {
        set$2(key, !get$2(key, target), target);
    };
    const unset = (key, target) => {
        target = target || document.body;
        delete target.dataset[key];
    };
    var properties = {
        unset,
        get: get$2,
        set: set$2,
        toggle: toggle$1
    };

    let toast$1;
    const initiate$1 = (element, label) => {
        if (!toast$1) {
            toast$1 = src.div({
                data: {
                    undoDialogs: true
                }
            });
            document.body.append(toast$1);
        }
        properties.set('softDeleted', true, element);
        const dialog = document.createElement('undo-dialog');
        dialog.element = element;
        if (label) {
            dialog.label = label;
        }
        toast$1.append(dialog);
        return new Promise(resolve => {
            dialog.on('restore', e => {
                properties.unset('softDeleted', element);
                resolve({
                    action: 'restore',
                    element: e.detail.element
                });
            });
            dialog.on('remove', e => {
                resolve({
                    action: 'remove',
                    element: e.detail.element
                });
            });
        })
    };
    const cancel$1 = () => {
        if (toast$1) {
            toast$1 = src.empty(toast$1);
        }
    };
    var softDelete$1 = {
        initiate: initiate$1,
        cancel: cancel$1
    };

    const convertToRoman = num => {
      const roman = {
        M: 1000,
        CM: 900,
        D: 500,
        CD: 400,
        C: 100,
        XC: 90,
        L: 50,
        XL: 40,
        X: 10,
        IX: 9,
        V: 5,
        IV: 4,
        I: 1
      };
      let str = '';
      for (let i of Object.keys(roman)) {
        const q = Math.floor(num / roman[i]);
        num -= q * roman[i];
        str += i.repeat(q);
      }
      return str;
    };

    let tabList;
    const lsKey = settings$1.get('storageKeys.tabs');
    const init$3 = () => {
        tabList = tabList || read();
    };
    const read = () => {
        const stored = JSON.parse(localStorage.getItem(lsKey) || '{}');
        return Object.keys(stored).length ?
            stored :
            {
                1: blank()
            };
    };
    const write = () => {
        init$3();
        return localStorage.setItem(lsKey, JSON.stringify(tabList));
    };
    const nextIncrement = () => {
        let keys = tabList ? Object.keys(tabList).map(e => parseInt(e)) : [];
        if(!keys.length){
            keys = [0];
        }
        return Math.max(...keys) + 1;
    };
    const blank = () => {
        const tid = nextIncrement();
        return {
            tid,
            title: convertToRoman(tid),
            styles: {}
        }
    };
    const parseTid = data => {
        return parseInt((data.tid ? data.tid : data), 10);
    };
    const get$1 = data => {
        init$3();
        if (data === 'all') {
            return tabList;
        }
        if (!data) {
            return blank();
        }
        const tid = parseTid(data);
        return tabList[tid] ? tabList[tid] : blank();
    };
    const set$1 = (tidData, data) => {
        init$3();
        tabList[parseTid(tidData)] = data;
        write();
    };
    const update$1 = (tidData, key, value) => {
        const tid = parseTid(tidData);
        const entry = get$1(tid);
        if (value === null) {
            delete entry[key];
        } else {
            entry[key] = value;
        }
        set$1(tid, entry);
    };
    const remove = tidData => {
        init$3();
        delete tabList[parseTid(tidData)];
        write();
    };
    var tabStorage = {
        get: get$1,
        set: set$1,
        update: update$1,
        remove,
        parseTid
    };

    let app$1;
    let navi;
    let contentArea;
    let activeTab;
    const setActiveTab = tab => {
        activeTab = tab || activeTab || src.$(`tab-handle`, navi);
        src.$$('tab-handle', navi).forEach(tab => {
            tab.classList.remove('active');
            tab.panel.classList.remove('active');
            tabStorage.update(tab, 'active', null);
            tab.removeAttribute('style');
        });
        activeTab.classList.add('active');
        app$1.trigger('tabStyleChange', {
            tab: activeTab,
            styles: tabStorage.get(activeTab).styles
        });
        const naviRect = navi.getBoundingClientRect();
        const atRect = activeTab.getBoundingClientRect();
        const addRect = navi.lastChild.getBoundingClientRect();
        const space = naviRect.width -
            (addRect.width + parseInt(getComputedStyle(navi.lastChild).marginLeft)) -
            atRect.width;
        navi.classList.remove('overflown');
        if (navi.scrollWidth > navi.clientWidth) {
            navi.classList.add('overflown');
            const nonActiveTabs = getTabs(activeTab);
            const tabMaxWidth = space / nonActiveTabs.length;
            nonActiveTabs.forEach(tab => {
                tab.style.maxWidth = tabMaxWidth + 'px';
            });
        }
        activeTab.panel.classList.add('active');
        tabStorage.update(activeTab, 'active', true);
        return activeTab;
    };
    const getTab = tabData => {
        if (tabData === 'active') {
            return activeTab;
        }
        if (tabData instanceof HTMLElement) {
            return tabData
        }
        return src.$(`tab-handle[tid="${tabStorage.parseTid(tabData)}"]`, navi);
    };
    const getTabs = exclude => {
        let tabs = Array.from(src.$$(`tab-handle`, navi));
        switch (true) {
            case exclude instanceof customElements.get('tab-handle'):
                return tabs.filter(tab => !tab.isSameNode(exclude));
            case exclude === 'empty':
                return tabs.filter(tab => !src.$('card-base', tab));
            default:
                return tabs;
        }
    };
    const createTab = ({
        tabEntry,
        previousTab,
        activate = false
    } = {}) => {
        tabEntry = tabEntry || tabStorage.get();
        const tab = document.createElement('tab-handle');
        tab.panel = document.createElement('tab-panel');
        tab.container = navi;
        for (let [key, value] of Object.entries(tabEntry)) {
            tab[key] = value;
        }
        tab.panel.active = tab.active;
        tab.panel.tid = tab.tid;
        contentArea.append(tab.panel);
        if (previousTab) {
            previousTab.after(tab);
        } else {
            src.$('.adder', navi).before(tab);
        }
        tabStorage.set(tabEntry, tabEntry);
        if (activate) {
            setActiveTab(tab);
        }
        return tab;
    };
    const getUpcomingActiveTab = () => {
        let tabs = Array.from(src.$$(`tab-handle:not([data-soft-deleted])`, navi));
        if (!tabs.length) {
            return createTab();
        }
        let activeIdx = Math.max(0, tabs.findIndex(e => e.isSameNode(activeTab)));
        if (tabs[activeIdx + 1]) {
            return tabs[activeIdx + 1];
        }
        if (tabs[activeIdx - 1]) {
            return tabs[activeIdx - 1];
        }
        return createTab();
    };
    const bulkDelete$1 = exclude => {
        softDelete$1.cancel();
        getTabs(exclude).forEach(tab => {
            handleRemoval$1(tab, 'remove');
        });
    };
    const handleRemoval$1 = (tab, action) => {
        switch (action) {
            case 'soft':
                if (tab.isSameNode(activeTab)) {
                    setActiveTab(getUpcomingActiveTab());
                }
                softDelete$1.initiate(tab, 'Tab ' + tab.title)
                    .then(data => {
                        handleRemoval$1(tab, data.action);
                    });
                tabStorage.update(tab, 'softDeleted', true);
                break;
            case 'restore':
                tabStorage.update(tab, 'softDeleted', null);
                break;
            case 'remove':
                app$1.trigger('tabDelete', {
                    tab
                });
                tabStorage.remove(tab);
                tab.remove();
                if (Object.keys(tabStorage.get('all')).length === 0) {
                    createTab({
                        activate: true
                    });
                }
                break;
            case 'empty':
                bulkDelete$1('empty');
                setActiveTab();
                break;
            case 'others':
                bulkDelete$1(tab);
                setActiveTab(tab);
                break;
            case 'all':
                bulkDelete$1();
                break;
        }
    };
    const restore = () => {
        const entries = Object.values(tabStorage.get('all'));
        const activeSet = entries.filter(e => !!e.active);
        const activeTid = activeSet.length ? activeSet[0].tid : Object.keys(tabStorage.get('all'))[0];
        for (let tabEntry of entries) {
            createTab({
                tabEntry
            });
        }
        setActiveTab(getTab(activeTid));
    };
    const init$2 = _app => {
        app$1 = _app;
        navi = src.$('tab-navi', app$1);
        contentArea = src.$('tab-content', app$1);
        restore();
        app$1.on('singleStyleChange', e => {
            const tab = e.detail.tab || activeTab;
            const entry = tabStorage.get(tab);
            entry.styles[e.detail.area] = entry.styles[e.detail.area] || {};
            entry.styles[e.detail.area][e.detail.name] = e.detail.value;
            tabStorage.set(tab, entry);
            if (tab.isSameNode(activeTab)) {
                tab.panel.style.setProperty(e.detail.name, e.detail.value);
            }
        });
        app$1.on('styleReset', e => {
            tabStorage.update(e.detail.tab, 'styles', {});
            app$1.trigger('tabStyleChange', {
                tab: e.detail.tab,
                styles: {}
            });
        });
    };
    var tabManager = {
        init: init$2,
        createTab,
        handleRemoval: handleRemoval$1,
        setActiveTab,
        getTab,
        getTabs
    };

    class TabNavi extends HTMLElement {
        connectedCallback() {
            const adder = src.span({
                content: '🞤',
                classNames: ['adder', 'btn', 'tab'],
                events: {
                    pointerup: e => {
                        if (e.button !== 0) {
                            return true;
                        }
                        tabManager.createTab({
                            activate: true
                        });
                    }
                }
            });
            this.addEventListener('dblclick', e => {
                if (e.target.isSameNode(this)) {
                    tabManager.createTab({
                        activate: true
                    });
                }
            });
            this.append(adder);
        }
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            return self;
        }
    }
    const register$g = app => {
        TabNavi.prototype.app = app;
        customElements.get('tab-navi') || customElements['define']('tab-navi', TabNavi);
    };
    var TabNavi$1 = {
        register: register$g
    };

    let firstRegistration = true;
    const getPosition = (e, menu) => {
        const menuXY = {
            x: menu.offsetWidth,
            y: menu.offsetHeight
        };
        const screenXY = {
            x: screen.availWidth,
            y: screen.availHeight
        };
        const mouseXY = {
            x: e.pageX,
            y: e.pageY,
        };
        const style = {
            x: (mouseXY.x + menuXY.x) <= screenXY.x ? mouseXY.x : mouseXY.x - menuXY.x,
            y: (mouseXY.y + menuXY.y) <= screenXY.y ? mouseXY.y : mouseXY.y - menuXY.y,
        };
        return {
            left: style.x + 'px',
            top: style.y + 'px'
        }
    };
    function onContextMenu(e) {
        e.preventDefault();
        this.contextMenu.show(e);
    }
    function offContextMenu(e) {
        const menu = document.querySelector('[data-type="context-menu"]:not([hidden])');
        if(menu){
            menu.hide();
        }
    }
    const init$1 = () => {
        if(firstRegistration) {
            document.addEventListener('pointerup', offContextMenu);
            firstRegistration = false;
        }
    };
    const unregister = owner => {
        owner.contextMenu.remove();
    };
    const register$f = (owner, menu) => {
        init$1();
        menu.setAttribute('aria-role', 'menu');
        menu.dataset.type = 'context-menu';
        owner.contextMenu = menu;
        menu.owner = owner;
        menu.show = e => {
            Object.assign(menu.style, getPosition(e, menu));
            menu.removeAttribute('hidden');
            if(!menu.isConnected){
                document.body.append(menu);
            }
        };
        menu.hide = () => {
            menu.hidden =true;
        };
        owner.addEventListener('contextmenu', onContextMenu);
        return menu;
    };
    var contextMenu = {
        register: register$f,
        unregister
    };

    class TabHandle extends HTMLElement {
        sanitize(text) {
            return new DOMParser()
                .parseFromString(text, 'text/html').body.textContent
                .replace(/\s+/g, ' ')
                .substring(0, 30);
        }
        makeEditable() {
            let selection = window.getSelection();
            selection.removeAllRanges();
            let range = document.createRange();
            this.label.contentEditable = true;
            range.selectNodeContents(this.label);
            selection.addRange(range);
            this.focus();
        }
        get title() {
            return this.getAttribute('title');
        }
        set title(value) {
            this.setAttribute('title', value);
        }
        get tid() {
            return this.getAttribute('tid');
        }
        set tid(value) {
            this.setAttribute('tid', value);
        }
        disconnectedCallback() {
            this.panel.remove();
            contextMenu.unregister(this);
        }
        connectedCallback() {
            contextMenu.register(this, document.createElement('tab-menu'));
            this.closer = src.span({
                content: '✖',
                classNames: ['closer']
            });
            this.label = src.span({
                content: this.title,
                classNames: ['label'],
                events: {
                    blur: e => {
                        this.label.contentEditable = false;
                        this.label.textContent = this.sanitize(this.label.textContent);
                        this.title = this.label.textContent.trim();
                        tabStorage.update(this, 'title', this.title);
                    },
                    paste: e => {
                        e.preventDefault();
                        this.label.textContent = this.sanitize(e.clipboardData.getData('text'));
                    },
                    keydown: e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            this.label.blur();
                            return false;
                        }
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            this.label.textContent = this.title;
                            this.label.blur();
                            return false;
                        }
                    }
                }
            });
            this.on('pointerup', e => {
                if (e.button > 1) {
                    return true;
                }
                if (e.button === 1 || e.target.isSameNode(this.closer)) {
                    e.preventDefault();
                    e.stopPropagation();
                    tabManager.handleRemoval(this, 'soft');
                } else {
                    tabManager.setActiveTab(this);
                }
            });
            this.on('dblclick', () => {
                this.makeEditable();
            });
            this.append(this.label, this.closer);
        }
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            return self;
        }
    }
    const register$e = app => {
        TabHandle.prototype.app = app;
        customElements.get('tab-handle') || customElements['define']('tab-handle', TabHandle);
    };
    var TabHandle$1 = {
        register: register$e
    };

    const deepClone = obj => {
        return !(structuredClone instanceof Function) ? JSON.parse(JSON.stringify(obj)) : structuredClone(obj);
    };

    const origin$1 = 'user';
    const set = (element, mode) => {
        clear(element);
        element.app.pastableCard = {
            cid: characterStorage.parseCid(element),
            tid: tabStorage.parseTid(element),
            mode
        };
        element.classList.add(element.app.pastableCard.mode);
    };
    const cut = element => {
        set(element, 'cut');
    };
    const copy = element => {
        set(element, 'copy');
    };
    const paste = element => {
        const character = deepClone(characterStorage.get(origin$1, element.app.pastableCard));
        character.meta.cid = characterStorage.nextIncrement(origin$1);
        character.meta.tid = tabStorage.parseTid(element);
        element.app.trigger('characterSelection', character);
        if(element.app.pastableCard.mode === 'cut'){
            characterStorage.remove(origin$1, element.app.pastableCard);
        }
        clear();
    };
    const clear = element => {
        const lastCopied = src.$('card-base.cut, card-base.copy', element.app);
        if (lastCopied) {
            lastCopied.classList.remove('cut', 'copy');
        }
        delete element.app.pastableCard;
    };
    var cardCopy = {
        copy,
        cut,
        paste,
        clear
    };

    class TabContent extends HTMLElement {
        get tid() {
            return this.getAttribute('tid');
        }
        set tid(value) {
            this.setAttribute('tid', value);
        }
        disconnectedCallback() {
            contextMenu.unregister(this);
        }
        connectedCallback() {
            contextMenu.register(this, document.createElement('tab-menu'));
            this.on('paste', e => {
                cardCopy.paste(this);
            });
        }
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            return self;
        }
    }
    const register$d = app => {
        TabContent.prototype.app = app;
        customElements.get('tab-content') || customElements['define']('tab-content', TabContent);
    };
    var TabContent$1 = {
        register: register$d
    };

    class TabPanel extends HTMLElement {
        get tid() {
            return this.getAttribute('tid');
        }
        set tid(value) {
            this.setAttribute('tid', value);
        }
        connectedCallback() {
        }
        constructor(self) {
            self = super(self);
            return self;
        }
    }
    const register$c = app => {
        TabPanel.prototype.app = app;
        customElements.get('tab-panel') || customElements['define']('tab-panel', TabPanel);
    };
    var TabPanel$1 = {
        register: register$c
    };

    class TabMenu extends HTMLElement {
        connectedCallback() {
            const menu = src.ul({
                content: [
                    src.li({
                        content: 'Copy card style',
                        events: {
                            pointerup: e => {
                                if (e.button !== 0) {
                                    return true;
                                }
                                this.app.styleStorage = this.owner.styles;
                                properties.set('styleStorage', true);
                            }
                        },
                    }),
                    src.li({
                        classNames: ['storage-dependent'],
                        content: 'Paste card style',
                        events: {
                            pointerup: e => {
                                if (e.button !== 0) {
                                    return true;
                                }
                                this.app.trigger('tabStyleChange', {
                                    tab: this.owner,
                                    styles: this.app.styleStorage
                                });
                            }
                        },
                    }),
                    src.li({
                        content: 'Reset card style',
                        events: {
                            pointerup: e => {
                                if (e.button !== 0) {
                                    return true;
                                }
                                this.app.trigger('styleReset', {
                                    tab: this.owner
                                });
                            }
                        },
                    }),
                    src.li({
                        classNames: ['context-separator','storage-dependent'],
                        content: 'Paste card',
                        events: {
                            pointerup: e => {
                                if (e.button !== 0) {
                                    return true;
                                }
                                this.app.trigger('cardPaste', {
                                    tab: this.owner,
                                    styles: this.app.cardCopy
                                });                        }
                        },
                    }),
                    src.li({
                        classNames: ['context-separator'],
                        content: 'Rename tab',
                        events: {
                            pointerup: e => {
                                if (e.button !== 0) {
                                    return true;
                                }
                                this.owner.makeEditable();
                            }
                        },
                    }),
                    src.li({
                        content: 'Close tab',
                        events: {
                            pointerup: e => {
                                if (e.button !== 0) {
                                    return true;
                                }
                                tabManager.handleRemoval(this.owner, 'soft');
                            }
                        },
                    }),
                    src.li({
                        classNames: ['context-separator'],
                        content: 'Close empty tabs',
                        events: {
                            pointerup: e => {
                                if (e.button !== 0) {
                                    return true;
                                }
                                tabManager.handleRemoval(this.owner, 'empty');
                            }
                        },
                    }),
                    src.li({
                        classNames: ['context-danger'],
                        content: 'Close others permanently',
                        events: {
                            pointerup: e => {
                                if (e.button !== 0) {
                                    return true;
                                }
                                tabManager.handleRemoval(this.owner, 'others');
                            }
                        },
                    }),
                    src.li({
                        classNames: ['context-danger'],
                        content: 'Close all permanently',
                        events: {
                            pointerup: e => {
                                if (e.button !== 0) {
                                    return true;
                                }
                                tabManager.handleRemoval(this.owner, 'all');
                            }
                        },
                    })
                ]
            });
            this.append(menu);
        }
        constructor(self) {
            self = super(self);
            return self;
        }
    }
    const register$b = app => {
        TabMenu.prototype.app = app;
        customElements.get('tab-menu') || customElements['define']('tab-menu', TabMenu);
    };
    var TabMenu$1 = {
        register: register$b
    };

    class StyleEditor extends HTMLElement {
        connectedCallback() {
            this.app.on('singleStyleChange', e => {
                const activeTab = tabManager.getTab('active');
                const tab = e.detail.tab || activeTab;
                if (tab.isSameNode(activeTab)) {
                    this.style.setProperty(e.detail.name, e.detail.value);
                }
            });
        }
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            return self;
        }
    }
    const register$a = app => {
        StyleEditor.prototype.app = app;
        customElements.get('style-editor') || customElements['define']('style-editor', StyleEditor);
    };
    var StyleEditor$1 = {
        register: register$a
    };

    var fonts = [
    	{
    		label: "Almendra",
    		id: "almendra",
    		family: "'Almendra', serif"
    	},
    	{
    		label: "Aubrey",
    		id: "aubrey",
    		family: "'Aubrey', cursive"
    	},
    	{
    		label: "Caudex",
    		id: "caudex",
    		family: "'Caudex', serif"
    	},
    	{
    		label: "Della Respira",
    		id: "della-respira",
    		family: "'Della Respira', serif"
    	},
    	{
    		label: "Federant",
    		id: "federant",
    		family: "'Federant', cursive"
    	},
    	{
    		label: "Federo",
    		id: "federo",
    		family: "'Federo', sans-serif"
    	},
    	{
    		label: "Fondamento",
    		id: "fondamento",
    		family: "'Fondamento', cursive"
    	},
    	{
    		label: "Grenze Gotisch",
    		id: "grenze-gotisch",
    		family: "'Grenze Gotisch', cursive"
    	},
    	{
    		label: "Grenze",
    		id: "grenze",
    		family: "'Grenze', serif"
    	},
    	{
    		label: "IM Fell English",
    		id: "i-m-fell-english",
    		family: "'IM Fell English', serif"
    	},
    	{
    		label: "Luxurious Roman",
    		id: "luxurious-roman",
    		family: "'Luxurious Roman', cursive"
    	},
    	{
    		label: "Macondo",
    		id: "macondo",
    		family: "'Macondo', cursive"
    	},
    	{
    		label: "Medieval Sharp",
    		id: "medieval-sharp",
    		family: "'MedievalSharp', cursive"
    	},
    	{
    		label: "Metamorphous",
    		id: "metamorphous",
    		family: "'Metamorphous', cursive"
    	},
    	{
    		label: "Modern Antiqua",
    		id: "modern-antiqua",
    		family: "'Modern Antiqua', cursive"
    	},
    	{
    		label: "Nova Cut",
    		id: "nova-cut",
    		family: "'Nova Cut', cursive"
    	},
    	{
    		label: "Uncial Antiqua",
    		id: "uncial-antiqua",
    		family: "'Uncial Antiqua', cursive"
    	},
    	{
    		label: "Unifraktur Maguntia",
    		id: "unifraktur-maguntia",
    		family: "'UnifrakturMaguntia', cursive"
    	}
    ];

    var cssProps$1 = {
    	":root": {
    	"--c-color": "hsl(0, 0%, 0%)",
    	"--c-card-font": "\"Della Respira\", serif",
    	"--c-bg-h": "45",
    	"--c-bg-s": "93%",
    	"--c-bg-l": "89%",
    	"--c-bg-pattern": "url(../media/patterns/backgrounds/light-rocky-wall.png)",
    	"--c-border-h": "201",
    	"--c-border-s": "39%",
    	"--c-border-l": "24%",
    	"--c-border-pattern": "url(../media/patterns/borders/crosshatch-2.png)",
    	"--c-box-shadow-color": "hsl(0, 0%, 0%, 0.4)",
    	"--c-badge-font": "\"Della Respira\", serif",
    	"--c-badge-h": "168",
    	"--c-badge-s": "22%",
    	"--c-badge-l": "63%",
    	"--c-badge-text-shadow-color": "hsl(0, 100%, 100%, 0.3)",
    	"--c-button-bg": "hsl(15, 50%, 15%, 0.9)",
    	"--c-button-color": "var(--text-color)",
    	"--c-card-font-size": "1.1rem",
    	"--c-badge-font-size": "1.5rem"
    }
    };

    let props = {};
    for (let values of Object.values(cssProps$1)) {
        props = {
            ...props,
            ...values
        };
    }
    const get = key => {
        return props[key];
    };
    var cssProps = {
        get
    };

    class FontSelector extends HTMLElement {
        get name() {
            return this.getAttribute('name');
        }
        set name(value) {
            this.setAttribute('name', value);
        }
        connectedCallback() {
            if (!this.name) {
                throw Error(`Missing attribute "name" on <font-selector> element`);
            }
            this.styleArea = 'fonts';
            this.currentFont = cssProps.get(this.name);
            const selector = src.select({
                style: {
                    fontFamily: `var(${this.name})`
                },
                content: fonts.map(entry => {
                    return src.option({
                        attributes: {
                            value: entry.family,
                            selected: entry.family === this.currentFont
                        },
                        style: {
                            fontFamily: entry.family
                        },
                        content: entry.label
                    })
                }),
                data: {
                    prop: this.name
                },
                events: {
                    change: e => {
                        this.selected = e.target.value;
                        this.app.trigger(`singleStyleChange`, {
                            name: this.name,
                            value: e.target.value,
                            area: this.styleArea
                        });
                    }
                }
            });
            this.append(selector);
            selector.dispatchEvent(new Event('change'));
            this.app.on('tabStyleChange', e => {
                const value = e.detail.styles[this.styleArea] && e.detail.styles[this.styleArea][this.name] ?
                    e.detail.styles[this.styleArea][this.name] :
                    cssProps.get(this.name);
                selector.selectedIndex = fonts.findIndex(e => e.family.replace(/['"]+/g) === value.replace(/['"]+/g));
                this.selected = value;
                this.app.trigger(`singleStyleChange`, {
                    name: this.name,
                    value,
                    area: this.styleArea,
                    tab: e.detail.tab
                });
            });
        }
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            return self;
        }
    }
    const register$9 = app => {
        FontSelector.prototype.app = app;
        customElements.get('font-selector') || customElements['define']('font-selector', FontSelector);
    };
    var FontSelector$1 = {
        register: register$9
    };

    class FontSize extends HTMLElement {
        get name() {
            return this.getAttribute('name');
        }
        set name(value) {
            this.setAttribute('name', value);
        }
        get max() {
            return this.getAttribute('max');
        }
        set max(value) {
            this.setAttribute('max', value);
        }
        get min() {
            return this.getAttribute('min');
        }
        set min(value) {
            this.setAttribute('min', value);
        }
        get value() {
            return this.getAttribute('value');
        }
        set value(value) {
            this.setAttribute('value', value);
        }
        connectedCallback() {
            if (!this.name) {
                throw Error(`Missing attribute "name" on <font-size> element`);
            }
            this.value = parseFloat(cssProps.get(this.name) || 1.4, 10);
            this.styleArea = 'fonts';
            const attributes = {
                value: this.value,
                type: 'range',
                step: (this.max - this.min) / 100
            };
            attributes.min = attributes.value * .7;
            attributes.max = attributes.value * 1.3;
            attributes.step = (attributes.max - attributes.min) / 100;
            const input = src.input({
                attributes,
                data: {
                    prop: this.name
                },
                events: {
                    input: e => {
                        this.value = e.target.value + 'rem';
                        this.app.trigger(`singleStyleChange`, {
                            name: this.name,
                            value: this.value,
                            area: this.styleArea
                        });
                    }
                }
            });
            this.append(input);
            input.dispatchEvent(new Event('input'));
            this.app.on('tabStyleChange', e => {
                this.value = e.detail.styles[this.styleArea] && e.detail.styles[this.styleArea][this.name] ?
                    e.detail.styles[this.styleArea][this.name] :
                    cssProps.get(this.name);
                input.value = parseFloat(this.value, 10);
                this.app.trigger(`singleStyleChange`, {
                    name: this.name,
                    value: this.value,
                    area: this.styleArea,
                    tab: e.detail.tab
                });
            });
        }
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            return self;
        }
    }
    const register$8 = app => {
        FontSize.prototype.app = app;
        customElements.get('font-size') || customElements['define']('font-size', FontSize);
    };
    var FontSize$1 = {
        register: register$8
    };

    var backgrounds = [
    	{
    		label: "Dark Ice Age",
    		id: "dark-ice-age",
    		name: "dark-ice-age.png"
    	},
    	{
    		label: "Dark Redox",
    		id: "dark-redox",
    		name: "dark-redox.png"
    	},
    	{
    		label: "Dark Rocky Wall",
    		id: "dark-rocky-wall",
    		name: "dark-rocky-wall.png"
    	},
    	{
    		label: "Dark Subtle Grunge",
    		id: "dark-subtle-grunge",
    		name: "dark-subtle-grunge.png"
    	},
    	{
    		label: "Light Paper",
    		id: "light-paper",
    		name: "light-paper.png"
    	},
    	{
    		label: "Light Rocky Wall",
    		id: "light-rocky-wall",
    		name: "light-rocky-wall.png"
    	}
    ];

    var borders = [
    	{
    		label: "Cloud",
    		id: "cloud",
    		name: "cloud.png"
    	},
    	{
    		label: "Crosshatch 1",
    		id: "crosshatch-1",
    		name: "crosshatch-1.png"
    	},
    	{
    		label: "Crosshatch 2",
    		id: "crosshatch-2",
    		name: "crosshatch-2.png"
    	},
    	{
    		label: "Etching Dirty",
    		id: "etching-dirty",
    		name: "etching-dirty.png"
    	},
    	{
    		label: "Spatter",
    		id: "spatter",
    		name: "spatter.png"
    	},
    	{
    		label: "Wood",
    		id: "wood",
    		name: "wood.png"
    	}
    ];

    const patternPool = {
        backgrounds,
        borders
    };
    class PatternSelector extends HTMLElement {
        get value() {
            return this.getAttribute('value');
        }
        set value(value) {
            this.setAttribute('value', value);
        }
        get name() {
            return this.getAttribute('name');
        }
        set name(value) {
            this.setAttribute('name', value);
        }
        get type() {
            return this.getAttribute('type');
        }
        set type(value) {
            this.setAttribute('type', value);
        }
        getUrl(img, target) {
            const path = target === 'html' ? 'media/patterns' : '../media/patterns';
            return `url(${path}/${this.type}/${img.split('/').pop()})`;
        }
        getValue() {
            for (let input of src.$$('input', this)) {
                if (input.checked) {
                    return input.value;
                }
            }
            return cssProps.get(this.name) || '';
        }
        connectedCallback() {
            if (!this.name) {
                throw Error(`Missing attribute "name" on <pattern-selector> element`);
            }
            if (!this.type) {
                throw Error(`Missing attribute "type" on <pattern-selector> element`);
            }
            this.value = this.getValue();
            this.styleArea = 'patterns';
            const patterns = patternPool[this.type];
            const inputs = [];
            const choices = patterns.map(entry => {
                let input = src.input({
                    attributes: {
                        type: 'radio',
                        name: `${this.type}-pattern`,
                        value: this.getUrl(entry.name, 'css'),
                        id: `${this.type}-${entry.id}`,
                        checked: this.getUrl(entry.name, 'css') === this.value
                    }
                });
                inputs.push(input);
                return src.li({
                    style: {
                        backgroundImage: this.getUrl(entry.name, 'html')
                    },
                    attributes: {
                        title: entry.label
                    },
                    content: [
                        input,
                        src.label({
                            attributes: {
                                for: `${this.type}-${entry.id}`
                            }
                        })
                    ]
                })
            });
            const selector = src.ul({
                content: choices,
                events: {
                    change: e => {
                        this.value = this.getValue();
                        this.app.trigger(`singleStyleChange`, {
                            name: this.name,
                            value: this.value,
                            area: this.styleArea
                        });
                    }
                }
            });
            this.append(selector);
            selector.dispatchEvent(new Event('change'));
            this.app.on('tabStyleChange', e => {
                this.value = e.detail.styles[this.styleArea] && e.detail.styles[this.styleArea][this.name] ?
                    e.detail.styles[this.styleArea][this.name] :
                    cssProps.get(this.name);
                inputs.find(e => e.value === this.value).checked = true;
                this.app.trigger(`singleStyleChange`, {
                    name: this.name,
                    value: this.value,
                    area: this.styleArea,
                    tab: e.detail.tab
                });
            });
        }
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            return self;
        }
    }
    const register$7 = app => {
        PatternSelector.prototype.app = app;
        customElements.get('pattern-selector') || customElements['define']('pattern-selector', PatternSelector);
    };
    var PatternSelector$1 = {
        register: register$7
    };

    const tracksToValueObj = tracks => {
        const obj = {};
        for (let [channel, track] of Object.entries(tracks)) {
            obj[channel] = track.value;
        }
        return obj;
    };
    const trackToChannelStr = track => {
        return (Math.round(track.value * 10000) / 10000) + track.unit;
    };
    const tracksToColorStr = (tracks, type) => {
        const c = [];
        Object.values(tracks).forEach(track => {
            c.push(trackToChannelStr(track));
        });
        return c.length === 4 ? `${type}(${c[0]} ${c[1]} ${c[2]} / ${c[3]})` : `${type}(${c[0]} ${c[1]} ${c[2]})`
    };
    var format = {
        tracksToValueObj,
        tracksToColorStr,
        trackToChannelStr
    };

    const hexToArray = value => {
        const rgb = (value.length < 6 ? value.split('') : value.match(/\w{1,2}/g))
            .map(e => e.length === 1 ? e.padEnd(2, e) : e)
            .map(e => parseInt(e, 16).toString());
        if (rgb.length === 4) {
            rgb[3] = (rgb[3] / 255).toString();
        }
        return rgb;
    };
    const getUnit = (channel, type) => {
        switch (channel) {
            case 'b':
                return type === 'hwb' ? '%' : '';
            case 'l':
            case 's':
            case 'w':
                return '%';
        }
        return '';
    };
    const getValue = (value, channel, type) => {
        let numPart = parseFloat(value);
        let match = value.match(/[a-z%]+/);
        let textPart = match ? match[0] : '';
        switch (channel) {
            case 's':
            case 'l':
            case 'w':
            case 'c':
            case 'a':
                return numPart;
            case 'r':
            case 'g':
                return textPart === '%' ? numPart * 255 / 100 : numPart;
            case 'α':
                if (textPart === '%') {
                    return numPart / 100
                }
                return numPart;
            case 'h':
                switch (textPart) {
                    case 'grad':
                        return numPart * 360 / 400;
                    case 'turn':
                        return numPart * 360;
                    case 'rad':
                        return numPart * (180 / Math.PI);
                    default:
                        return numPart;
                }
                case 'b':
                    switch (type) {
                        case 'rgb':
                            return textPart === '%' ? numPart * 255 / 100 : numPart;
                        case 'hwb':
                        case 'lab':
                            return numPart;
                    }
        }
        return 100;
    };
    const getMax = (channel, type) => {
        switch (channel) {
            case 'c':
                return 230;
            case 'h':
                return 360;
            case 'r':
            case 'g':
                return 255;
            case 'b':
                if (type === 'lab') {
                    return 160;
                }
                if (type === 'rgb') {
                    return 255;
                }
                return 100;
            case 'a':
                return 160;
            case 'α':
                return 1;
        }
        return 100;
    };
    const getMin = (channel, type) => {
        if (type === 'lab' && ['a', 'b'].includes(channel)) {
            return -160;
        }
        return 0;
    };
    const buildTrack = (value, channel, type) => {
        const track = {
            value: getValue(value, channel, type),
            unit: getUnit(channel, type),
            min: getMin(channel, type),
            max: getMax(channel, type)
        };
        track.step = (track.max - track.min) / 100;
        return track;
    };
    const buildConfig = value => {
        let config = {
            tracks: {}
        };
        let valueArr;
        let regEx = /^(?<type>hex|#|rgba|hsla|rgb|hsl|hwb|lab|lch)?\(?(?<value>[^\)]+)/g;
        let matches = regEx.exec(value.trim());
        if (!matches || !matches.groups) {
            console.error(`Invalid value "${value}"`);
            return false;
        }
        value = matches.groups.value;
        if (['hex', '#'].includes(matches.groups.type)) {
            config.type = 'rgb';
            valueArr = hexToArray(value);
        } else {
            config.type = matches.groups.type.substring(0, 3);
            valueArr = value.replace(/[,\/]+/g, ' ').split(/\s+/).map(v => v.trim());
        }
        const channels = config.type.split('').concat(['α']);
        valueArr.forEach((value, i) => {
            config.tracks[channels[i]] = buildTrack(value, channels[i], config.type);
        });
        config.original = format.tracksToColorStr(config.tracks, config.type);
        return config;
    };

    const update = (type, tracks) => {
        for (let [channel, track] of Object.entries(tracks)) {
            let original = track.value;
            let steps = ['to right'];
            let range = track.max - track.min;
            let increment = range / 10;
            for (let i = track.min; i < track.max; i += increment) {
                tracks[channel].value = i;
                steps.push(format.tracksToColorStr(tracks, type));
            }
            tracks[channel].value = original;
            track.element.style.background = `linear-gradient(${steps.join(',')})`;
        }
    };
    var background = {
        update
    };

    class ColorSelector extends HTMLElement {
        get value() {
            return this.getAttribute('value');
        }
        set value(v) {
            this.setAttribute('value', v);
        }
        get name() {
            return this.getAttribute('name');
        }
        set name(v) {
            this.setAttribute('name', v);
        }
        get disabled() {
            return this.getAttribute('disabled');
        }
        set disabled(state) {
            if (state) {
                this.setAttribute('disabled', '');
            } else {
                this.removeAttribute('disabled');
            }
        }
        getInitialColor() {
            const pattern = this.name.replace('-color', '-');
            const channels = [];
            ['h', 's', 'l'].forEach(channel => {
                channels.push(cssProps.get(pattern + channel));
            });
            return `hsl(${channels.join(' ')})`;
        }
        fireEvent(type) {
            return this.dispatchEvent(new CustomEvent(type, {
                bubbles: true,
                cancelable: true,
                detail: {
                    value: this.value,
                    channels: format.tracksToValueObj(this.tracks)
                }
            }))
        }
        connectedCallback() {
            if (!this.value) {
                this.value = this.getInitialColor();
            }
            const config = buildConfig(this.value);
            this.tracks = config.tracks;
            this.value = config.original;
            this.styleArea = 'colors';
            const valueInput = document.createElement('input');
            valueInput.type = 'hidden';
            valueInput.value = this.value;
            if (this.name) {
                valueInput.name = this.name;
            }
            this.append(valueInput);
            const ranges = [];
            for (let [channel, track] of Object.entries(this.tracks)) {
                const label = document.createElement('label');
                const lSpan = document.createElement('span');
                const iSpan = document.createElement('span');
                label.append(lSpan, iSpan);
                lSpan.textContent = this.dataset[channel + 'Label'] || (channel !== 'α' ? channel.toUpperCase() : channel);
                const input = document.createElement('input');
                input.dataset.channel = channel;
                input.dataset.unit = track.unit;
                input.type = 'range';
                input.min = track.min;
                input.max = track.max;
                input.step = track.step;
                input.value = track.value;
                input.name = `${this.name.replace('color', channel)}`;
                this.tracks[channel].element = input;
                input.addEventListener('input', e => {
                    e.stopPropagation();
                    this.tracks[e.target.dataset.channel].value = e.target.value;
                    this.value = format.tracksToColorStr(this.tracks, config.type);
                    valueInput.value = this.value;
                    background.update(config.type, this.tracks);
                    const formatted = format.trackToChannelStr(this.tracks[e.target.dataset.channel]);
                    this.app.trigger(`singleStyleChange`, {
                        name: e.target.name,
                        value: formatted,
                        area: this.styleArea
                    });
                });
                input.addEventListener('change', e => {
                    e.stopPropagation();
                    this.fireEvent(e.type);
                });
                iSpan.append(input);
                ranges.push(input);
                this.append(label);
            }
            ranges.forEach(input => {
                input.dispatchEvent(new Event('input'));
            });
            this.app.on('tabStyleChange', e => {
                ranges.forEach(input => {
                    const formatted = e.detail.styles[this.styleArea] && e.detail.styles[this.styleArea][input.name] ?
                        e.detail.styles[this.styleArea][input.name] :
                        cssProps.get(input.name);
                    input.value = parseFloat(formatted, 10);
                    this.app.trigger(`singleStyleChange`, {
                        name: input.name,
                        value: formatted,
                        area: this.styleArea,
                        tab: e.detail.tab
                    });
                });
            });
        }
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            return self;
        }
    }
    const register$6 = app => {
        ColorSelector.prototype.app = app;
        customElements.get('color-selector') || customElements['define']('color-selector', ColorSelector);
    };
    var ColorSelector$1 = {
        register: register$6
    };

    let toast;
    const initiate = (element, label) => {
        if (!toast) {
            toast = src.div({
                data: {
                    undoDialogs: true
                }
            });
            document.body.append(toast);
        }
        properties.set('softDeleted', true, element);
        const dialog = document.createElement('undo-dialog');
        dialog.element = element;
        if (label) {
            dialog.label = label;
        }
        toast.append(dialog);
        return new Promise(resolve => {
            dialog.on('restore', e => {
                properties.unset('softDeleted', element);
                resolve({
                    action: 'restore',
                    element: e.detail.element
                });
            });
            dialog.on('remove', e => {
                resolve({
                    action: 'remove',
                    element: e.detail.element
                });
            });
        })
    };
    const cancel = () => {
        if (toast) {
            toast = src.empty(toast);
        }
    };
    var softDelete = {
        initiate,
        cancel
    };

    let app;
    const origin = 'user';
    const getLabels = () => {
        const characterLabels = {};
        for (let [key, value] of Object.entries(labels$1)) {
            if (key.startsWith('__')) {
                continue;
            }
            characterLabels[key] = value.short;
        }
        return characterLabels;
    };
    const add = character => {
        let cid;
        let tid;
        let tab;
        if (character.meta && character.meta.tid) {
            cid = characterStorage.parseCid(character);
            tab = tabManager.getTab(character.meta.tid);
            tid = tabStorage.parseTid(tab);
        } else {
            cid = characterStorage.nextIncrement(origin);
            character = deepClone(character);
            tab = tabManager.getTab('active');
            tid = tabStorage.parseTid(tab);
        }
        character.meta = {
            ...character.meta,
            ...{
                visibility,
                tid,
                cid,
                origin
            }
        };
        if (!character.labels) {
            character.labels = getLabels();
        }
        characterStorage.set(origin, cid, character);
        const card = document.createElement('card-base');
        card.cid = cid;
        card.tid = tid;
        card.character = character;
        tab.panel.append(card);
    };
    const bulkDelete = (type, tidData) => {
        src.$$('card-base', tabManager.getTab(tidData)).forEach(card => {
            characterStorage.remove(type, card);
            handleRemoval(card, 'remove');
        });
    };
    const handleRemoval = (element, action) => {
        switch (action) {
            case 'soft':
                softDelete.initiate(element, characterStorage.get(origin, element).props.name)
                    .then(data => {
                        handleRemoval(element, data.action);
                    });
                characterStorage.update(origin, element, 'softDeleted', true);
                break;
            case 'restore':
                characterStorage.update(origin, element, 'softDeleted', null);
                break;
            case 'remove':
                characterStorage.remove(origin, element);
                element.remove();
                break;
            case 'all':
                bulkDelete(origin, element);
                break;
        }
    };
    const init = _app => {
        app = _app;
        app.on('tabDelete', e => {
            handleRemoval(e.detail.tab, 'all');
        });
        app.on('characterSelection', e => {
            add(e.detail);
        });
    };
    var cardManager = {
        init,
        handleRemoval
    };

    class CardBase extends HTMLElement {
        get cid() {
            return this.getAttribute('cid');
        }
        set cid(value) {
            this.setAttribute('cid', value);
        }
        get tid() {
            return this.getAttribute('tid');
        }
        set tid(value) {
            this.setAttribute('tid', value);
        }
        get tabindex() {
            return this.getAttribute('tabindex');
        }
        set tabindex(value) {
            this.setAttribute('tabindex', value);
        }
        connectedCallback() {
            ['recto', 'verso', 'form', 'toolbar'].forEach(view => {
                this[view] = document.createElement(`card-${view}`);
                this[view].card = this;
            });
            const cardInner = src.article({
                content: [
                    src.div({
                        classNames: ['card-view'],
                        content: [
                            this.recto,
                            this.verso
                        ]
                    }),
                    this.form,
                    this.toolbar
                ]
            });
            this.append(cardInner);
            this.tabIndex = 0;
            this.on('contentChange', function (e) {
                const section = e.detail.field === 'text' ? 'props' : 'labels';
                this.character[section][e.detail.key] = e.detail.value;
                characterStorage.set('user', this.character.meta.cid, this.character);
            });
            this.on('visibilityChange', function (e) {
                this.character.meta.visibility[e.detail.key][e.detail.field] = e.detail.value;
                characterStorage.set('user', this.character.meta.cid, this.character);
                this.trigger('afterVisibilityChange');
            });
            this.on('orderChange', function (e) {
                let props = {};
                e.detail.order.forEach(key => {
                    props[key] = this.character.props[key];
                });
                this.character.props = props;
                characterStorage.set('user', this.character.meta.cid, this.character);
                this.trigger('afterOrderChange');
            });
            this.on('characterCut', function (e) {
                cardCopy.cut(this);
            });
            this.on('characterCopy', function (e) {
                cardCopy.copy(this);
            });
            this.on('characterRemove', function (e) {
                cardManager.handleRemoval(this, 'soft');
            });
            this.on('characterEdit', function (e) {
                properties.set('cardState', 'edit');
                this.classList.add('editable');
            });
            this.on('characterDone', function (e) {
                properties.unset('cardState');
                this.classList.remove('editable');
            });
            this.on('keyup', e => {
                if (e.ctrlKey && ['x', 'c'].includes(e.key)) {
                    cardCopy[e.key === 'x' ? 'cut' : 'copy'](this);
                }
                if (e.key === 'Escape') {
                    cardCopy.clear(this);
                }
            });
        }
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            return self;
        }
    }
    const register$5 = app => {
        CardBase.prototype.app = app;
        customElements.get('card-base') || customElements['define']('card-base', CardBase);
    };
    var CardBase$1 = {
        register: register$5
    };

    let dragSrcEl = null;
    function handleDragStart(e) {
        e.stopPropagation();
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.outerHTML);
        dragSrcEl.classList.add('dragElem');
    }
    function handleDragOver(e) {
        e.preventDefault();
        this.classList.add('dragover');
        e.dataTransfer.dropEffect = 'move';
        return false;
    }
    function handleDragEnter(e) {
    }
    function handleDragLeave(e) {
        this.classList.remove('dragover');
    }
    function handleDrop(e) {
        e.stopPropagation();
        if (!dragSrcEl.isSameNode(this)) {
            this.after(dragSrcEl);
        }
        this.classList.remove('dragover');
        dragSrcEl.classList.remove('dragElem');
        return false;
    }
    function handleDragEnd(e) {
        this.classList.remove('dragover');
    }
    const handles = {
        dragstart: handleDragStart,
        dragenter: handleDragEnter,
        dragover: handleDragOver,
        dragleave: handleDragLeave,
        drop: handleDrop,
        dragend: handleDragEnd,
    };
    function toggle(elem, state) {
        const action = state ? 'addEventListener' : 'removeEventListener';
        elem.draggable = state;
        for (let [evt, fn] of Object.entries(handles)) {
            elem[action](evt, fn, false);
        }
    }
    function enable(elem) {
        return toggle(elem, true);
    }
    function disable(elem) {
        return toggle(elem, false);
    }
    var draggable = {
        toggle,
        enable,
        disable
    };

    class CardForm extends HTMLElement {
        isVisible(key, type) {
            if (type === 'text') {
                return this.card.character.meta.visibility[key][type] && !!this.card.character.props[key];
            }
            return this.card.character.meta.visibility[key][type];
        }
        icon(type) {
            let title;
            let icons = [`media/icons.svg#icon-show-${type}`, `media/icons.svg#icon-hide-${type}`];
            switch (type) {
                case 'card':
                    title = 'Display this item on the card';
                    break;
                case 'label':
                    title = 'Display the item label';
                    break;
                case 'drag':
                    title = 'Drag item to different position';
                    icons = [`media/icons.svg#icon-drag-grip`];
                    break;
            }
            icons = icons.map(icon => src.use({
                isSvg: true,
                attributes: {
                    href: icon
                }
            }));
            return src.svg({
                isSvg: true,
                content: [
                    src.title({
                        isSvg: true,
                        content: title
                    })
                ].concat(icons)
            })
        }
        buildRow(key) {
            const content = this.buildCells(key);
            const row = src.tr({
                attributes: {
                    draggable: true
                },
                data: {
                    key,
                    card: this.isVisible(key, 'card'),
                    label: this.isVisible(key, 'label')
                },
                content
            });
            draggable.enable(row);
            row.addEventListener('dragend', e => {
                this.card.trigger('orderChange', {
                    order: (e => {
                        return Array.from(src.$$('[data-key]', this.tbody))
                            .map(entry => entry.dataset.key)
                    })()
                });
                });
            return row;
        }
        buildCells(key) {
            function handleDraggability(e, action) {
                const row = e.target.closest('[draggable]');
                if (!row) {
                    return true;
                }
                draggable[action](row);
            }
            const entries = {
                label: src.th({
                    data: {
                        type: 'label'
                    },
                    attributes: {
                        contentEditable: true
                    },
                    content: this.card.character.labels[key],
                    events: {
                        focus: e => handleDraggability(e, 'disable'),
                        blur: e => handleDraggability(e, 'enable')
                    }
                }),
                element: src.td({
                    data: {
                        type: 'text'
                    },
                    attributes: {
                        contentEditable: true
                    },
                    content: this.card.character.props[key],
                    events: {
                        focus: e => handleDraggability(e, 'disable'),
                        blur: e => handleDraggability(e, 'enable')
                    }
                }),
                labelIcon: src.td({
                    data: {
                        type: 'label'
                    },
                    classNames: ['icon', 'toggle'],
                    content: this.icon('label')
                }),
                cardIcon: src.td({
                    data: {
                        type: 'card'
                    },
                    classNames: ['icon', 'toggle'],
                    content: this.icon('card')
                }),
                dragIcon: src.td({
                    classNames: ['icon', 'handle'],
                    content: this.icon('drag')
                })
            };
            return Object.values(entries);
        }
        populateTbody() {
            for (let key of Object.keys(this.card.character.props).filter(prop => !['img', 'name'].includes(prop))) {
                this.tbody.append(this.buildRow(key));
            }
        }
        connectedCallback() {
            this.card = this.closest('card-base');
            this.tbody = src.tbody();
            const frame = src.table({
                content: [
                    src.caption({
                        attributes: {
                            contentEditable: true
                        },
                        data: {
                            key: 'name',
                            type: 'text'
                        },
                        content: this.card.character.props.name
                    }),
                    src.thead({
                        content: [
                            src.tr({
                                data: {
                                    key: 'img',
                                    type: 'text'
                                },
                                content: [
                                    src.th({
                                        content: labels$1.img.long
                                    }),
                                    src.td({
                                        attributes: {
                                            colSpan: 4,
                                            contentEditable: true
                                        },
                                        content: this.card.character.props.img
                                    })
                                ]
                            })
                        ]
                    }),
                    this.tbody
                ],
                events: {
                    input: e => {
                        if (!e.target.contentEditable) {
                            return true;
                        }
                        this.card.trigger('contentChange', {
                            field: e.target.dataset.type,
                            key: e.target.closest('[data-key]').dataset.key,
                            value: e.target.textContent
                        });
                    },
                    pointerup: e => {
                        const trigger = e.target.closest('.toggle');
                        if (e.button !== 0 || !trigger) {
                            return true;
                        }
                        const row = trigger.closest('[data-key]');
                        const key = row.dataset.key;
                        const field = trigger.dataset.type;
                        properties.toggle(field, row);
                        const value = properties.get(field, row);
                        this.card.trigger('visibilityChange', {
                            field,
                            key,
                            value
                        });
                    }
                }
            });
            this.populateTbody();
            this.append(frame);
        }
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            return self;
        }
    }
    const register$4 = app => {
        CardForm.prototype.app = app;
        customElements.get('card-form') || customElements['define']('card-form', CardForm);
    };
    var CardForm$1 = {
        register: register$4
    };

    class CardRecto extends HTMLElement {
        connectedCallback() {
            const frame = src.figure({
                classNames: ['frame']
            });
            const entries = {
                img: src.img({
                    attributes: {
                        src: this.card.character.props.img
                    }
                }),
                name: src.figcaption({
                    classNames: ['badge'],
                    content: this.card.character.props.name
                })
            };
            for (let element of Object.values(entries)) {
                frame.append(element);
            }
            this.card.on('contentChange', e => {
                ({
                    p: 'recto',
                    k: e.detail.key,
                    t: e.detail.type,
                    v: e.detail.value
                });
                const prop = e.detail.key === 'img' ? 'src' : 'textContent';
                if(entries[e.detail.key]) {
                    entries[e.detail.key][prop] = e.detail.value;
                }
            });
            this.append(frame);
        }
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            return self;
        }
    }
    const register$3 = app => {
        CardRecto.prototype.app = app;
        customElements.get('card-recto') || customElements['define']('card-recto', CardRecto);
    };
    var CardRecto$1 = {
        register: register$3
    };

    class CardToolbar extends HTMLElement {
        connectedCallback() {
            const doneBtn = src.button({
                attributes: {
                    type: 'button',
                    name: 'done'
                },
                content: [
                    'Done',
                    src.svg({
                        isSvg: true,
                        content: src.use({
                            isSvg: true,
                            attributes: {
                                href: 'media/icons.svg#icon-quill'
                            }
                        })
                    })
                ],
                events: {
                    pointerup: e => {
                        this.card.trigger('characterDone');
                    }
                }
            });
            const cutBtn = src.button({
                attributes: {
                    type: 'button'
                },
                content: [
                    'Cut',
                    src.svg({
                        isSvg: true,
                        content: src.use({
                            isSvg: true,
                            attributes: {
                                href: 'media/icons.svg#icon-scissors'
                            }
                        })
                    })
                ],
                events: {
                    pointerup: e => {
                        this.card.trigger('characterCut');
                    }
                }
            });
            const copyBtn = src.button({
                attributes: {
                    type: 'button'
                },
                content: [
                    'Copy',
                    src.svg({
                        isSvg: true,
                        content: src.use({
                            isSvg: true,
                            attributes: {
                                href: 'media/icons.svg#icon-copy'
                            }
                        })
                    })
                ],
                events: {
                    pointerup: e => {
                        this.card.trigger('characterCopy');
                    }
                }
            });
            const deleteBtn = src.button({
                attributes: {
                    type: 'button'
                },
                content: [
                    'Delete',
                    src.svg({
                        isSvg: true,
                        content: src.use({
                            isSvg: true,
                            attributes: {
                                href: 'media/icons.svg#icon-axe'
                            }
                        })
                    })
                ],
                events: {
                    pointerup: e => {
                        this.card.trigger('characterRemove');
                    }
                }
            });
            const editBtn = src.button({
                attributes: {
                    type: 'button'
                },
                content: [
                    'Edit',
                    src.svg({
                        isSvg: true,
                        content: src.use({
                            isSvg: true,
                            attributes: {
                                href: 'media/icons.svg#icon-quill'
                            }
                        })
                    })
                ],
                events: {
                    pointerup: e => {
                        this.card.trigger('characterEdit');
                    }
                }
            });
            this.append(doneBtn, deleteBtn, cutBtn, copyBtn, editBtn);
        }
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            return self;
        }
    }
    const register$2 = app => {
        CardToolbar.prototype.app = app;
        customElements.get('card-toolbar') || customElements['define']('card-toolbar', CardToolbar);
    };
    var CardToolbar$1 = {
        register: register$2
    };

    class CardVerso extends HTMLElement {
        isVisible(key, type) {
            return this.card.character.meta.visibility[key][type] && !!this.card.character.props[key];
        }
        populateTbody(tbody) {
            tbody = src.empty(tbody);
            for (let key of Object.keys(this.card.character.props).filter(prop => !['img', 'name'].includes(prop))) {
                tbody.append(this.buildRow(key));
            }
        }
        buildRow(key) {
            const entries = {
                label: src.th({
                    content: this.card.character.labels[key]
                }),
                text: src.td({
                    content: this.card.character.props[key]
                })
            };
            this.rows[key] = entries;
            const row = src.tr({
                data: {
                    key,
                    card: this.isVisible(key, 'card'),
                    label: this.isVisible(key, 'label')
                },
                content: Object.values(entries)
            });
            return row;
        }
        connectedCallback() {
            const entries = {
                name: src.caption({
                    classNames: ['badge'],
                    content: this.card.character.props.name
                }),
                cr: src.div({
                    classNames: ['badge', 'cr'],
                    content: this.card.character.props.cr
                })
            };
            const tbody = src.tbody();
            const frame = src.table({
                classNames: ['frame'],
                content: [
                    entries.name,
                    tbody
                ]
            });
            this.rows = {};
            this.populateTbody(tbody);
            this.append(frame, entries.cr);
            this.card.on('contentChange', e => {
                if (Object.keys(entries).includes(e.detail.key) && e.detail.field === 'text') {
                    entries[e.detail.key].textContent = e.detail.value;
                }
                if (Object.keys(this.rows).includes(e.detail.key)) {
                    this.rows[e.detail.key][e.detail.field].textContent = e.detail.value;
                }
            });
            this.card.on('afterOrderChange', e => {
                this.populateTbody(tbody);
            });
            this.card.on('visibilityChange', e => {
                if (Object.keys(this.rows).includes(e.detail.key)) {
                    this.rows[e.detail.key].text.parentElement.dataset[e.detail.field] = e.detail.value;
                }
            });
        }
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            return self;
        }
    }
    const register$1 = app => {
        CardVerso.prototype.app = app;
        customElements.get('card-verso') || customElements['define']('card-verso', CardVerso);
    };
    var CardVerso$1 = {
        register: register$1
    };

    class UndoDialog extends HTMLElement {
        connectedCallback() {
            const closeBtn = src.span({
                content: '×',
                classNames: ['closer', 'btn'],
                events: {
                    pointerup: e => {
                        if (e.button !== 0) {
                            return true;
                        }
                        this.trigger('remove', {
                            element: this.element
                        });
                        this.remove();
                    }
                }
            });
            const undoBtn = src.button({
                attributes: {
                    type: 'text'
                },
                events: {
                    pointerdown: e => {
                        if (e.button !== 0) {
                            return true;
                        }
                        this.trigger('restore', {
                            element: this.element
                        });
                        this.remove();
                    }
                },
                content: 'Undo'
            });
            const undoTitle = src.h2({
                content: `${(this.label || 'An element')} has been deleted`
            });
            const dialog = src.aside({
                content: [
                    closeBtn,
                    undoTitle,
                    undoBtn
                ]
            });
            this.append(dialog);
            setTimeout(() => {
                this.trigger('remove', {
                    element: this.element
                });
                this.remove();
            }, 10000);
        }
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            return self;
        }
    }
    const register = () => {
        customElements.get('undo-dialog') || customElements['define']('undo-dialog', UndoDialog);
    };
    var UndoDialog$1 = {
        register
    };

    class App extends HTMLElement {
        connectedCallback() {
            characterStorage.init()
                .then(() => {
                    [
                        TabContent$1,
                        TabHandle$1,
                        TabNavi$1,
                        TabPanel$1,
                        TabMenu$1
                    ].forEach(component => {
                        component.register(this);
                    });
                    tabManager.init(this);
                    cardManager.init(this);
                    [
                        CharacterLibrary$1,
                        LibraryOrganizer$1,
                        StyleEditor$1,
                        FontSelector$1,
                        FontSize$1,
                        PatternSelector$1,
                        ColorSelector$1,
                        CardBase$1,
                        CardForm$1,
                        CardRecto$1,
                        CardToolbar$1,
                        CardVerso$1,
                        UndoDialog$1
                    ].forEach(component => {
                        component.register(this);
                    });
                });
        }
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            self.styleStorage = false;
            return self;
        }
    }
    customElements.define('app-container', App, {
        extends: 'main'
    });

})();
