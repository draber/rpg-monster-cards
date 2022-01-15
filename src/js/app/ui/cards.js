import fn from 'fancy-node';
import {
    resolveFraction
} from '../../modules/fractions/fractions.js';


let monsters;
let area;
let smoke;

let autoincrement = 0;

const edit = e => {
    const card = e.target.closest('article');
    card.classList.add('edit');
    fn.$$('value', card).forEach(field => {
        field.contentEditable = true;
    })
}

const remove = id => {

}

const createBadge = monster => {
    return fn.figcaption({
        classNames: ['badge'],
        content: monster.name
    })
}

const createRecto = monster => {
    return fn.figure({
        classNames: ['𝔎𝔬𝔫𝔱𝔢𝔯𝔣𝔢𝔦'],
        content: [
            fn.img({
                attributes: {
                    src: monster.img,
                    alt: monster.name
                }
            }),
            createBadge(monster)
        ]
    })
}

const createNotes = monster => {
    if (!monster.notes) {
        return '';
    }
    let notesArr = monster.notes.split(',').map(entry => entry.trim());
    let listArr = notesArr.filter(entry => /[a-zA-Z\s]+(\+|-)?\d+/.test(entry));
    if (listArr.length !== notesArr.length) {
        return monster.notes;
    }
    return fn.ul({
        content: notesArr.map(entry => fn.li({
            content: entry
        }))
    })
}

const createValueParts = (monster, parts) => {
    return parts.map(entry => {
        return fn.span({
            classNames: ['value-part'],
            content: monster[entry],
            data: {
                src: entry
            }
        })
    })
}

const createVersoData = monster => {
    return fn.tbody({
        content: [
            // row 1: AC, HP
            fn.tr({
                content: [
                    fn.td({
                        content: 'AC'
                    }),
                    fn.td({
                        classNames: ['value'],
                        content: monster.ac
                    }),
                    fn.td({
                        content: 'HP'
                    }),
                    fn.td({
                        classNames: ['value'],
                        content: monster.hp
                    }),
                    fn.td({
                        classNames:['disable-row'],
                        content: fn.input({
                            attributes: {
                                type: 'checkbox',
                                checked: true
                            }
                        })
                    }),
                ]
            }),
            // row 2: Attack
            fn.tr({
                content: [
                    fn.td({
                        content: 'Attack'
                    }),
                    fn.td({
                        classNames: ['value'],
                        attributes: {
                            colSpan: 3
                        },
                        content: monster.attack_parameters
                    }),
                    fn.td({
                        classNames:['disable-row'],
                        content: fn.input({
                            attributes: {
                                type: 'checkbox',
                                checked: true
                            }
                        })
                    }),
                ]
            }),

            // row 3: Saves
            fn.tr({
                content: [
                    fn.td({
                        content: 'Saves'
                    }),
                    fn.td({
                        attributes: {
                            colSpan: 3
                        },
                        classNames: ['value'],
                        content: createValueParts(monster, ['fort', 'reflex', 'will'])
                    }),
                    fn.td({
                        classNames:['disable-row'],
                        content: fn.input({
                            attributes: {
                                type: 'checkbox',
                                checked: true
                            }
                        })
                    }),
                ]
            }),

            // row 4: stats
            fn.tr({
                content: [
                    fn.td({
                        content: 'Stats'
                    }),
                    fn.td({
                        attributes: {
                            colSpan: 3
                        },
                        classNames: ['value'],
                        content: createValueParts(monster, ['str', 'dex', 'con', 'int', 'wis', 'cha'])
                    }),
                    fn.td({
                        classNames:['disable-row'],
                        content: fn.input({
                            attributes: {
                                type: 'checkbox',
                                checked: true
                            }
                        })
                    }),
                ]
            }),

            // row 5: Init, Speed
            fn.tr({
                content: [
                    fn.td({
                        content: 'Init'
                    }),
                    fn.td({
                        classNames: ['value'],
                        content: monster.initiative_bonus
                    }),
                    fn.td({
                        content: 'Speed'
                    }),
                    fn.td({
                        classNames: ['value'],
                        content: `${monster.speed} feet`
                    }),
                    fn.td({
                        classNames:['disable-row'],
                        content: fn.input({
                            attributes: {
                                type: 'checkbox',
                                checked: true
                            }
                        })
                    }),
                ]
            }),

            // row 6: Notes
            fn.tr({
                content: [
                    fn.td({
                        attributes: {
                            colSpan: 4
                        },
                        classNames: ['long-text'],
                        content: createNotes(monster)
                    }),
                    fn.td({
                        classNames:['disable-row'],
                        content: fn.input({
                            attributes: {
                                type: 'checkbox',
                                checked: true
                            }
                        })
                    }),
                ]
            }),
        ]
    })
}

const createVerso = monster => {
    return fn.figure({
        classNames: ['𝔈𝔦𝔤𝔢𝔫𝔱ü𝔪𝔩𝔦𝔠𝔥𝔨𝔢𝔦𝔱𝔢𝔫'],
        content: [fn.table({
                content: [
                    createVersoData(monster)
                ]
            }),
            fn.div({
                classNames: ['badge', 'cr'],
                content: resolveFraction(monster.cr, 2)
            }),
            createBadge(monster)
        ]
    })
}


const createToolbar = monster => {
    return fn.div({
        classNames: ['toolbar'],
        content: [
            fn.button({
                attributes: {
                    type: 'button'
                },
                content: [
                    'Eradicate',
                    fn.svg({
                        isSvg: true,
                        content: fn.use({
                            isSvg: true,
                            attributes: {
                                href: 'media/icons.svg#icon-axe'
                            }
                        })
                    })
                ],
                events: {
                    pointerdown: () => {
                        remove(autoincrement)
                    }
                }
            }),

            fn.button({
                attributes: {
                    type: 'button'
                },
                content: [
                    'Mutate',
                    fn.svg({
                        isSvg: true,
                        content: fn.use({
                            isSvg: true,
                            attributes: {
                                href: 'media/icons.svg#icon-quill'
                            }
                        })
                    })
                ],
                events: {
                    pointerdown: e => {
                        edit(e)
                    }
                }
            })
        ]
    })
}

const createCard = monster => {
    return fn.article({
        classNames: ['𝔘𝔫𝔥𝔬𝔩𝔡'],
        content: [
            createRecto(monster),
            createVerso(monster),
            createToolbar(monster)
        ]
    })
}

const create = id => {
    smoke.pause();
    smoke.currentTime = 0;
    smoke.play();

    const monster = monsters.find(entry => entry.id === id);

    const container = fn.div({
        classNames: ['card-container', 'summon']
    })

    const card = createCard(monster);

    container.append(card);

    area.append(container);
    autoincrement++;
}

const init = (data = {
    monsters,
    area,
    smoke
}) => {
    monsters = data.monsters;
    area = data.area;
    smoke = data.smoke
}

export default {
    init,
    create,
    remove,
    edit
}