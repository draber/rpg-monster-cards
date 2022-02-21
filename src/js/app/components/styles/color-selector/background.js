import format from './format.js';


const update = (type, tracks) => {

    for (let [channel, track] of Object.entries(tracks)) {
        let original = track.value;
        let steps = ['to right'];
        let range = track.max - track.min;
        let increment = range / 10;
        for (let i = track.min; i < track.max; i += increment) {
            tracks[channel].value = i;
            steps.push(format.tracksToColorStr(tracks, type))
        }
        tracks[channel].value = original;
        track.element.style.background = `linear-gradient(${steps.join(',')})`;
    }
}

export default {
    update
}