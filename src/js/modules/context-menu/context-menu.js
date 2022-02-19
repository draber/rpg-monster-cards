let current;

let firstUse = true;

const handleFirstUse = () => {
    if (firstUse) {
        document.addEventListener('pointerdown', e => {
            if (current && !e.target.closest('[data-context-menu="true"]')) {
                current.remove();
            }
        })
    }
    firstUse = false;
}

const getPosition = e => {
    const menuXY = {
        x: current.offsetWidth,
        y: current.offsetHeight
    }
    const screenXY = {
        x: screen.availWidth,
        y: screen.availHeight
    }
    const mouseXY = {
        x: e.pageX,
        y: e.pageY,
    }
    const offset = 8; // about half the cursor size to move menu towards cursor center
    const style = {
        x: (mouseXY.x + menuXY.x - offset) <= screenXY.x ? mouseXY.x - offset : mouseXY.x - menuXY.x + offset,
        y: (mouseXY.y + menuXY.y - offset) <= screenXY.y ? mouseXY.y - offset : mouseXY.y - menuXY.y + offset,
    }
    return {
        left: style.x + 'px',
        top: style.y + 'px'
    }
}

const launch = (e, menu) => {
    e.preventDefault();
    current = menu;
    document.body.append(current);
    Object.assign(current.style, getPosition(e));
}

const register = (owner, menu) => {
    menu.dataset.contextMenu = true;
    handleFirstUse();
    owner.addEventListener('contextmenu', e => {
        e.preventDefault();
        launch(e, menu);
    })
}

export default {
    register
};