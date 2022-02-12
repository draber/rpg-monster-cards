let dragSrcEl = null;

function handleDragStart(e) {
    e.stopPropagation()
    // Target (this) element is the source node.
    dragSrcEl = this;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);

    this.classList.add('dragElem');
    this.parentElement.classList.add('dragging')
}

function handleDragOver(e) {
    e.preventDefault(); // Necessary. Allows us to drop.
    this.classList.add('dragover');

    e.dataTransfer.dropEffect = 'move'; // See the section on the DataTransfer object.

    return false;
}

function handleDragEnter(e) {
    // this / e.target is the current hover target.
}

function handleDragLeave(e) {
    this.classList.remove('dragover'); // this / e.target is previous target element.
}

function handleDrop(e) {
    e.stopPropagation();
    if (!dragSrcEl.isSameNode(this)) {
        this.after(dragSrcEl);
    }
    this.classList.remove('dragover');
    return false;
}

function handleDragEnd(e) {
    // this/e.target is the source node.
    this.classList.remove('dragover');
    // this.classList.remove('dragElem');
    this.parentElement.classList.remove('dragging');
}

const handles = {
    dragstart: handleDragStart,
    dragenter: handleDragEnter,
    dragover: handleDragOver,
    dragleave: handleDragLeave,
    drop: handleDrop,
    dragend: handleDragEnd,
}

function toggle(elem, state) {
    const action = state ? 'addEventListener' : 'removeEventListener';
    elem.draggable = state;
    for (let [evt, fn] of Object.entries(handles)) {
        elem[action](evt, fn, false);
    }
}

function enable(elem) {
    return toggle(elem, true);
}

function disable(elem) {
    return toggle(elem, false);
}

export default {
    toggle,
    enable,
    disable
};