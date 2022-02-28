const decode = data => {
    const re = /^data\:((?<mime>[a-z]+\/[^;,]+))?((?:;)charset=(?<charset>[^;,]+))?((?:;)(?<base64>([^,]+)))?,(?<data>[\S]+)$/;
    const parsed = data.match(re);
    if (!parsed || !parsed.groups) {
        throw `${data} is not a valid data URI`;
    }
    if (groups.base64) {
        return decodeURIComponent(atob(groups.data))
    }
    return decodeURIComponent(groups.data);
}

const encode = (data, {
    mime,
    charset,
    base64
} = {})=>{
    if(base64){
        base64 = 'base64';
        data = btoa(encodeURIComponent(data))
    }
    else {
        data = encodeURIComponent(data)
    }
    if(charset) {
        charset = `charset=${charset}`;
    }
    return `data:${Object.values({
        mime,
        charset,
        base64
    }).filter(e => !!e).join(';')},${data}`;
}

export default {
    encode,
    decode
}