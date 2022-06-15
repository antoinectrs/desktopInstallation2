const MAIN_AUDIO = new (AudioContext || webkitAudioContext || mozAudioContext)()

class Sample {
    constructor({ path, isLooping, folder, orientation }) {
        this.audio = MAIN_AUDIO
        this.binauralFIRNode = null
        this.path = path;
        this.hrtfs = hrtfs;
        this.sampleBuffer;
        this.sourceNode;
        this.onRoad = false;
        this.folder = folder;
        this.isLooping = isLooping;
        this.rack = {
            // filter: {
            //     varFreq: 0.1,
            //     audioNode: null,
            //     actual: 0,
            // },
            volume: {
                // varFreq:40,
                audioNode: null,
                actual: 0,
            },
            binaural: {
                orientation: null
            },
            speed: {
                actual: 1
            }
        }
        this.variationRoute;

        this.thresholdLerp = 0.004;
        this.renderStatut = false;
    }
    initVariationRoute(value) {
        this.variationRoute = value;
    }
    initOrientation(value) {
        this.rack.binaural.orientation = value;
        this.binauralFIRNode.setPosition(this.rack.binaural.orientation, 10, 1);
    }
    setOrientation(value) {
        this.binauralFIRNode.setCrossfadeDuration(50);
        this.binauralFIRNode.setPosition(value, 10, 1);
    }
    // Decode the raw sample data into a AudioBuffer
    createBufferFromData(rawData) {
        // console.log('Got raw sample data from XHR');
        // this.audio.decodeAudioData(rawData, this.checkBuffer.bind(this));
        // this.audio.decodeAudioData(rawData, (buffer) => this.checkBuffer(buffer));
        this.audio.decodeAudioData(rawData, (buffer) => {
            this.checkBuffer(buffer)
        });
    }
    checkBuffer(buffer) {
        this.sampleBuffer = buffer;
        // console.log('sample good');
    }
    // Create a new source node and play it
    playSample(decay, e, sampleRate) {
        if (sampleRate === undefined) sampleRate = 1;
        this.hrtf(sampleRate);
        //  -----------------------------------------               //INIT
        this.binauralFIRNode = new BinauralFIR({ audioContext: this.audio });
        this.binauralFIRNode.HRTFDataset = this.hrtfs;
        this.sourceNode = this.audio.createBufferSource();
        this.initEffect(this.sourceNode);
        this.sourceNode.buffer = this.sampleBuffer;
        this.sourceNode.playbackRate.value = sampleRate;             //SAMPLE
        //  -----------------------------------------               //CONNECT

        this.sourceNode.connect(this.binauralFIRNode.input);        //BINAU
        this.binauralFIRNode.connect(this.rack.volume.audioNode);
        this.rack.volume.audioNode.connect(this.audio.destination);

        // this.binauralFIRNode.connect(this.audio.destination);  //SOURCE  
        this.sourceNode.loop = this.isLooping;
        this.sourceNode.start(0, decay);
    }
    initEffect(bufferSrc) {
        this.rack.volume.audioNode = this.initGain();
        this.initSpeed(this.rack.speed.actual);
    }
    initGain(audioNode) {
        audioNode = this.audio.createGain();
        audioNode.gain.setValueAtTime(0.001, this.audio.currentTime);
        return audioNode;
        // audioNode.gain.setValueAtTime(10, this.audio.currentTime);
    }
    initSpeed(speed) {
        // this.renderStatut = true;
        // if(renderStatut==false){
            // this.sourceNode.playbackRate.value = speed;
            this.sourceNode.playbackRate.linearRampToValueAtTime(speed, this.audio.currentTime + 15);
        // }
    }
    softValue(fxTarget, fxTemp, fxType, index = 0) {
        new Promise(resolve => {
            const draw = () => {
                // console.log(fxTarget, fxTemp, fxType);
                if (index >= 0.99) {
                    fxType.value = fxTarget
                    // this.rack.filter.actual = fxTarget;
                    resolve("the new value ");
                } else {
                    index += this.thresholdLerp;
                    // this.rack.filter.actual = fxTemp;
                    // fxTemp =myLerp(fxTemp, fxTarget, index);
                    // fxType.value =fxTemp
                    // fxType.value = fxTemp
                    // fxType
                    // console.log(fxTemp);
                    // fxType.linearRampToValueAtTime(fxTemp, this.audio.currentTime);
                    fxType.setValueAtTime(fxTemp, this.audio.currentTime);
                    // console.log(fxTemp);
                    requestAnimationFrame(() => draw());
                }
            }
            draw()
        });
    }
    render(eVolume, transition = true) {
        if (this.audio.state === "suspended") return;
        // console.log(this.rack.volume.audioNode.);
        // const filterRender = await this.softValue(eFilter, this.rack.filter.actual, this.rack.filter.audioNode.frequency);
        // http://alemangui.github.io/ramp-to-value
        const node = this.rack.volume.audioNode;
        // eVolume = Math.max(1, Math.min(eVolume, 0.1))
        if (transition){
            console.log("transition");
            // node.gain.linearRampToValueAtTime(eVolume, this.audio.currentTime + 15);

            // console.log(eVolume, node.gain.value);
            // node.gain.setValueAtTime(node.gain.value, this.audio.currentTime); 
            // node.gain.setValueAtTime(node.gain.value, this.audio.currentTime); 

            node.gain.setValueAtTime(this.rack.volume.audioNode.gain.value, this.audio.currentTime); 
            node.gain.exponentialRampToValueAtTime(eVolume+0.001, this.audio.currentTime + 10);
        }
        else
            node.gain.setValueAtTime(eVolume, this.audio.currentTime);

        // node.setValueAtTime(node.value + 0.0001, this.audio.currentTime + 10);
    }
    fadeIn(){
        console.log("in", this.rack.volume.audioNode.gain.value);
        const node = this.rack.volume.audioNode;
        node.gain.setValueAtTime(this.rack.volume.audioNode.gain.value, this.audio.currentTime); 
        node.gain.exponentialRampToValueAtTime(1, this.audio.currentTime + 10);
    }
    fadeOut(){
        // console.log("out",  this.audio);
        const node = this.rack.volume.audioNode;
        node.gain.setValueAtTime(this.rack.volume.audioNode.gain.value, this.audio.currentTime); 
        node.gain.exponentialRampToValueAtTime(0.001, this.audio.currentTime + 10);
    }
    requestTrack() {
        let req = new XMLHttpRequest();
        req.responseType = "arraybuffer";
        req.addEventListener('load', (event) => {
            this.createBufferFromData(req.response);
        });
        // req.open('GET', `../snd/parc/${this.path}.wav`, true);
        req.open('GET', `./snd/${this.folder}/${this.path}.mp3`, true);
        req.send();
    }
    hrtf(sampleRate) {
        for (var i = 0; i < this.hrtfs.length; i++) {
            var buffer = this.audio.createBuffer(2, 512, this.audio.sampleRate);
            var bufferChannelLeft = buffer.getChannelData(0);
            var bufferChannelRight = buffer.getChannelData(1);
            for (var e = 0; e < this.hrtfs[i].fir_coeffs_left.length; e++) {
                bufferChannelLeft[e] = this.hrtfs[i].fir_coeffs_left[e];
                bufferChannelRight[e] = this.hrtfs[i].fir_coeffs_right[e];
            }
            this.hrtfs[i].buffer = buffer;
        }
    }
}