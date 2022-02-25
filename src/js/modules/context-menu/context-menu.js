let firstRegistration = true;

const getPosition = (e, menu) => {
    const menuXY = {
        x: menu.offsetWidth,
        y: menu.offsetHeight
    }
    const screenXY = {
        x: screen.availWidth,
        y: screen.availHeight
    }
    const mouseXY = {
        x: e.pageX,
        y: e.pageY,
    }
    const style = {
        x: (mouseXY.x + menuXY.x) <= screenXY.x ? mouseXY.x : mouseXY.x - menuXY.x,
        y: (mouseXY.y + menuXY.y) <= screenXY.y ? mouseXY.y : mouseXY.y - menuXY.y,
    }
    return {
        left: style.x + 'px',
        top: style.y + 'px'
    }
}




function onContextMenu(e) {
    e.preventDefault();
    this.contextMenu.show(e);
}



function offContextMenu(e) {
    const menu = document.querySelector('[data-type="context-menu"]:not([hidden])');
    if(menu){
        menu.hide()
    }
}

const init = () => {
    if(firstRegistration) {
        document.addEventListener('pointerup', offContextMenu);
        firstRegistration = false;
    }
}


const unregister = owner => {
    owner.contextMenu.remove();
}

const register = (owner, menu) => {
    init();
    menu.setAttribute('aria-role', 'menu');
    menu.dataset.type = 'context-menu';
    owner.contextMenu = menu;
    menu.owner = owner;
    
    menu.show = e => {
        Object.assign(menu.style, getPosition(e, menu));
        menu.removeAttribute('hidden');
        if(!menu.isConnected){
            document.body.append(menu);
        }
    }
 
    menu.hide = () => {        
        menu.hidden =true;
    }

    owner.addEventListener('contextmenu', onContextMenu)

    return menu;
}

export default {
    register,
    unregister
};