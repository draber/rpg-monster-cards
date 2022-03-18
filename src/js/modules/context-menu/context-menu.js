let firstRegistration = true;

/**
 * Calculate the menu position
 * @param {MouseEvent} e 
 * @param {HTMLElement} menu 
 * @returns {Object}
 */
const getPosition = (e, menu) => {
    const menuXY = {
        x: parseInt(menu.dataset.width, 10),
        y: parseInt(menu.dataset.height, 10),
    }
    const screenXY = {
        x: window.innerWidth,
        y: window.innerHeight
    }
    const mouseXY = {
        x: e.pageX,
        y: e.pageY,
    }
    const style = {
        x: (mouseXY.x + menuXY.x) <= screenXY.x ? mouseXY.x : mouseXY.x - menuXY.x,
        y: (mouseXY.y + menuXY.y) <= screenXY.y ? mouseXY.y : mouseXY.y - menuXY.y,
    }

    console.log({menuXY, screenXY, mouseXY})

    return {
        left: style.x + 'px',
        top: style.y + 'px'
    }
}

/**
 * Show the menu
 * @param {MouseEvent} e 
 */
function onContextMenu(e) {
    e.preventDefault();
    this.contextMenu.show(e);
}

/**
 * Hide the menu
 * @param {MouseEvent} e 
 */
function offContextMenu(e) {
    const menu = document.querySelector('[data-type="context-menu"]:not([hidden])');
    if (menu) {
        menu.hide()
    }
}

/**
 * Register the menu
 */
const init = () => {
    if (firstRegistration) {
        document.addEventListener('pointerup', offContextMenu);
        firstRegistration = false;
    }
}


const unregister = owner => {
    owner.contextMenu.remove();
}

/**
 * Register and add the menu
 * @param {HTMLElement} owner 
 * @param {HTMLElement} menu 
 * @returns 
 */
const register = (owner, menu) => {
    init();
    menu.setAttribute('aria-role', 'menu');
    menu.dataset.type = 'context-menu';
    owner.contextMenu = menu;
    menu.owner = owner;

    menu.show = e => {
        menu.removeAttribute('hidden');
        if (!menu.isConnected) {
            document.body.append(menu);
            // on first appearance measure the menu to ensure correct positioning
            menu.dataset.width = menu.offsetWidth
            menu.dataset.height = menu.offsetHeight;
        }
        Object.assign(menu.style, getPosition(e, menu));
    }

    menu.hide = () => {
        menu.hidden = true;
    }

    owner.addEventListener('contextmenu', onContextMenu)

    return menu;
}

export default {
    register,
    unregister
};