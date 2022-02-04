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
    	long: "Thy Creatures",
    	group: "Thy Creatures"
    };
    var img$1 = {
    	long: "Image",
    	short: "Img",
    	group: "Image"
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
    var cssProps$1 = {
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
    var fields$1 = {
    	src: "src/data/raw/field-config.yml"
    };
    var labels = {
    	target: "src/data/labels.json"
    };
    var visibility$2 = {
    	target: "src/data/visibility.json"
    };
    var js = {
    	entryPoint: "src/js/app/main.js",
    	"public": "public/js/main.js"
    };
    var storageKeys = {
    	user: "gb-user-prefs",
    	cards: "gb-cards"
    };
    var config = {
    	css: css,
    	cssProps: cssProps$1,
    	fonts: fonts$1,
    	backgrounds: backgrounds$1,
    	borders: borders$1,
    	characters: characters,
    	fields: fields$1,
    	labels: labels,
    	visibility: visibility$2,
    	js: js,
    	storageKeys: storageKeys
    };

    let settings = {
        ...config
    };
    const get$3 = key => {
        let current = Object.create(settings);
        for (let token of key.split('.')) {
            if (typeof current[token] === 'undefined') {
                return undefined;
            }
            current = current[token];
        }
        return current;
    };
    const set$3 = (key, value) => {
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
        get: get$3,
        set: set$3
    };

    const lsKey$1 = settings$1.get('storageKeys.cards');
    const data = {
        system: new Map(),
        user: new Map()
    };
    const storage = {
        read: () => {
            return JSON.parse(localStorage.getItem(lsKey$1) || '[]')
        },
        update: () => {
            return localStorage.setItem(lsKey$1, JSON.stringify(valueArray('user') || []))
        }
    };
    const set$2 = (type, cid, value) => {
        const retVal = data[type].set(cid, value);
        if (type === 'user') {
            storage.update();
        }
        return retVal;
    };
    const get$2 = (type, cid) => {
        return data[type].get(cid);
    };
    const remove$1 = (type, cid) => {
        const retVal = data[type].delete(cid);
        if (type === 'user') {
            storage.update();
        }
        return retVal;
    };
    const has = (type, cid) => {
        return data[type].has(cid);
    };
    const keys = type => {
        return data[type].keys();
    };
    const keyArray = type => {
        return [...data[type].keys()];
    };
    const values = type => {
        return data[type].values();
    };
    const valueArray = type => {
        return [...data[type].values()];
    };
    const entries = type => {
        return data[type].entries();
    };
    const nextIncrement = type => {
        return Math.max(...[0].concat(keyArray(type))) + 1;
    };
    const init$2 = () => {
        storage.read().forEach((entry, index) => {
            set$2('user', index, entry);
        });
        return (fetch('js/characters.json')
            .then(response => response.json())
            .then(data => {
                data.forEach((props, cid) => {
                    set$2('system', cid, {
                        meta: {
                            cid,
                            origin: 'system'
                        },
                        props
                    });
                });
            }));
    };
    var characterMap = {
        init: init$2,
        get: get$2,
        set: set$2,
        remove: remove$1,
        has,
        keys,
        keyArray,
        values,
        valueArray,
        entries,
        nextIncrement
    };

    const prepareGroupSort = (entry, groupBy) => {
        if (entry.props[groupBy] === '') {
            entry.props[groupBy] = 'n/a';
        }
        switch (groupBy) {
            case '__user':
                entry.meta._groupValue = entry.props.name;
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
    let grouped = {};
    const getSortedCharacters = (type, {
        groupBy = 'name',
        sortBy = 'name',
        groupDir = 'asc',
        sortDir = 'name'
    } = {}) => {
        for (let entry of characterMap.values(type)) {
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

    const trigger = (type, data, target) => {
        (target || document.body).dispatchEvent(data ? new CustomEvent(type, {
            detail: data
        }) : new Event(type));
    };
    const on = (types, action, target) => {
        if (typeof types === 'string') {
            types = [types];
        }
        types.forEach(type => {
            (target || document.body).addEventListener(type, action);
        });
    };
    var events = {
        trigger,
        on
    };

    const lsKey = settings$1.get('storageKeys.user');
    settings$1.set('userPrefs', JSON.parse(localStorage.getItem(lsKey) || '{}'));
    const getAll = () => {
        return settings$1.get(`userPrefs`);
    };
    const get$1 = key => {
        return settings$1.get(`userPrefs.${key}`);
    };
    const set$1 = (key, value) => {
        settings$1.set(`userPrefs.${key}`, value);
        localStorage.setItem(lsKey, JSON.stringify(getAll()));
        return true;
    };
    var userPrefs = {
        getAll,
        get: get$1,
        set: set$1
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
            const systemGroups = Object.values(characterProvider.getSortedCharacters('system', this));
            systemGroups.forEach((values, index) => {
                let list = src.ul();
                let groupContainer = src.details({
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
            this.addEventListener('pointerdown', e => {
                if (e.button !== 0) {
                    return true;
                }
                const li = e.target.closest('li');
                if (!li) {
                    return false;
                }
                events.trigger('characterSelection', (()=>{
                    const entry = characterMap.get('system', parseInt(li.dataset.cid, 10));
                    delete entry.meta._groupLabel;
                    delete entry.meta._groupValue;
                    return entry;
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
            events.on('characterOrderChange', e => {
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
    const register$a = () => {
        customElements.get('character-library') || customElements['define']('character-library', CharacterLibrary);
    };
    var CharacterLibrary$1 = {
        register: register$a
    };

    var name = {
    	card: true,
    	group: true,
    	label: true
    };
    var __user = {
    	card: true,
    	group: true,
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
    var visibility$1 = {
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
            this.addEventListener('pointerdown', e => {
                if(e.button !== 0){
                    return true;
                }
                const li = e.target.closest('li');
                if (!li) {
                    return false;
                }
                userPrefs.set('characters.groupBy', li.dataset.groupBy);
                events.trigger('characterOrderChange', {
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
                content: 'Order by:'
            });
            const list = src.ul();
            box.append(title, list);
            for (let [key, value] of Object.entries(labels$1)) {
                if(!visibility$1[key].group){
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
            return self;
        }
    }
    const register$9 = () => {
        customElements.get('library-organizer') || customElements['define']('library-organizer', LibraryOrganizer);
    };
    var LibraryOrganizer$1 = {
        register: register$9
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

    var cssProps = {
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
    	"--c-button-color": "var(--text-color)"
    }
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
            this.selected = userPrefs.get(`fonts.${this.name}`) || cssProps[this.name] || '';
            const selector = src.select({
                style: {
                    fontFamily: `var(${this.name})`
                },
                content: fonts.map(entry => {
                    return src.option({
                        attributes: {
                            value: entry.family,
                            selected: entry.family === this.selected
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
                        userPrefs.set(`fonts.${this.name}`, this.selected);
                        events.trigger(`styleChange`, {
                            name: this.name,
                            value: e.target.value
                        });
                    }
                }
            });
            this.append(selector);
        }
        constructor(self) {
            self = super(self);
            return self;
        }
    }
    const register$8 = () => {
        customElements.get('font-selector') || customElements['define']('font-selector', FontSelector);
    };
    var FontSelector$1 = {
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
    		label: "Cloud 1",
    		id: "cloud-1",
    		name: "cloud-1.png"
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
    		label: "Etching Dirty 1",
    		id: "etching-dirty-1",
    		name: "etching-dirty-1.png"
    	},
    	{
    		label: "Spatter 1",
    		id: "spatter-1",
    		name: "spatter-1.png"
    	},
    	{
    		label: "Wood 1",
    		id: "wood-1",
    		name: "wood-1.png"
    	}
    ];

    const patternPool = {
        backgrounds,
        borders
    };
    class PatternSelector extends HTMLElement {
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
        connectedCallback() {
            if (!this.name) {
                throw Error(`Missing attribute "name" on <pattern-selector> element`);
            }
            if (!this.type) {
                throw Error(`Missing attribute "type" on <pattern-selector> element`);
            }
            this.selected = userPrefs.get(`patterns.${this.name}`) || cssProps[this.name] || '';
            const patterns = patternPool[this.type];
            const selector = src.ul({
                content: patterns.map(entry => {
                    return src.li({
                        style: {
                            backgroundImage: this.getUrl(entry.name, 'html')
                        },
                        attributes: {
                            title: entry.label
                        },
                        content: [
                            src.input({
                                attributes: {
                                    type: 'radio',
                                    name: `${this.type}-pattern`,
                                    value: this.getUrl(entry.name, 'css'),
                                    id: `${this.type}-${entry.id}`,
                                    checked: this.getUrl(entry.name, 'css') === this.selected
                                }
                            }),
                            src.label({
                                attributes: {
                                    for: `${this.type}-${entry.id}`
                                }
                            })
                        ]
                    })
                }),
                events: {
                    change: e => {
                        this.selected = e.target.value;
                        userPrefs.set(`patterns.${this.name}`, this.selected);
                        events.trigger(`styleChange`, {
                            name: this.name,
                            value: e.target.value
                        });
                    }
                }
            });
            this.append(selector);
        }
        constructor(self) {
            self = super(self);
            return self;
        }
    }
    const register$7 = () => {
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
            userPrefs.get(`colors.${this.name}`);
            const pattern = this.name.replace('-color', '-');
            const channels =[];
            ['h', 's', 'l'].forEach(channel => {
                channels.push(cssProps[':root'][pattern + channel]);
            });
            return `hsl(${channels.join(' ')})`;
        }
        fireEvent(type) {
            og( format.tracksToValueObj(this.tracks), this.name);
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
            if(!this.value){
                this.value = this.getInitialColor();
            }
            const config = buildConfig(this.value);
            this.tracks = config.tracks;
            this.value = config.original;
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
                    userPrefs.set(`colors.${e.target.name}`, formatted);
                    events.trigger(`styleChange`, {
                        name: e.target.name,
                        value: formatted
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
        }
        constructor(self) {
            self = super(self);
            return self;
        }
    }
    const register$6 = () => {
        customElements.get('color-selector') || customElements['define']('color-selector', ColorSelector);
    };
    var ColorSelector$1 = {
        register: register$6
    };

    const components = [
        CharacterLibrary$1,
        LibraryOrganizer$1,
        FontSelector$1,
        PatternSelector$1,
        ColorSelector$1
    ];
    const register$5 = () => {
        components.forEach(component => {
            component.register();
        });
    };
    var registry = {
        register: register$5
    };

    const styles = Array.from(getComputedStyle(document.body));
    const isStyleProp = key => {
        return key.startsWith('--') || styles.includes(key);
    };
    const set = (key, value, target) => {
        target = target || document.body;
        if (isStyleProp(key)) {
            return target.style.setProperty(key, value);
        }
        target.dataset[key] = value;
    };
    const get = (key, target) => {
        target = target || document.body;
        if (isStyleProp(key)) {
            return JSON.parse(target.style.getPropertyValue(key));
        }
        if (typeof target.dataset[key] === 'undefined') {
            return false;
        }
        return JSON.parse(target.dataset[key]);
    };
    const unset = (key, target) => {
        target = target || document.body;
        if (isStyleProp(key)) {
            return target.style.removeProperty(key);
        }
        delete target.dataset[key];
    };
    var props$1 = {
        unset,
        get,
        set
    };

    const currentTab$1 = src.$('#card-listing');
    const getCurrentTab = () => {
        return currentTab$1;
    };
    var tabs = {
        getCurrentTab
    };

    let props;
    let visibility;
    let order;
    let rendered = {};
    const move = (fromIdx, toIdx) => {
        if (fromIdx < 0) {
            return false
        }
        if (toIdx > order.length) {
            return false
        }
        const entry = order.splice(fromIdx, 1);
        order.splice(toIdx, 0, entry.pop());
        return true;
    };
    const getLabel = key => labels$1[key].short;
    const isVisible = (key, type) => {
        return visibility[key][type] && !!props[key];
    };
    const getProp = key => props[key];
    const getProps = () => props;
    const getOrder = (ignoreList = []) => {
        return order.filter(entry => !ignoreList.includes(entry))
    };
    const setRendered = (origin, key, value, label) => {
        rendered[origin] = rendered[origin] || {};
        rendered[origin][key] = rendered[origin][key] || [];
        rendered[origin][key].push({
            value,
            label
        });
    };
    const init$1 = character => {
        visibility = character.meta.visibility;
        props = character.props;
        order = Object.keys(character.props);
    };
    var fields = {
        getProp,
        move,
        init: init$1,
        getProps,
        setRendered,
        getLabel,
        isVisible,
        getOrder,
        rendered
    };

    class CardRecto extends HTMLElement {
        connectedCallback() {
            const frame = src.figure({
                classNames: ['frame']
            });
            const entries = {
                img: src.img({
                    attributes: {
                        src: fields.getProp('img')
                    }
                }),
                name: src.figcaption({
                    classNames: ['badge'],
                    content: fields.getProp('name')
                })
            };
            for (let [key, element] of Object.entries(entries)) {
                frame.append(element);
                fields.setRendered('recto', key, element, null);
            }
            this.append(frame);
        }
        constructor(self) {
            self = super(self);
            return self;
        }
    }
    const register$4 = () => {
        customElements.get('card-recto') || customElements['define']('card-recto', CardRecto);
    };
    var CardRecto$1 = {
        register: register$4
    };

    class CardVerso extends HTMLElement {
        buildRow(key) {
            const entries = {
                label: src.th({
                    attributes: {
                        hidden: !fields.isVisible(key, 'label'),
                    },
                    content: fields.getLabel(key)
                }),
                element: src.td({
                    content: fields.getProp(key)
                })
            };
            fields.setRendered('verso', key, entries.element, entries.label);
            return src.tr({
                attributes: {
                    hidden: !fields.isVisible(key, 'card'),
                },
                content: Object.values(entries)
            });
        }
        connectedCallback() {
            const entries = {
                name: src.caption({
                    classNames: ['badge'],
                    content: fields.getProp('name')
                }),
                cr: src.div({
                    classNames: ['badge', 'cr'],
                    content: fields.getProp('cr')
                })
            };
            for (let [key, element] of Object.entries(entries)) {
                fields.setRendered('verso', key, element, null);
            }
            const tbody = src.tbody();
            const frame = src.table({
                classNames: ['frame'],
                content: [
                    entries.name,
                    tbody
                ]
            });
            for (let key of fields.getOrder(['img', 'name'])) {
                tbody.append(this.buildRow(key));
            }
            this.append(frame, entries.cr);
        }
        constructor(self) {
            self = super(self);
            return self;
        }
    }
    const register$3 = () => {
        customElements.get('card-verso') || customElements['define']('card-verso', CardVerso);
    };
    var CardVerso$1 = {
        register: register$3
    };

    class CardForm extends HTMLElement {
        icon(key, type) {
            const nextState = fields.isVisible(key, type) ? 'show' : 'hide';
            let title;
            let href;
            switch (type) {
                case 'item':
                    title = 'Display this item on the card';
                    href = `media/icons.svg#icon-${nextState}-${type}`;
                    break;
                case 'label':
                    title = 'Display the item label';
                    href = `media/icons.svg#icon-${nextState}-${type}`;
                    break;
                case 'drag':
                    title = 'Drag item to different position';
                    href = `media/icons.svg#icon-drag-grip`;
                    break;
            }
            return src.svg({
                isSvg: true,
                content: [
                    src.title({
                        isSvg: true,
                        content: title
                    }),
                    src.use({
                        isSvg: true,
                        attributes: {
                            href
                        }
                    })
                ]
            })
        }
        broadCastTextChange(e) {
            if (!e.target.contentEditable) {
                return true;
            }
            const key = e.target.dataset.key ? e.target.dataset.key : e.target.closest('tr').dataset.key;
            const type = e.target.nodeName === 'TH' ? 'label' : 'value';
            const text = e.target.textContent;
            for (let [segment, list] of Object.entries(fields.rendered)) {
                if (segment === 'form') {
                    continue;
                }
                if (list[key]) {
                    list[key].forEach(row => {
                        if (row[type]) {
                            key === 'img' ? row[type].src = text : row[type].textContent = text;
                        }
                    });
                }
            }
            console.log(fields.rendered);
        }
        buildRow(key) {
            const data = this.buildCells(key);
            return src.tr({
                data: {
                    key
                },
                classNames: data.classNames,
                content: data.cells,
                events: {
                    pointerdown: function (e) {
                        this.draggable === e.target.nodeName === 'TR';
                    }
                }
            });
        }
        buildCells(key) {
            const entries = {
                dragIcon: src.td({
                    classNames: ['icon', 'handle'],
                    content: this.icon(key, 'drag')
                }),
                label: src.th({
                    attributes: {
                        contentEditable: true
                    },
                    content: fields.getLabel(key)
                }),
                element: src.td({
                    attributes: {
                        contentEditable: true
                    },
                    content: fields.getProp(key)
                }),
                labelIcon: src.td({
                    classNames: ['icon'],
                    content: this.icon(key, 'label')
                }),
                cardIcon: src.td({
                    classNames: ['icon'],
                    content: this.icon(key, 'item')
                })
            };
            fields.setRendered('form', key, entries.element, entries.label);
            const classNames = [];
            if (!fields.isVisible(key, 'card')) {
                classNames.push('no-card');
            }
            if (!fields.isVisible(key, 'label')) {
                classNames.push('no-label');
            }
            return {
                classNames,
                cells: Object.values(entries)
            }
        }
        populateTbody(tbody) {
            for (let key of fields.getOrder(['img', 'name'])) {
                tbody.append(this.buildRow(key, false));
            }
        }
        connectedCallback() {
            const quill = src.svg({
                isSvg: true,
                classNames: ['quill'],
                content: src.use({
                    isSvg: true,
                    attributes: {
                        href: 'media/icons.svg#icon-quill'
                    }
                })
            });
            const tbody = src.tbody();
            const frame = src.table({
                content: [
                    src.caption({
                        attributes: {
                            contentEditable: true
                        },
                        data: {
                            key: 'name'
                        },
                        content: fields.getProp('name')
                    }),
                    src.thead({
                        content: [
                            src.tr({
                                data: {
                                    key: 'img'
                                },
                                content: [
                                    src.th({
                                        content: 'Image'
                                    }),
                                    src.td({
                                        attributes: {
                                            colSpan: 4,
                                            contentEditable: true
                                        },
                                        content: fields.getProp('img')
                                    })
                                ]
                            })
                        ]
                    }),
                    tbody
                ],
                events: {
                    input: e => {
                        this.broadCastTextChange(e);
                    },
                    paste: e => {
                        this.broadCastTextChange(e);
                    }
                }
            });
            this.populateTbody(tbody);
            this.append(quill, frame);
        }
        constructor(self) {
            self = super(self);
            return self;
        }
    }
    const register$2 = () => {
        customElements.get('card-form') || customElements['define']('card-form', CardForm);
    };
    var CardForm$1 = {
        register: register$2
    };

    const defaultDiacriticsRemovalMap = [
        { 'base': 'A', 'letters': '\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F' },
        { 'base': 'AA', 'letters': '\uA732' },
        { 'base': 'AE', 'letters': '\u00C6\u01FC\u01E2' },
        { 'base': 'AO', 'letters': '\uA734' },
        { 'base': 'AU', 'letters': '\uA736' },
        { 'base': 'AV', 'letters': '\uA738\uA73A' },
        { 'base': 'AY', 'letters': '\uA73C' },
        { 'base': 'B', 'letters': '\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181' },
        { 'base': 'C', 'letters': '\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E' },
        { 'base': 'D', 'letters': '\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779\u00D0' },
        { 'base': 'DZ', 'letters': '\u01F1\u01C4' },
        { 'base': 'Dz', 'letters': '\u01F2\u01C5' },
        { 'base': 'E', 'letters': '\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E' },
        { 'base': 'F', 'letters': '\u0046\u24BB\uFF26\u1E1E\u0191\uA77B' },
        { 'base': 'G', 'letters': '\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E' },
        { 'base': 'H', 'letters': '\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D' },
        { 'base': 'I', 'letters': '\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197' },
        { 'base': 'J', 'letters': '\u004A\u24BF\uFF2A\u0134\u0248' },
        { 'base': 'K', 'letters': '\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2' },
        { 'base': 'L', 'letters': '\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780' },
        { 'base': 'LJ', 'letters': '\u01C7' },
        { 'base': 'Lj', 'letters': '\u01C8' },
        { 'base': 'M', 'letters': '\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C' },
        { 'base': 'N', 'letters': '\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4' },
        { 'base': 'NJ', 'letters': '\u01CA' },
        { 'base': 'Nj', 'letters': '\u01CB' },
        { 'base': 'O', 'letters': '\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C' },
        { 'base': 'OI', 'letters': '\u01A2' },
        { 'base': 'OO', 'letters': '\uA74E' },
        { 'base': 'OU', 'letters': '\u0222' },
        { 'base': 'OE', 'letters': '\u008C\u0152' },
        { 'base': 'oe', 'letters': '\u009C\u0153' },
        { 'base': 'P', 'letters': '\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754' },
        { 'base': 'Q', 'letters': '\u0051\u24C6\uFF31\uA756\uA758\u024A' },
        { 'base': 'R', 'letters': '\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782' },
        { 'base': 'S', 'letters': '\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784' },
        { 'base': 'T', 'letters': '\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786' },
        { 'base': 'TZ', 'letters': '\uA728' },
        { 'base': 'U', 'letters': '\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244' },
        { 'base': 'V', 'letters': '\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245' },
        { 'base': 'VY', 'letters': '\uA760' },
        { 'base': 'W', 'letters': '\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72' },
        { 'base': 'X', 'letters': '\u0058\u24CD\uFF38\u1E8A\u1E8C' },
        { 'base': 'Y', 'letters': '\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE' },
        { 'base': 'Z', 'letters': '\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762' },
        { 'base': 'a', 'letters': '\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250' },
        { 'base': 'aa', 'letters': '\uA733' },
        { 'base': 'ae', 'letters': '\u00E6\u01FD\u01E3' },
        { 'base': 'ao', 'letters': '\uA735' },
        { 'base': 'au', 'letters': '\uA737' },
        { 'base': 'av', 'letters': '\uA739\uA73B' },
        { 'base': 'ay', 'letters': '\uA73D' },
        { 'base': 'b', 'letters': '\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253' },
        { 'base': 'c', 'letters': '\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184' },
        { 'base': 'd', 'letters': '\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A' },
        { 'base': 'dz', 'letters': '\u01F3\u01C6' },
        { 'base': 'e', 'letters': '\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD' },
        { 'base': 'f', 'letters': '\u0066\u24D5\uFF46\u1E1F\u0192\uA77C' },
        { 'base': 'g', 'letters': '\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F' },
        { 'base': 'h', 'letters': '\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265' },
        { 'base': 'hv', 'letters': '\u0195' },
        { 'base': 'i', 'letters': '\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131' },
        { 'base': 'j', 'letters': '\u006A\u24D9\uFF4A\u0135\u01F0\u0249' },
        { 'base': 'k', 'letters': '\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3' },
        { 'base': 'l', 'letters': '\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747' },
        { 'base': 'lj', 'letters': '\u01C9' },
        { 'base': 'm', 'letters': '\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F' },
        { 'base': 'n', 'letters': '\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5' },
        { 'base': 'nj', 'letters': '\u01CC' },
        { 'base': 'o', 'letters': '\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275' },
        { 'base': 'oi', 'letters': '\u01A3' },
        { 'base': 'ou', 'letters': '\u0223' },
        { 'base': 'oo', 'letters': '\uA74F' },
        { 'base': 'p', 'letters': '\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755' },
        { 'base': 'q', 'letters': '\u0071\u24E0\uFF51\u024B\uA757\uA759' },
        { 'base': 'r', 'letters': '\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783' },
        { 'base': 's', 'letters': '\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B' },
        { 'base': 't', 'letters': '\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787' },
        { 'base': 'tz', 'letters': '\uA729' },
        { 'base': 'u', 'letters': '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289' },
        { 'base': 'v', 'letters': '\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C' },
        { 'base': 'vy', 'letters': '\uA761' },
        { 'base': 'w', 'letters': '\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73' },
        { 'base': 'x', 'letters': '\u0078\u24E7\uFF58\u1E8B\u1E8D' },
        { 'base': 'y', 'letters': '\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF' },
        { 'base': 'z', 'letters': '\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763' }
    ];
    let diacriticsMap = {};
    for (var i = 0; i < defaultDiacriticsRemovalMap.length; i++) {
        var letters = defaultDiacriticsRemovalMap[i].letters;
        for (var j = 0; j < letters.length; j++) {
            diacriticsMap[letters[j]] = defaultDiacriticsRemovalMap[i].base;
        }
    }

    const camel = term => {
        return term.replace(/[_-]+/, ' ').replace(/(?:^[\w]|[A-Z]|\b\w|\s+)/g, function (match, index) {
            if (+match === 0) return '';
            return index === 0 ? match.toLowerCase() : match.toUpperCase();
        });
    };

    class CardToolbar extends HTMLElement {
        connectedCallback() {
            this.addEventListener('pointerup', e => {
                const btn = e.target.closest('button');
                if (!btn || e.button !== 0) {
                    return true;
                }
                events.trigger(camel(`character-${e.target.name}`), this.closest('card-base'));
            });
            const buttons = {
                remove: {
                    text: 'Unmake',
                    icon: 'media/icons.svg#icon-axe'
                },
                edit: {
                    text: 'Mutate',
                    icon: 'media/icons.svg#icon-quill'
                }
            };
            for (let [name, data] of Object.entries(buttons)) {
                const tpl = src.button({
                    attributes: {
                        type: 'button',
                        name
                    },
                    content: [
                        data.text,
                        src.svg({
                            isSvg: true,
                            content: src.use({
                                isSvg: true,
                                attributes: {
                                    href: data.icon
                                }
                            })
                        })
                    ]
                });
                this.append(src.toNode(tpl));
            }
        }
        constructor(self) {
            self = super(self);
            return self;
        }
    }
    const register$1 = () => {
        customElements.get('card-toolbar') || customElements['define']('card-toolbar', CardToolbar);
    };
    var CardToolbar$1 = {
        register: register$1
    };

    class CardBase extends HTMLElement {
        connectedCallback() {
            const cardInner = src.article({
                content: [
                    src.div({
                        classNames: ['card-view'],
                        content: [
                            document.createElement('card-recto'),
                            document.createElement('card-verso')
                        ]
                    }),
                    document.createElement('card-form'),
                    document.createElement('card-toolbar')
                ]
            });
            this.append(cardInner);
        }
        constructor(self) {
            self = super(self);
            return self;
        }
    }
    const register = () => {
        CardRecto$1.register();
        CardVerso$1.register();
        CardForm$1.register();
        CardToolbar$1.register();
        customElements.get('card-base') || customElements['define']('card-base', CardBase);
    };
    var CardBase$1 = {
        register
    };

    const currentTab = tabs.getCurrentTab();
    const tabId = 1;
    const origin = 'user';
    const add = character => {
        const cardId = characterMap.nextIncrement(origin);
        character.meta = {
            ...character.meta,
            ...{
                visibility: visibility$1,
                tabId,
                cardId,
                origin
            }
        };
        characterMap.set(origin, cardId, character);
        fields.init(character);
        const card = document.createElement('card-base');
        currentTab.append(card);
    };
    const remove = card => {
        characterMap.remove(origin, card.meta.cardId);
        card.remove();
    };
    const enableEdit = card => {
        card.classList.add('editable');
    };
    const init = () => {
        CardBase$1.register();
        events.on('characterSelection', e => {
            add(e.detail);
        });
        events.on('characterRemove', e => {
            remove(e.detail);
        });
        events.on('characterEdit', e => {
            enableEdit(e.detail);
        });
    };
    var cardManager = {
        init
    };

    characterMap.init()
        .then(() => {
            registry.register();
            cardManager.init();
        });
    events.on('styleChange', e => {
        [src.$('#editor'), src.$('#style-editor')].forEach(panel => {
            props$1.set(e.detail.name, e.detail.value, panel);
        });
    });

})();
