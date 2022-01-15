import fn from 'fancy-node';
import {
    objectByKeySort,
    arraySort
} from '../../modules/sorter/sorter.js';
import {
    resolveFraction
} from '../../modules/fractions/fractions.js';
import events from './events.js';



const order = (monsters, {
    groupBy = 'category',
    sortBy = 'name',
    groupDirection = 'asc',
    sortDirection = 'asc'
}={}) => {
    let grouped = {};
    monsters.forEach(monster => {
        grouped[monster[groupBy]] = grouped[monster[groupBy]] || [];
        grouped[monster[groupBy]].push(monster)
    });
    grouped = objectByKeySort(grouped, groupDirection);
    for (let [key, values] of Object.entries(grouped)) {
        grouped[key] = arraySort(values, sortBy, sortDirection);
    }
    return grouped;

}

const buildMonsterList = (monsters, {
    groupBy = 'category',
    sortBy = 'name',
    groupDirection = 'asc',
    sortDirection = 'asc'
}={}) => {
    const monsterList = new DocumentFragment();
    let counter = 0;
    const orderedMonsters = order(monsters, {
        groupBy,
        sortBy,
        groupDirection,
        sortDirection
    });
    for (let [key, values] of Object.entries(orderedMonsters)) {
        const list = fn.ul();
        monsterList.append(fn.details({
            attributes: {
                open: counter === 0
            },
            content: [
                fn.summary({
                    content: key
                }),
                list
            ]
        }))
        values.forEach(value => {
            list.append(fn.li({
                content: [
                    fn.button({
                        attributes: {
                            type: 'button'
                        },
                        data: {
                            id: value.id
                        },
                        content: value.name
                    }),
                    fn.span({
                        content: resolveFraction(value.cr)
                    })

                ]
            }))
        })
        counter++;
    }
    return monsterList;
}

export default buildMonsterList;