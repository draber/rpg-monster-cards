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

    const cmpFns = {
        equal: (a, b) => {
            return a === b;
        },
        notEqual: (a, b) => {
            return a !== b;
        },
        greater: (a, b) => {
            return a > b;
        },
        greaterEqual: (a, b) => {
            return a >= b;
        },
        lesser: (a, b) => {
            return a < b;
        },
        lesserEqual: (a, b) => {
            return a <= b;
        },
        instanceof: (a, b) => {
            return a instanceof b;
        },
        typeof: (a, b) => {
            return typeof a === b;
        },
        match: (a, b) => {
            return b.test(a)
        }
    };
    const cmpMap = {
        ['===']: cmpFns.equal,
        ['!==']: cmpFns.notEqual,
        ['>']: cmpFns.greater,
        ['>=']: cmpFns.greaterEqual,
        ['<']: cmpFns.lesser,
        ['<=']: cmpFns.lesserEqual
    };
    const getCmpFn = fn => {
        if(fn instanceof Function){
            return fn;
        }
        if (cmpFns[fn]) {
            return cmpFns[fn];
        }
        if (cmpMap[fn]) {
            return cmpMap[fn];
        }
        throw (`Unknown function ${fn}`);
    };

    const deepClone = obj => {
        return !(structuredClone instanceof Function) ? JSON.parse(JSON.stringify(obj)) : structuredClone(obj);
    };

    const _get = (key, obj) => {
        const keys = key.toString().split('.');
        let current = Object.create(obj);
        for (let token of keys) {
            if (typeof current[token] === 'undefined') {
                return undefined;
            }
            current = current[token];
        }
        return current;
    };
    class Tree {
        get length() {
            return this.keys().length;
        }
        flush() {
            this.obj = {};
            this.save();
        }
        save() {
            return this.lsKey ? localStorage.setItem(this.lsKey, JSON.stringify(this.object())) : null;
        }
        set(key, value) {
            const keys = key.toString().split('.');
            const last = keys.pop();
            let current = this.obj;
            for (let token of keys) {
                if (!current[token]) {
                    current[token] = {};
                }
                if (Object.getPrototypeOf(current) !== Object.prototype) {
                    throw (`${token} is not of the type Object`);
                }
                current = current[token];
            }
            current[last] = value;
            this.save();
            return this;
        }
        unset(key) {
            const keys = key.toString().split('.');
            const last = keys.pop();
            let current = this.obj;
            for (let token of keys) {
                if (!current[token]) {
                    current[token] = {};
                }
                if (Object.getPrototypeOf(current) !== Object.prototype) {
                    throw (`${token} is not of the type Object`);
                }
                current = current[token];
            }
            delete current[last];
            this.save();
            return this;
        }
        get(key) {
            return _get(key, this.obj);
        }
        getClone(key) {
            return deepClone(this.get(key))
        }
        has(key) {
            return typeof this.get(key) !== 'undefined';
        }
        where(searchKey, cmpFn, expected = null) {
            return [searchKey, cmpFn, expected];
        }
        object(...conditions) {
            conditions = conditions.filter(e => Array.isArray(e));
            if (!conditions.length) {
                return this.obj;
            }
            const result = {};
            for (let [key, entry] of Object.entries(this.obj)) {
                conditions.forEach(condition => {
                    const comperator = _get(`${key}.${condition[0]}`, this.obj);
                    const expected = condition[2];
                    const fn = getCmpFn(condition[1]);
                    if (fn(comperator, expected)) {
                        result[key] = entry;
                    }
                });
            }
            return result;
        }
        entries(...conditions) {
            return Object.entries(this.object.apply(this, conditions));
        }
        values(...conditions) {
            return Object.values(this.object.apply(this, conditions));
        }
        keys(...conditions) {
            return Object.keys(this.object.apply(this, conditions));
        }
        remove(...keys) {
            keys.forEach(key => {
                delete this.obj[key];
            });
            this.save();
        }
        toJson(pretty = false) {
            return JSON.stringify(this.obj, null, (pretty ? '\t' : null));
        }
        constructor({
            data = {},
            lsKey
        } = {}) {
            this.obj = data;
            this.lsKey = lsKey;
        }
    }

    class NumericTree extends Tree {
        keys(...conditions) {
            return super.keys.apply(this, conditions).map(e => parseInt(e));
        }
        nextIncrement() {
            let keys = this.length ? this.keys().map(e => parseInt(e)) : [this.minIncrement - 1];
            return Math.max(...keys) + 1;
        }
        constructor({
            data = {},
            minIncrement = 1,
            lsKey
        } = {}) {
            super({
                data,
                lsKey
            });
            this.minIncrement = minIncrement;
        }
    }

    const toCid = cidData => {
        const cid = cidData.cid || cidData;
        if (isNaN(cid)) {
            throw `${cid} is not a valid character identifier`;
        }
        return parseInt(cid, 10);
    };
    const toTid = tidData => {
        const tid = tidData.tid || tidData;
        if (isNaN(tid)) {
            throw `${tid} is not a valid tab identifier`;
        }
        return parseInt(tid, 10);
    };
    var idHelper = {
        toCid,
        toTid
    };

    class TabTree extends NumericTree {
        getBlank() {
            const tid = this.nextIncrement();
            return {
                tid,
                title: convertToRoman(tid),
                styles: {}
            }
        }
        remove(...tidData) {
            super.remove(...tidData.map(e => idHelper.toTid(e)));
        }
        constructor({
            data = {},
            minIncrement = 1,
            lsKey
        } = {}) {
            super({
                data,
                lsKey,
                minIncrement
            });
        }
    }

    var name$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var __user$1 = {
    	card: true,
    	group: false,
    	label: true
    };
    var img$1 = {
    	card: true,
    	group: false,
    	label: false
    };
    var cr$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var base$1 = {
    	card: false,
    	group: true,
    	label: true
    };
    var type$1 = {
    	card: true,
    	group: false,
    	label: true
    };
    var hp$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var speed$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var bag$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var atk$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var atk_f$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var atk_p$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var sp_r$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var atk_s$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var rfx$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var will$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var str$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var dex$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var con$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var int$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var wis$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var cha$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var skills$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var feats$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var env$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var org$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var tre$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var algn$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var l_adj$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var notes$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var fort$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var ac$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var ini$1 = {
    	card: true,
    	group: true,
    	label: true
    };
    var visibility$1 = {
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

    var name = {
    	group: "First Letter",
    	long: "Name",
    	short: "Name"
    };
    var __user = {
    	long: "Your Creatures",
    	group: "Your Creatures"
    };
    var img = {
    	long: "Image URL",
    	short: "Img",
    	group: "Image URL"
    };
    var cr = {
    	long: "Challenge Rating",
    	short: "CR",
    	group: "Challenge Rating"
    };
    var base = {
    	long: "Base",
    	short: "Base",
    	group: "Base"
    };
    var type = {
    	long: "Type",
    	short: "Type",
    	group: "Type"
    };
    var hp = {
    	long: "Hit Points",
    	short: "HP",
    	group: "Hit Points"
    };
    var speed = {
    	long: "Speed",
    	short: "Spd",
    	group: "Speed"
    };
    var bag = {
    	long: "Base Attack/Grapple",
    	short: "BA/G",
    	group: "Base Attack/Grapple"
    };
    var atk = {
    	long: "Attack",
    	short: "Atk",
    	group: "Attack"
    };
    var atk_f = {
    	long: "Full Attack",
    	short: "Full Atk",
    	group: "Full Attack"
    };
    var atk_p = {
    	long: "Attack Parameters",
    	short: "Atk Params",
    	group: "Attack Parameters"
    };
    var sp_r = {
    	long: "Space/Reach",
    	short: "Sp/Re",
    	group: "Space/Reach"
    };
    var atk_s = {
    	long: "Special Attacks",
    	short: "Sp Atk",
    	group: "Special Attacks"
    };
    var rfx = {
    	long: "Reflex",
    	short: "Rfx",
    	group: "Reflex"
    };
    var will = {
    	long: "Will",
    	short: "Wil",
    	group: "Will"
    };
    var str = {
    	long: "Strength",
    	short: "Str",
    	group: "Strength"
    };
    var dex = {
    	long: "Dexterity",
    	short: "Dex",
    	group: "Dexterity"
    };
    var con = {
    	long: "Constitution",
    	short: "Con",
    	group: "Constitution"
    };
    var int = {
    	long: "Intelligence",
    	short: "Int",
    	group: "Intelligence"
    };
    var wis = {
    	long: "Wisdom",
    	short: "Wis",
    	group: "Wisdom"
    };
    var cha = {
    	long: "Charisma",
    	short: "Cha",
    	group: "Charisma"
    };
    var skills = {
    	long: "Skills",
    	short: "Skills",
    	group: "Skills"
    };
    var feats = {
    	long: "Feats",
    	short: "Feats",
    	group: "Feats"
    };
    var env = {
    	long: "Environment",
    	short: "Env",
    	group: "Environment"
    };
    var org = {
    	long: "Organization",
    	short: "Org",
    	group: "Organization"
    };
    var tre = {
    	long: "Treasure",
    	short: "Treas",
    	group: "Treasure"
    };
    var algn = {
    	long: "Alignment",
    	short: "Algn",
    	group: "Alignment"
    };
    var l_adj = {
    	long: "Level Adjustment",
    	short: "L Adj",
    	group: "Level Adjustment"
    };
    var notes = {
    	long: "Notes",
    	short: "Notes",
    	group: "Notes"
    };
    var fort = {
    	long: "Fortitude",
    	short: "Fort",
    	group: "Fortitude"
    };
    var ac = {
    	long: "Armor Class",
    	short: "AC",
    	group: "Armor Class"
    };
    var ini = {
    	long: "Initiative",
    	short: "Ini",
    	group: "Initiative"
    };
    var labels$1 = {
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

    const getLabels = () => {
        const _labels = {};
        for (let [key, value] of Object.entries(labels$1)) {
            if (key.startsWith('__')) {
                continue;
            }
            _labels[key] = value.short;
        }
        return _labels;
    };
    class CharTree extends NumericTree {
        getBlank() {
            const props = {};
            Object.keys(labels$1).forEach(key => {
                props[key] = '';
            });
            return {
                cid: this.nextIncrement(),
                props,
                visibility: visibility$1,
                labels: getLabels()
            }
        }
        remove(...cidData) {
            super.remove(...cidData.map(e => idHelper.toCid(e)));
        }
        constructor({
            data = {},
            minIncrement = 1,
            lsKey
        } = {}) {
            super({
                data,
                lsKey,
                minIncrement
            });
        }
    }

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

    let tabStore;
    let systemStore;
    let cardStore;
    let copyStore;
    let prefStore;
    let styleStore;
    let settings;
    let labelStore;
    const initStorage = launchData => {
        settings = launchData.settings;
        tabStore = new TabTree({
            data: launchData.tabs,
            lsKey: settings.get('storageKeys.tabs')
        });
        if(tabStore.length === 0){
            const blank = tabStore.getBlank();
            tabStore.set(blank.tid, blank);
        }
        systemStore = new CharTree({
            data: launchData.system
        });
        cardStore = new CharTree({
            data: launchData.stored,
            lsKey: settings.get('storageKeys.cards'),
            minIncrement: 3001
        });
        copyStore = new CharTree({
            minIncrement: 6001
        });
        prefStore = new Tree({
            data: JSON.parse(localStorage.getItem(settings.get('storageKeys.user') || '{}')),
            lsKey: settings.get('storageKeys.user')
        });
        styleStore = new SystemPropTree({
            data: cssProps$1[':root']
        });
        labelStore = new SystemPropTree({
            data: labels$1
        });
    };

    const prepareGroupSort = (entry, groupBy) => {
        if (typeof entry.props[groupBy] === 'undefined') {
            entry.props[groupBy] = '';
        }
        switch (groupBy) {
            case '__user':
                entry._groupValue = labelStore.get('__user.group');
                entry._groupLabel = labelStore.get('__user.group');
                break;
            case 'name':
                entry._groupValue = entry.props.name.charAt(0).toUpperCase();
                entry._groupLabel = labelStore.get(`${groupBy}.group`) + ':' + entry._groupValue;
                break
            default:
                entry._groupValue = entry.props[groupBy];
                entry._groupLabel = labelStore.get(`${groupBy}.group`) + ':' + entry.props[groupBy];
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
        const store = type === 'user' ? cardStore : systemStore;
        for (let entry of store.values()) {
            entry = prepareGroupSort(entry, groupBy);
            grouped[entry._groupValue] = grouped[entry._groupValue] || [];
            grouped[entry._groupValue].push(entry);
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
            if (settings.get('userCharacters.inLibrary') && userCollection.length) ;
            collection.forEach((values, index) => {
                let list = src.ul();
                let groupContainer = src.details({
                    classNames: index === 0 ? firstGroupClassNames : [],
                    attributes: {
                        open: index === 0
                    },
                    content: [
                        src.summary({
                            content: values[0]._groupLabel,
                            attributes: {
                                title: values[0]._groupLabel
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
                            cid: value.cid
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
                    const store = li.closest('details').classList.contains('user-generated') ? cardStore : systemStore;
                    const character = store.getClone(li.dataset.cid);
                    character._groupLabel && delete character._groupLabel;
                    character._groupValue && delete character._groupValue;
                    return character;
                })());
            });
            this.sortBy = prefStore.get('characters.sortBy') || this.sortBy || 'name';
            this.groupBy = prefStore.get('characters.groupBy') || this.groupBy || 'name';
            this.sortDir = prefStore.get('characters.sortDir') || this.sortDir || 'asc';
            this.groupDir = prefStore.get('characters.groupDir') || this.groupDir || 'asc';
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
    const register$k = app => {
        CharacterLibrary.prototype.app = app;
        customElements.get('character-library') || customElements['define']('character-library', CharacterLibrary);
    };
    var CharacterLibrary$1 = {
        register: register$k
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
                if (e.button !== 0) {
                    return true;
                }
                const li = e.target.closest('li');
                if (!li) {
                    return false;
                }
                prefStore.set('characters.groupBy', li.dataset.groupBy);
                this.app.trigger('characterOrderChange', {
                    groupBy: li.dataset.groupBy
                });
            });
            this.groupBy = prefStore.get('characters.groupBy') || this.groupBy || 'name';
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
            for (let [key, value] of labelStore.entries()) {
                if (!visibility$1[key].group) {
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
    const register$j = app => {
        LibraryOrganizer.prototype.app = app;
        customElements.get('library-organizer') || customElements['define']('library-organizer', LibraryOrganizer);
    };
    var LibraryOrganizer$1 = {
        register: register$j
    };

    const set$1 = (key, value, target) => {
        target = target || document.body;
        target.dataset[key] = value;
    };
    const get = (key, target) => {
        target = target || document.body;
        const value = target.dataset[key];
        switch (true) {
            case typeof value === 'undefined' || value === 'undefined':
                return undefined;
            case ['null', 'true', 'false'].includes(value):
                return JSON.parse(value);
            case !isNaN(value):
                return parseFloat(value, 10);
            default:
                return value
        }
    };
    const toggle$1 = (key, target) => {
        set$1(key, !get(key, target), target);
    };
    const unset = (key, target) => {
        target = target || document.body;
        delete target.dataset[key];
    };
    var domProps = {
        unset,
        get,
        set: set$1,
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
        domProps.set('softDeleted', true, element);
        const dialog = document.createElement('undo-dialog');
        dialog.element = element;
        if (label) {
            dialog.label = label;
        }
        toast$1.append(dialog);
        return new Promise(resolve => {
            dialog.on('restore', e => {
                domProps.unset('softDeleted', element);
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

    let app$2;
    let navi;
    let contentArea;
    let activeTab;
    const setActiveTab = tab => {
        activeTab = tab || activeTab || src.$(`tab-handle`, navi);
        src.$$('tab-handle', navi).forEach(tab => {
            tab.classList.remove('active');
            tab.panel.classList.remove('active');
            tabStore.unset(`${idHelper.toTid(tab)}.active`);
            tab.removeAttribute('style');
        });
        const tid = idHelper.toTid(activeTab);
        activeTab.classList.add('active');
        activeTab.panel.classList.add('active');
        tabStore.set(`${tid}.active`, true);
        app$2.trigger('tabStyleChange', {
            tab: activeTab,
            styles: tabStore.get(tid).styles
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
        return activeTab;
    };
    const getTab = tabData => {
        if (tabData === 'active') {
            return activeTab;
        }
        if (tabData instanceof customElements.get('tab-handle')) {
            return tabData
        }
        return src.$(`tab-handle[tid="${idHelper.toTid(tabData)}"]`, navi);
    };
    const getTabs = exclude => {
        let tabs = Array.from(src.$$(`tab-handle`, navi));
        if (!exclude) {
            return tabs
        }
        if (exclude === 'populated') {
            return tabs.filter(tab => !src.$('card-base', tab.panel));
        }
        if (exclude === 'soft-deleted') {
            return tabs.filter(tab => !tab.dataset.softDeleted);
        }
        if (exclude.forEach) {
            exclude = Array.from(exclude);
        } else if (exclude instanceof customElements.get('tab-handle')) {
            exclude = [exclude];
        }
        return tabs.filter(tab => !exclude.includes(tab));
    };
    const add$1 = ({
        tabEntry,
        previousTab,
        activate = false
    } = {}) => {
        tabEntry = tabEntry || tabStore.getBlank();
        const tab = document.createElement('tab-handle');
        tab.panel = document.createElement('tab-panel');
        tab.container = navi;
        for (let [key, value] of Object.entries(tabEntry)) {
            tab[key] = value;
            tab.panel[key] = value;
        }
        tab.panel.removeAttribute('title');
        contentArea.append(tab.panel);
        if (previousTab) {
            previousTab.after(tab);
        }
        else {
            src.$('.adder', navi).before(tab);
        }
        tabStore.set(idHelper.toTid(tabEntry), tabEntry);
        if (activate) {
            setActiveTab(tab);
        }
        return tab;
    };
    const bulkDeleteExcept = exclude => {
        softDelete$1.cancel();
        let deletables = getTabs(exclude);
        let deleteActive = !!deletables.find(tab => tab.classList.contains('active'));
        let survivors = getTabs(deletables);
        deletables.forEach(tab => {
            handleRemoval$1(tab, 'remove');
        });
        if (!survivors.length) {
            add$1({
                activate: true
            });
        }
        else if (deleteActive) {
            setActiveTab(getTabs()[0]);
        }
    };
    const handleRemoval$1 = (tab, action) => {
        tab = getTab(tab);
        switch (action) {
            case 'soft':
                softDelete$1.initiate(tab, 'Tab ' + tab.title)
                    .then(data => {
                        handleRemoval$1(tab, data.action);
                    });
                tabStore.set(`${idHelper.toTid(tab)}.softDeleted`, true);
                if (!tabStore.values(['softDeleted', '!==', true]).length) {
                    add$1({
                        activate: true
                    });
                }
                if (tab.isSameNode(activeTab)) {
                    setActiveTab(getTabs('soft-deleted')[0]);
                }
                break;
            case 'restore':
                tabStore.unset(`${idHelper.toTid(tab)}.softDeleted`);
                break;
            case 'remove':
                app$2.trigger(
                    'tabDelete',
                    Array.from(src.$$('card-base', tab.panel)).map(card => idHelper.toCid(card))
                );
                tabStore.remove(tab);
                tab.remove();
                break;
            case 'empty':
                bulkDeleteExcept('populated');
                break;
            case 'others':
                bulkDeleteExcept(tab);
                setActiveTab(tab);
                break;
            case 'all':
                bulkDeleteExcept();
                break;
        }
    };
    const restore = () => {
        const entries = tabStore.values();
        const activeSet = entries.filter(e => !!e.active);
        const activeTid = activeSet.length ? idHelper.toTid(activeSet[0]) : tabStore.keys()[0];
        for (let tabEntry of entries) {
            add$1({
                tabEntry
            });
        }
        setActiveTab(getTab(activeTid));
    };
    const init$3 = _app => {
        app$2 = _app;
        navi = src.$('tab-navi', app$2);
        contentArea = src.$('tab-content', app$2);
        restore();
        app$2.on('singleStyleChange', e => {
            const tab = e.detail.tab || activeTab;
            const tid = idHelper.toTid(tab);
            const entry = tabStore.get(tid);
            entry.styles[e.detail.area] = entry.styles[e.detail.area] || {};
            entry.styles[e.detail.area][e.detail.name] = e.detail.value;
            tabStore.set(tid, entry);
            if (tab.isSameNode(activeTab)) {
                tab.panel.style.setProperty(e.detail.name, e.detail.value);
            }
        });
        app$2.on('styleReset', e => {
            const tid = idHelper.toTid(e.detail.tab);
            tabStore.set(`${tid}.styles`, {});
            app$2.trigger('tabStyleChange', {
                tab: e.detail.tab,
                styles: {}
            });
        });
    };
    var tabManager = {
        init: init$3,
        add: add$1,
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
                        tabManager.add({
                            activate: true
                        });
                    }
                }
            });
            this.addEventListener('dblclick', e => {
                if (e.target.isSameNode(this)) {
                    tabManager.add({
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
    const register$i = app => {
        TabNavi.prototype.app = app;
        customElements.get('tab-navi') || customElements['define']('tab-navi', TabNavi);
    };
    var TabNavi$1 = {
        register: register$i
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
    const init$2 = () => {
        if(firstRegistration) {
            document.addEventListener('pointerup', offContextMenu);
            firstRegistration = false;
        }
    };
    const unregister = owner => {
        owner.contextMenu.remove();
    };
    const register$h = (owner, menu) => {
        init$2();
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
        register: register$h,
        unregister
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

    const sanitizeText = text => {
        return new DOMParser()
            .parseFromString(text, 'text/html').body.textContent
            .replace(/\s+/g, ' ');
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
        domProps.set('softDeleted', true, element);
        const dialog = document.createElement('undo-dialog');
        dialog.element = element;
        if (label) {
            dialog.label = label;
        }
        toast.append(dialog);
        return new Promise(resolve => {
            dialog.on('restore', e => {
                domProps.unset('softDeleted', element);
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

    let app$1;
    const add = character => {
        let cid;
        let tid;
        let tab;
        if (character.tid) {
            cid = idHelper.toCid(character);
            tab = tabManager.getTab(character.tid);
            if (!tab) {
                handleRemoval(character, 'remove');
                return;
            }
            tid = idHelper.toTid(tab);
        } else {
            cid = cardStore.nextIncrement();
            tab = tabManager.getTab('active');
            tid = idHelper.toTid(tab);
        }
        character = {
            ...cardStore.getBlank(),
            ...character,
            ...{
                tid,
                cid
            }
        };
        cardStore.set(cid, character);
        const card = document.createElement('card-base');
        card.setAttribute('cid', cid);
        card.setAttribute('tid', tid);
        card.character = character;
        tab.panel.append(card);
    };
    const getCard = cidData => {
        return src.$(`[cid="${idHelper.toCid(cidData)}"]`);
    };
    const restoreLastSession = () => {
        for (let character of cardStore.values()) {
            add(character);
        }
    };
    const handleRemoval = (card, action) => {
        const cid = idHelper.toCid(card);
        switch (action) {
            case 'soft':
                softDelete.initiate(card, cardStore.get(`${cid}.props.name`))
                    .then(data => {
                        handleRemoval(card, data.action);
                    });
                cardStore.set(`${cid}.softDeleted`, true);
                break;
            case 'restore':
                cardStore.unset(`${cid}.softDeleted`);
                break;
            case 'remove':
                cardStore.remove(card);
                if (card instanceof HTMLElement) {
                    card.remove();
                }
                break;
        }
    };
    const init$1 = _app => {
        app$1 = _app;
        app$1.on('tabDelete', e => {
            e.detail.forEach(card => {
                handleRemoval(card, 'remove');
            });
        });
        app$1.on('characterSelection', e => {
            add(e.detail);
        });
        restoreLastSession();
    };
    var cardManager = {
        init: init$1,
        handleRemoval,
        add,
        getCard
    };

    const set = (card, mode) => {
        clear(card.app);
        card.classList.add(mode);
        const original = cardStore.get(idHelper.toCid(card));
        const copy = {
            ...deepClone(original),
            ...{
                mode
            }
        };
        copy.originalCid = idHelper.toCid(original);
        copy.cid = copyStore.nextIncrement();
        copyStore.set(copy.cid, copy);
        domProps.set('cardStorage', true);
    };
    const cut = card => {
        set(card, 'cut');
    };
    const copy = card => {
        set(card, 'copy');
    };
    const paste = tab => {
        copyStore.values().forEach(copy => {
            copy.tid = idHelper.toTid(tab);
            if (copy.mode === 'cut') {
                cardManager.handleRemoval(cardManager.getCard(copy.originalCid), 'remove');
            }
            delete copy.originalCid;
            copy.cid = cardStore.nextIncrement();
            cardManager.add(copy);
        });
        clear(tab.app);
        copyStore.flush();
        domProps.unset('cardStorage');
    };
    const clear = app => {
        const lastCopied = src.$('card-base.cut, card-base.copy', app);
        if (lastCopied) {
            lastCopied.classList.remove('cut', 'copy');
        }
    };
    var cardCopy = {
        copy,
        cut,
        paste,
        clear
    };

    class TabHandle extends HTMLElement {
        makeEditable() {
            let selection = window.getSelection();
            selection.removeAllRanges();
            let range = document.createRange();
            this.label.contentEditable = true;
            range.selectNodeContents(this.label);
            selection.addRange(range);
            this.label.focus();
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
            const tab = tabManager.getTab(this);
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
                        this.label.textContent = sanitizeText(this.label.textContent).substring(0, 30);
                        this.title = this.label.textContent.trim();
                        tabStore.set(`${idHelper.toTid(this)}.title`, this.title);
                        e.detail.tab;
                    },
                    paste: e => {
                        e.preventDefault();
                        if (this.label.contentEditable === true) {
                            this.label.textContent = sanitizeText(e.clipboardData.getData('text')).substring(0, 30);
                            return true;
                        }                    if (copyStore.length) {
                            cardCopy.paste(tab);
                        }
                    },
                    keyup: e => {
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
                if (e.button !== 0) {
                    return true;
                }
                if (e.target.isSameNode(this.closer)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    tabManager.handleRemoval(this, 'soft');
                    return false;
                }
                else {
                    tabManager.setActiveTab(this);
                    return false;
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
    const register$g = app => {
        TabHandle.prototype.app = app;
        customElements.get('tab-handle') || customElements['define']('tab-handle', TabHandle);
    };
    var TabHandle$1 = {
        register: register$g
    };

    class TabContent extends HTMLElement {
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            return self;
        }
    }
    const register$f = app => {
        TabContent.prototype.app = app;
        customElements.get('tab-content') || customElements['define']('tab-content', TabContent);
    };
    var TabContent$1 = {
        register: register$f
    };

    class TabPanel extends HTMLElement {
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
    const register$e = app => {
        TabPanel.prototype.app = app;
        customElements.get('tab-panel') || customElements['define']('tab-panel', TabPanel);
    };
    var TabPanel$1 = {
        register: register$e
    };

    const getFileName = () => {
        return `ghastly-creatures-${new Date().toISOString().substring(0,19).replace(/[T\:]/g, '-')}.json`;
    };
    const removeActiveKey = entry => {
        delete entry.active;
        return entry;
    };
    const getData = ({
        cidData,
        tidData
    } = {}) => {
        if (cidData) {
            let cid = idHelper.toCid(cidData);
            let card = cardStore.get(cid);
            let tid = idHelper.toTid(card);
            let tab = tabStore.get(tid);
            return {
                tabs: [tab].map(removeActiveKey),
                cards: [card]
            }
        }
        if (tidData) {
            return {
                cards: cardStore.values(['tid', '===', idHelper.toTid(tidData)]),
                tabs: tabStore.values(['tid', '===', idHelper.toTid(tidData)]).map(removeActiveKey)
            }
        }
        return {
            cards: cardStore.values(),
            tabs: tabStore.values().map(removeActiveKey)
        }
    };
    const getUrl = (fileName, {
        cidData,
        tidData
    } = {}) => {
        const data = [JSON.stringify(getData({
            cidData,
            tidData
        }))];
        return URL.createObjectURL(new File(
            data,
            fileName, {
                type: 'application/json',
            }
        ))
    };
    var exporter = {
        getFileName,
        getUrl
    };

    let dropArea;
    let app;
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    function handleUploads(files) {
        processFiles([...files]);
    }
    function handleDrop$1(e) {
        processFiles(e.dataTransfer.files);
    }
    function processFiles(files) {
        domProps.set('importState', 'working');
        files = Array.from(files).filter(file => !!file);
        const finished = [];
        for (let file of files) {
            finished.push(new Promise((resolve, reject) => {
                let reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsText(file);
            }));
        }
        Promise.all(finished).then(data => {
            app.trigger('uploadComplete', {
                data,
                tid: dropArea.tid,
            });
        }).catch(error => {
            console.error(error);
        });
    }
    function highlight(e) {
        e.target.classList.add('active');
    }
    function unhighlight(e) {
        e.target.classList.remove('active');
    }
    const assignEvents = () => {
        const evt1 = ['dragenter', 'dragover'];
        const evt2 = ['dragleave', 'drop'];
        evt1.concat(evt2).forEach(evt => {
            dropArea.addEventListener(evt, preventDefaults, false);
            document.body.addEventListener(evt, preventDefaults, false);
        });
        evt1.forEach(evt => {
            dropArea.addEventListener(evt, highlight, false);
        });
        evt2.forEach(evt => {
            dropArea.addEventListener(evt, unhighlight, false);
        });
        dropArea.addEventListener('drop', handleDrop$1, false);
    };
    const getDropArea = app => {
        let dropArea = src.$('file-upload');
        if (!dropArea) {
            dropArea = document.createElement('file-upload');
            app.after(dropArea);
        }
        return dropArea;
    };
    const init = (_app, tid) => {
        app = _app;
        let currentState = domProps.get('importState');
        if (!currentState) {
            domProps.set('importState', 'pristine');
        } else if (currentState === 'pristine') {
            domProps.unset('importState');
        }
        dropArea = getDropArea(app);
        delete dropArea.tid;
        if (tid) {
            dropArea.tid = tid;
        }
        assignEvents();
    };
    var uploader = {
        init,
        handleUploads
    };

    class TabMenu extends HTMLElement {
        connectedCallback() {
            const tab = tabManager.getTab(this.owner);
            const tid = idHelper.toTid(tab);
            const menu = src.ul({
                content: [
                    src.li({
                        content: 'Copy card style',
                        events: {
                            pointerup: e => {
                                if (e.button !== 0) {
                                    return true;
                                }
                                this.app.styleStorage = tab.styles;
                                domProps.set('styleStorage', true);
                            }
                        },
                    }),
                    src.li({
                        classNames: ['storage-dependent'],
                        data: {
                            storage: 'style'
                        },
                        content: 'Paste card style',
                        events: {
                            pointerup: e => {
                                if (e.button !== 0) {
                                    return true;
                                }
                                this.app.trigger('tabStyleChange', {
                                    tab,
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
                                    tab
                                });
                            }
                        },
                    }),
                    src.li({
                        classNames: ['context-separator','storage-dependent'],
                        content: 'Paste card',
                        data: {
                            storage: 'card'
                        },
                        events: {
                            pointerup: e => {
                                if (e.button !== 0) {
                                    return true;
                                }
                                cardCopy.paste(tab);
                            }
                        },
                    }),
                    src.li({
                        content: src.a({
                            content: 'Export cards from this tab',
                            events: {
                                pointerup: e => {
                                    if (e.button !== 0) {
                                        return true;
                                    }
                                    const fileName = exporter.getFileName();
                                    e.target.download = fileName;
                                    e.target.href = exporter.getUrl(fileName, {
                                        tidData: tab
                                    });
                                    setTimeout(() => {
                                        e.target.download = '';
                                        URL.revokeObjectURL(e.target.href);
                                    }, 200);
                                }
                            }
                        })
                    }),
                    src.li({
                        content: src.a({
                            content: 'Import cards into this tab',
                            events: {
                                pointerup: e => {
                                    if (e.button !== 0) {
                                        return true;
                                    }
                                    uploader.init(this.app, tid);
                                }
                            }
                        })
                    }),
                    src.li({
                        classNames: ['context-separator'],
                        content: 'Rename tab',
                        events: {
                            pointerup: e => {
                                if (e.button !== 0) {
                                    return true;
                                }
                                tab.makeEditable();
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
                                tabManager.handleRemoval(tab, 'soft');
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
                                tabManager.handleRemoval(tab, 'empty');
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
                                tabManager.handleRemoval(tab, 'others');
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
                                tabManager.handleRemoval(tab, 'all');
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
    const register$d = app => {
        TabMenu.prototype.app = app;
        customElements.get('tab-menu') || customElements['define']('tab-menu', TabMenu);
    };
    var TabMenu$1 = {
        register: register$d
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
    const register$c = app => {
        StyleEditor.prototype.app = app;
        customElements.get('style-editor') || customElements['define']('style-editor', StyleEditor);
    };
    var StyleEditor$1 = {
        register: register$c
    };

    var fonts$1 = [
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
            this.currentFont = styleStore.get(this.name);
            const selector = src.select({
                style: {
                    fontFamily: `var(${this.name})`
                },
                content: fonts$1.map(entry => {
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
                    styleStore.get(this.name);
                selector.selectedIndex = fonts$1.findIndex(e => e.family.replace(/['"]+/g) === value.replace(/['"]+/g));
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
    const register$b = app => {
        FontSelector.prototype.app = app;
        customElements.get('font-selector') || customElements['define']('font-selector', FontSelector);
    };
    var FontSelector$1 = {
        register: register$b
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
            this.value = parseFloat(styleStore.get(this.name) || 1.4, 10);
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
                    styleStore.get(this.name);
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
    const register$a = app => {
        FontSize.prototype.app = app;
        customElements.get('font-size') || customElements['define']('font-size', FontSize);
    };
    var FontSize$1 = {
        register: register$a
    };

    var backgrounds$1 = [
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

    var borders$1 = [
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
        backgrounds: backgrounds$1,
        borders: borders$1
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
            return styleStore.get(this.name) || '';
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
                    styleStore.get(this.name);
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
    const register$9 = app => {
        PatternSelector.prototype.app = app;
        customElements.get('pattern-selector') || customElements['define']('pattern-selector', PatternSelector);
    };
    var PatternSelector$1 = {
        register: register$9
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
                channels.push(styleStore.get(pattern + channel));
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
                        styleStore.get(input.name);
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
    const register$8 = app => {
        ColorSelector.prototype.app = app;
        customElements.get('color-selector') || customElements['define']('color-selector', ColorSelector);
    };
    var ColorSelector$1 = {
        register: register$8
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
                cardStore.set(this.character.cid, this.character);
            });
            this.on('visibilityChange', function (e) {
                this.character.visibility[e.detail.key][e.detail.field] = e.detail.value;
                cardStore.set(this.character.cid, this.character);
                this.trigger('afterVisibilityChange');
            });
            this.on('orderChange', function (e) {
                let props = {};
                e.detail.order.forEach(key => {
                    props[key] = this.character.props[key];
                });
                cardStore.set(`${this.character.cid}.props`, props);
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
                domProps.set('cardState', 'edit');
                this.classList.add('editable');
            });
            this.on('characterDone', function (e) {
                domProps.unset('cardState');
                this.classList.remove('editable');
            });
            this.on('keyup', e => {
                if (e.ctrlKey && ['x', 'c'].includes(e.key)) {
                    cardCopy[e.key === 'x' ? 'cut' : 'copy'](this);
                }
                if (e.key === 'Escape') {
                    cardCopy.clear(this);
                }
                if (e.key === 'Delete') {
                    cardManager.handleRemoval(this, 'soft');
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
    const register$7 = app => {
        CardBase.prototype.app = app;
        customElements.get('card-base') || customElements['define']('card-base', CardBase);
    };
    var CardBase$1 = {
        register: register$7
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
                return this.card.character.visibility[key][type] && !!this.card.character.props[key];
            }
            return this.card.character.visibility[key][type];
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
            const fieldEvents = {
                focus: e => handleDraggability(e, 'disable'),
                blur: e => handleDraggability(e, 'enable'),
                keyup: e => e.target.textContent = sanitizeText(e.target.textContent),
                paste: e => e.target.textContent = sanitizeText(e.target.textContent),
            };
            const entries = {
                label: src.th({
                    data: {
                        type: 'label'
                    },
                    attributes: {
                        contentEditable: true
                    },
                    content: this.card.character.labels[key],
                    events: fieldEvents
                }),
                element: src.td({
                    data: {
                        type: 'text'
                    },
                    attributes: {
                        contentEditable: true
                    },
                    content: this.card.character.props[key],
                    events: fieldEvents
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
                                        content: labelStore.get('img.long')
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
                        domProps.toggle(field, row);
                        const value = domProps.get(field, row);
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
    const register$6 = app => {
        CardForm.prototype.app = app;
        customElements.get('card-form') || customElements['define']('card-form', CardForm);
    };
    var CardForm$1 = {
        register: register$6
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
    const register$5 = app => {
        CardRecto.prototype.app = app;
        customElements.get('card-recto') || customElements['define']('card-recto', CardRecto);
    };
    var CardRecto$1 = {
        register: register$5
    };

    class CardToolbar extends HTMLElement {
        connectedCallback() {
            const doneBtn = src.button({
                attributes: {
                    type: 'button',
                    name: 'done'
                },
                content: [
                    'Done'
                ],
                events: {
                    pointerup: e => {
                        this.card.trigger('characterDone');
                    }
                }
            });
            const exportBtn = src.a({
                classNames: ['button'],
                content: [
                    'Export'
                ],
                events: {
                    pointerup: e => {
                        if (e.button !== 0) {
                            return true;
                        }
                        const fileName = exporter.getFileName();
                        e.target.download = fileName;
                        e.target.href = exporter.getUrl(fileName, {
                            cidData: this.card
                        });
                        setTimeout(() => {
                            e.target.download = '';
                            URL.revokeObjectURL(e.target.href);
                        }, 200);
                    }
                }
            });
            const cutBtn = src.button({
                attributes: {
                    type: 'button'
                },
                content: [
                    'Cut'
                ],
                events: {
                    pointerup: e => {
                        if (e.button !== 0) {
                            return true;
                        }
                        this.card.trigger('characterCut');
                    }
                }
            });
            const copyBtn = src.button({
                attributes: {
                    type: 'button'
                },
                content: [
                    'Copy'
                ],
                events: {
                    pointerup: e => {
                        if (e.button !== 0) {
                            return true;
                        }
                        this.card.trigger('characterCopy');
                    }
                }
            });
            const deleteBtn = src.button({
                attributes: {
                    type: 'button'
                },
                content: [
                    'Delete'
                ],
                events: {
                    pointerup: e => {
                        if (e.button !== 0) {
                            return true;
                        }
                        this.card.trigger('characterRemove');
                    }
                }
            });
            const editBtn = src.button({
                attributes: {
                    type: 'button'
                },
                content: [
                    'Edit'
                ],
                events: {
                    pointerup: e => {
                        if (e.button !== 0) {
                            return true;
                        }
                        this.card.trigger('characterEdit');
                    }
                }
            });
            this.append(doneBtn, deleteBtn, exportBtn, cutBtn, copyBtn, editBtn);
        }
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            return self;
        }
    }
    const register$4 = app => {
        CardToolbar.prototype.app = app;
        customElements.get('card-toolbar') || customElements['define']('card-toolbar', CardToolbar);
    };
    var CardToolbar$1 = {
        register: register$4
    };

    class CardVerso extends HTMLElement {
        isVisible(key, type) {
            return this.card.character.visibility[key][type] && !!this.card.character.props[key];
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
    const register$3 = app => {
        CardVerso.prototype.app = app;
        customElements.get('card-verso') || customElements['define']('card-verso', CardVerso);
    };
    var CardVerso$1 = {
        register: register$3
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
    const register$2 = () => {
        customElements.get('undo-dialog') || customElements['define']('undo-dialog', UndoDialog);
    };
    var UndoDialog$1 = {
        register: register$2
    };

    class ImportExport extends HTMLElement {
        connectedCallback() {
            const listing = src.div({
                classNames: ['import-export-menu'],
                content: [
                    src.a({
                        attributes: {
                            download: '',
                        },
                        content: 'Export cards',
                        events: {
                            pointerup: e => {
                                if (e.button !== 0) {
                                    return true;
                                }
                                const fileName = exporter.getFileName();
                                e.target.download = fileName;
                                e.target.href = exporter.getUrl(fileName);
                                setTimeout(() => {
                                    e.target.download = '';
                                    URL.revokeObjectURL(e.target.href);
                                }, 200);
                            }
                        }
                    }),
                    src.a({
                        attributes: {
                            download: true
                        },
                        content: 'Import cards',
                        events: {
                            pointerup: e => {
                                if (e.button !== 0) {
                                    return true;
                                }
                                uploader.init(this.app);
                            }
                        }
                    })
                ]
            });
            document.addEventListener('keyup', e => {
                if (e.key === 'Escape' && domProps.get('importState') === 'pristine') {
                    domProps.unset('importState');
                }
            });
            this.append(listing);
        }
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            return self;
        }
    }
    const register$1 = app => {
        ImportExport.prototype.app = app;
        customElements.get('import-export') || customElements['define']('import-export', ImportExport);
    };
    var ImportExport$1 = {
        register: register$1
    };

    let cardQuarantine;
    let tabQuarantine;
    const sanitizeObject = (modelData, uploadedData) => {
        const sanitized = {};
        Object.keys(modelData).forEach(key => {
            sanitized[key] = uploadedData[key];
        });
        return sanitized;
    };
    const quarantineCards = uploadedCards => {
        uploadedCards.forEach(card => {
            const model = cardQuarantine.getBlank();
            model.originalTid = idHelper.toTid(card.tid);
            ['props', 'labels', 'visibility'].forEach(type => {
                model[type] = sanitizeObject(model[type], card[type]);
            });
            cardQuarantine.set(model.cid, model);
        });
    };
    const quarantineTabs = uploadedTabs => {
        uploadedTabs.forEach(tab => {
            const model = tabQuarantine.getBlank();
            model.originalTid = tab.tid;
            model.styles = sanitizeObject(model.styles, (tab.styles || {}));
            if (!(/^[CDILMVX]+$/.test(tab.title))) {
                model.title = tab.title;
            }
            tabQuarantine.set(model.tid, model);
        });
    };
    const updateCardTids = (tab, tid) => {
        const condition = !tid ? ['originalTid', '===', idHelper.toTid(tab.originalTid)] : undefined;
        for (let [cid, card] of cardQuarantine.entries(condition)) {
            delete card.originalTid;
            card.tid = tid || idHelper.toTid(tab);
            cardQuarantine.set(cid, card);
        }
        if (!tid) {
            tabQuarantine.unset(`${tab.tid}.originalTid`);
        }
    };
    const structureIsValid = data => {
        const keys = Object.keys(data);
        return keys.includes('tabs') &&
            keys.includes('cards') &&
            Array.isArray(data.tabs) &&
            Array.isArray(data.cards) &&
            data.tabs.length &&
            data.cards.length
    };
    const process = (dataArr, tid) => {
        dataArr = dataArr.map(e => JSON.parse(e));
        for (let i = 0; i < dataArr.length; i++) {
            if (!structureIsValid(dataArr[i])) {
                dataArr.splice(i, 1);
                console.error(`Invalid import data found`);
            }
        }
        if (!dataArr.length) {
            console.error(`No valid import data found, aborting`);
            domProps.unset('importState');
            return false;
        }
        if (!cardQuarantine) {
            cardQuarantine = new CharTree({
                data: {},
                minIncrement: cardStore.nextIncrement()
            });
        }
        if (!tid && !tabQuarantine) {
            tabQuarantine = new TabTree({
                data: {},
                minIncrement: tabStore.nextIncrement()
            });
        }
        dataArr.forEach(data => {
            if (tid) {
                data.cards.map(card => {
                    card.tid = tid;
                    return card;
                });
                quarantineCards(data.cards);
                updateCardTids(tabStore.get(tid), tid);
            }
            else {
                quarantineCards(data.cards);
                quarantineTabs(data.tabs);
                tabQuarantine.values().forEach(tab => {
                    updateCardTids(tab);
                    tabManager.add(tab);
                });
            }
            cardQuarantine.values().forEach(card => {
                cardManager.add(card);
            });
            cardQuarantine.flush();
            if (tabQuarantine && !tid) {
                tabQuarantine.flush();
            }
            domProps.unset('importState');
        });
    };
    var importer = {
        process
    };

    class FileUpload extends HTMLElement {
        connectedCallback() {
            const spinner = src.div({
                classNames: ['spinner'],
                content: src.svg({
                    isSvg: true,
                    content: src.use({
                        isSvg: true,
                        attributes: {
                            href: 'media/icons.svg#icon-axe'
                        }
                    })
                })
            });
            const label = src.label({
                content: [
                    src.span({
                        classNames: ['button'],
                        content: 'select'
                    }),
                    src.input({
                        attributes: {
                            type: 'file',
                            multiple: true,
                            accept: 'application/json'
                        },
                        events: {
                            change: e => {
                                uploader.handleUploads(e.target.files);
                            }
                        }
                    })
                ]
            });
            const uploadForm = src.form({
                content: [
                    src.p({
                        content: ['Drop or ', label, ' your Ghastly Creatures files']
                    })
                ]
            });
            this.app.on('uploadComplete', e => {
                importer.process(e.detail.data, e.detail.tid);
            });
            this.append(uploadForm, spinner);
        }
        constructor(self) {
            self = super(self);
            self.on = on;
            self.trigger = trigger;
            return self;
        }
    }
    const register = app => {
        FileUpload.prototype.app = app;
        customElements.get('file-upload') || customElements['define']('file-upload', FileUpload);
    };
    var FileUpload$1 = {
        register
    };

    var css = {
    	entryPoint: "src/css/main.css",
    	"public": "public/css/main.css"
    };
    var cssProps = {
    	src: "src/css/inc/card-defs.css",
    	target: "src/data/css-props.json"
    };
    var fonts = {
    	src: "src/data/raw/fonts.txt",
    	target: "src/data/fonts.json"
    };
    var backgrounds = {
    	src: "public/media/patterns/backgrounds",
    	target: "src/data/backgrounds.json"
    };
    var borders = {
    	src: "public/media/patterns/borders",
    	target: "src/data/borders.json"
    };
    var characters = {
    	src: "src/data/raw/monsters.json",
    	target: "public/js/characters.json",
    	url: "js/characters.json"
    };
    var fields = {
    	src: "src/config/field-config.yml"
    };
    var labels = {
    	target: "src/data/labels.json"
    };
    var visibility = {
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
    	cssProps: cssProps,
    	fonts: fonts,
    	backgrounds: backgrounds,
    	borders: borders,
    	characters: characters,
    	fields: fields,
    	labels: labels,
    	visibility: visibility,
    	js: js,
    	storageKeys: storageKeys,
    	userCharacters: userCharacters
    };

    class App extends HTMLElement {
        connectedCallback() {
            const settings = new Tree({
                data: config
            });
            const launchData = {
                tabs: JSON.parse(localStorage.getItem(settings.get('storageKeys.tabs')) || '{}'),
                system: {},
                stored: JSON.parse(localStorage.getItem(settings.get('storageKeys.cards')) || '{}'),
                settings
            };
            fetch(settings.get('characters.url'))
                .then(response => response.json())
                .then(data => {
                    data.forEach((props, cid) => {
                        launchData.system[cid] = {
                            cid,
                            props
                        };
                    });
                    initStorage(launchData);
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
                        ImportExport$1,
                        FileUpload$1,
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
