/**
 * File uploader, heavily based on https://codepen.io/joezimjs/pen/yPWQbd
 */

import properties from "../properties/properties.js";

let dropArea;

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

function processFiles(files) {
    properties.set('importState', 'working');

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
        dropArea.dispatchEvent(
            new CustomEvent(
                'uploadComplete', {
                    detail: data
                }
            )
        );
    }).catch(error => {
        console.error(error.message)
    });
}

function highlight(e) {
    e.target.classList.add('active');
}

function unhighlight(e) {
    e.target.classList.remove('active');
}


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

const init = _dropArea => {
    dropArea = _dropArea
    assignEvents();
}

export default {
    init,
    handleUploads
};