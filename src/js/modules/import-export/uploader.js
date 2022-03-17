/**
 * File uploader, heavily based on https://codepen.io/joezimjs/pen/yPWQbd
 */

import domProps from "../dom-props/dom-props.js";
import fn from 'fancy-node';

let dropArea;
let app;

/**
 * Shortcut to stop default action and bubbling
 * @param {Event} e 
 */
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

/**
 * Process files that are uploaded via input
 * @param {Files} files 
 */
function handleUploads(files) {
    processFiles([...files])
}

/**
 * Process files that are uploaded via drag and drop
 * @param {Event} e 
 */
function handleDrop(e) {
    processFiles(e.dataTransfer.files)
}

/**
 * Handle the files from either drag/drop or form field
 * @param {Object} files 
 */
function processFiles(files) {
    console.log(files)
    domProps.set('importState', 'working');

    // this could also filter all files that exceed a certain size 
    files = Array.from(files).filter(file => !!file);

    const finished = []

    for (let file of files) {
        finished.push(new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(file);
        }))
    }
    Promise.all(finished).then(data => {
        app.trigger('uploadComplete', {
            data,
            tid: dropArea.tid,
        });
    }).catch(error => {
        console.error(error)
    });
}

/**
 * Add highlighting on dragover etc.
 * @param {Event} e 
 */
function highlight(e) {
    e.target.classList.add('active');
}

/**
 * Remove the highlighting
 * @param {Event} e 
 */
function unhighlight(e) {
    e.target.classList.remove('active');
}

/**
 * Assign all drag/drop related events to the drop area
 */
const assignEvents = () => {

    const evt1 = ['dragenter', 'dragover'];
    const evt2 = ['dragleave', 'drop'];

    evt1.concat(evt2).forEach(evt => {
        dropArea.addEventListener(evt, preventDefaults, false);
        document.body.addEventListener(evt, preventDefaults, false);
    })

    evt1.forEach(evt => {
        dropArea.addEventListener(evt, highlight, false);
    })

    evt2.forEach(evt => {
        dropArea.addEventListener(evt, unhighlight, false);
    })

    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);
}

/**
 * Build the file upload widget or use the already existing one
 * @param {HTMLElement} app 
 * @returns HTMLElement
 */
const getDropArea = app => {
    let dropArea = fn.$('file-upload');
    if (!dropArea) {
        dropArea = document.createElement('file-upload');
        app.after(dropArea);
    }
    return dropArea;
}

/**
 * Build/activate the drop area
 * @param {HTMLElement} app 
 * @param {Integer} tid 
 */
const init = (_app, tid) => {
    app = _app;
    let currentState = domProps.get('importState');
    if (!currentState) {
        domProps.set('importState', 'pristine');
    } else if (currentState === 'pristine') {
        domProps.unset('importState');
    }
    // else do nothing because the process has already started

    dropArea = getDropArea(app);
    delete dropArea.tid;
    if (tid) {
        dropArea.tid = tid;
    }
    assignEvents();
}

export default {
    init,
    handleUploads
};