// polyfill for structuredClone()
// this is currently bleeding edge
// it works in all major browsers but only if they are up-to-date
// note that this polyfill is very superficial 
// but gets the job done for most use cases
export const deepClone = obj => {
    return !(structuredClone instanceof Function) ? JSON.parse(JSON.stringify(obj)) : structuredClone(obj);
}
