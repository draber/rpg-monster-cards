/**
 * Retrieve the CID from either a DOM card or character or a {String|Number} CID 
 * @param {HTMLElement|Entry|String|Number} cidData 
 * @returns 
 */
const toCid = cidData => {
    const cid = cidData.cid || cidData;
    if (isNaN(cid)) {
        throw `${cid} is not a valid character identifier`;
    }
    return parseInt(cid, 10);
}

/**
 * Retrieve the TID from either a DOM tab or a {String|Number} TID 
 * @param {HTMLElement|Entry|String|Number} tidData 
 * @returns 
 */
const toTid = tidData => {
    const tid = tidData.tid || tidData;
    if (isNaN(tid)) {
        throw `${tid} is not a valid tab identifier`;
    }
    return parseInt(tid, 10);
}

export default {
    toCid,
    toTid
}