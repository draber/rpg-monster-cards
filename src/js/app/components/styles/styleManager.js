const setStyles = (styles, target) => {
    Object.values(styles).forEach(style => {
        for(let [prop, value] of Object.entries(style)) {
            target.style.setProperty(prop, value);
        }
    }) 
}

export default {
    setStyles
}