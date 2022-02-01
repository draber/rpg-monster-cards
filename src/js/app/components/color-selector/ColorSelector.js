import buildConfig from './configurator.js';
import format from './format.js';
import background from './background.js';
import cssProps from '../../../../data/css-props.json';
import events from '../../../modules/events/events.js';
import userPrefs from '../../../modules/user-prefs/userPrefs.js';



class ColorSelector extends HTMLElement {

    get value() {
        return this.getAttribute('value');
    }

    set value(v) {
        this.setAttribute('value', v);
    }

    get name() {
        return this.getAttribute('name');
    }

    set name(v) {
        this.setAttribute('name', v);
    }

    get disabled() {
        return this.getAttribute('disabled');
    }

    set disabled(state) {
        if (state) {
            this.setAttribute('disabled', '');
        } else {
            this.removeAttribute('disabled');
        }
    }

    getInitialColor() {
        const userVal = userPrefs.get(`colors.${this.name}`);
        const pattern = this.name.replace('-color', '-');
        const channels =[];
        ['h', 's', 'l'].forEach(channel => {
            channels.push(cssProps[':root'][pattern + channel]);
        })
        return `hsl(${channels.join(' ')})`;
    }

    fireEvent(type) {
        og( format.tracksToValueObj(this.tracks), this.name)
        return this.dispatchEvent(new CustomEvent(type, {
            bubbles: true,
            cancelable: true,
            detail: {
                value: this.value,
                channels: format.tracksToValueObj(this.tracks)
            }
        }))
    }

    connectedCallback() {

        if(!this.value){
            this.value = this.getInitialColor();
        }

        const config = buildConfig(this.value);

        this.tracks = config.tracks;
        this.value = config.original;

        const valueInput = document.createElement('input');
        valueInput.type = 'hidden';
        valueInput.value = this.value;
        if (this.name) {
            valueInput.name = this.name;
        }
        this.append(valueInput);

        const ranges = [];

        for (let [channel, track] of Object.entries(this.tracks)) {
            const label = document.createElement('label');
            const lSpan = document.createElement('span');
            const iSpan = document.createElement('span');
            label.append(lSpan, iSpan);
            lSpan.textContent = this.dataset[channel + 'Label'] || (channel !== 'α' ? channel.toUpperCase() : channel);
            const input = document.createElement('input');
            input.dataset.channel = channel;
            input.dataset.unit = track.unit;
            input.type = 'range';
            input.min = track.min;
            input.max = track.max;
            input.step = track.step;
            input.value = track.value;
            input.name = `${this.name.replace('color', channel)}`;
            this.tracks[channel].element = input;
            
            input.addEventListener('input', e => {
                e.stopPropagation();
                this.tracks[e.target.dataset.channel].value = e.target.value;
                this.value = format.tracksToColorStr(this.tracks, config.type);
                valueInput.value = this.value;
                background.update(config.type, this.tracks);
                const formatted = format.trackToChannelStr(this.tracks[e.target.dataset.channel]);
                userPrefs.set(`colors.${e.target.name}`, formatted);                
                events.trigger(`styleChange`, {
                    name: e.target.name,
                    value: formatted
                });
            });
            input.addEventListener('change', e => {
                e.stopPropagation();
                this.fireEvent(e.type);
            });
            iSpan.append(input);
            ranges.push(input);
            this.append(label);
        }
        // update background-colors
        ranges.forEach(input => {
            input.dispatchEvent(new Event('input'));
        })
    }
    constructor(self) {
        self = super(self);
        return self;
    }
}


/**
 * Register the element type to the DOM
 */
const register = () => {
    customElements.get('color-selector') || customElements['define']('color-selector', ColorSelector)
}

export default {
    register
}