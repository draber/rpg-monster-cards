const tracksToValueObj = tracks => {
    const obj = {};
    for (let [channel, track] of Object.entries(tracks)) {
        obj[channel] = track.value;
    }
    return obj;
}

const trackToChannelStr = track => {
    return (Math.round(track.value * 10000) / 10000) + track.unit;
}

const tracksToColorStr = (tracks, type) => {
    const c = [];
    Object.values(tracks).forEach(track => {        
        c.push(trackToChannelStr(track));
    })
    return c.length === 4 ? `${type}(${c[0]} ${c[1]} ${c[2]} / ${c[3]})` : `${type}(${c[0]} ${c[1]} ${c[2]})`
}

export default {
    tracksToValueObj,
    tracksToColorStr,
    trackToChannelStr
}