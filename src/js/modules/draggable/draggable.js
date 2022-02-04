import fn from 'fancy-node';

let dragSrcEl = null;

function handleDragStart(e) {
    e.stopPropagation()
    console.log({d:e.target.draggable , c:e.target.contentEditable, n:e.target.nodeName})
    // Target (this) element is the source node.
    dragSrcEl = this;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);

    this.classList.add('dragElem');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }
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

    /*[].forEach.call(cols, function (col) {
      col.classList.remove('dragover');
    });*/
}

function enableDnD(elem) {
    elem.addEventListener('dragstart', handleDragStart, true);
    elem.addEventListener('dragenter', handleDragEnter, false)
    elem.addEventListener('dragover', handleDragOver, false);
    elem.addEventListener('dragleave', handleDragLeave, false);
    elem.addEventListener('drop', handleDrop, false);
    elem.addEventListener('dragend', handleDragEnd, false);
}

const init = container => {
    fn.$$('[draggable]', container).forEach(elem => {
        enableDnD(elem)
    })
}

export default {
    init
};