import buildConfig from './configurator.js';
import format from './format.js';
import background from './background.js';
import {
    presetStore
} from '../../../storage/storage.js';
import {
    on,
    trigger
} from '../../../../modules/events/eventHandler.js';
import fn from 'fancy-node';

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
        const pattern = this.name.replace('-color', '-');
        const channels = [];
        ['h', 's', 'l'].forEach(channel => {
            // pattern exp: --c-bg-
            channels.push(presetStore.get(`css.${pattern}${channel}`))
        })
        return `hsl(${channels.join(' ')})`;
    }

    fireEvent(type) {
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

        if (!this.value) {
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
            const label = fn.label();
            const lSpan = fn.span({
                content: this.dataset[channel + 'Label'] || (channel !== 'α' ? channel.toUpperCase() : channel)
            });
            const iSpan = fn.span();
            label.append(lSpan, iSpan);

            const input = fn.input({
                data: {
                    channel,
                    unit: track.unit
                },
                attributes: {
                    type: 'range',
                    min: track.min,
                    max: track.max,
                    step: track.step,
                    name: `${this.name.replace('color', channel)}`,
                    value: track.value
                }
            })
            this.tracks[channel].element = input;

            input.addEventListener('input', e => {
                e.stopPropagation();
                this.tracks[e.target.dataset.channel].value = e.target.value;
                this.value = format.tracksToColorStr(this.tracks, config.type);
                valueInput.value = this.value;
                background.update(config.type, this.tracks);
                const formatted = format.trackToChannelStr(this.tracks[e.target.dataset.channel]);
                this.app.trigger(`singleStyleChange`, {
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

        // change triggered by the active tab
        this.app.on('styleUpdate', e => {
            for (let input of ranges) {
                if (!e.detail.css[input.name]) {
                    continue;
                }
                input.value = parseFloat(e.detail.css[input.name], 10);
                input.dispatchEvent(new Event('input'))
            }
        })
    }
    constructor(self) {
        self = super(self);
        self.on = on;
        self.trigger = trigger;
        return self;
    }
}


/**
 * Register the element type to the DOM
 */
const register = app => {
    ColorSelector.prototype.app = app;
    customElements.get('color-selector') || customElements['define']('color-selector', ColorSelector)
}

export default {
    register
}