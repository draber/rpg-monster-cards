export function objectByKeySort(dataObj, direction = 'asc') {
    let keys = Object.keys(dataObj).sort();
    if (direction === 'desc') {
        keys = keys.reverse()
    }
    return keys.reduce(function (result, key) {
        result[key] = dataObj[key];
        return result;
    }, {});
}

export function arraySort(dataArr, sortBy=null , direction = 'asc') {
    return dataArr.sort((a, b) => {
        a = sortBy ? a[sortBy] : a;
        b = sortBy ? b[sortBy] : b;
        if (a > b) {
            return direction === 'asc' ? 1 : -1;
        }
        if (a < b) {
            return direction === 'asc' ? -1 : 1;
        }
        return 0;
    })
}