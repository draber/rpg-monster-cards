const group = (dataObj, direction = 'asc') => {
    let keys = sort(Object.keys(dataObj));
    if (direction === 'desc') {
        keys = keys.reverse()
    }
    return keys.reduce((result, key) => {
        result[key] = dataObj[key];
        return result;
    }, {});
}


const sort = (dataArr, sortBy = null, direction = 'asc') => {
    return dataArr.sort((a, b) => {
        a = sortBy ? a[sortBy] : a;
        b = sortBy ? b[sortBy] : b;
        if(!isNaN(a) && !isNaN(b)){
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
}

export default {
    group,
    sort
};