//initialize audio context
var audioCtx;
const playButton = document.querySelector('button');

function initAudio() {
    console.log("audio_initted");
    audioCtx = new (window.AudioContext || window.webkitAudioContext);

    globalGain = audioCtx.createGain();
    globalGain.gain = 1;
    globalGain.connect(audioCtx.destination);
}

function babble() {
    var bufferSize = 10 * audioCtx.sampleRate,
        noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate),
        output = noiseBuffer.getChannelData(0);

    var lastOut = 0;
    for (var i = 0; i < bufferSize; i++) {
        var brown = Math.random() * 2 - 1;

        output[i] = (lastOut + (0.02 * brown)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
    }

    // Create brown noise buffer source
    var brownNoise1 = audioCtx.createBufferSource();
    brownNoise1.buffer = noiseBuffer;
    brownNoise1.loop = true;
    brownNoise1.start();

    var brownNoise2 = audioCtx.createBufferSource();
    brownNoise2.buffer = noiseBuffer;
    brownNoise2.loop = true;
    brownNoise2.start;

    // Low-pass filters
    // Create filters with descriptive names
    const lowPassFilter1 = audioCtx.createBiquadFilter();
    lowPassFilter1.type = 'lowpass';
    lowPassFilter1.frequency.value = 400; // Cutoff frequency

    const lowPassFliter2 = audioCtx.createBiquadFilter();
    lowPassFliter2.type = 'lowpass';
    lowPassFliter2.frequency.value = 14; // Cutoff frequency

    // Combine gain and offset into a single operation
    const modulationGain = audioCtx.createGain();
    modulationGain.gain.value = 500; // Add 500

    // Create resonant high-pass filter with clear variable naming
    const resonantHighPassFilter = audioCtx.createBiquadFilter();
    resonantHighPassFilter.type = 'highpass';
    resonantHighPassFilter.Q.value = 1 / 0.03; // Q value directly

    const resonantHighPassFilterGain = audioCtx.createGain();
    resonantHighPassFilterGain.gain.value = 0.1;

    // Connect the audio graph using descriptive connections
    brownNoise1.connect(lowPassFilter1);
    lowPassFilter1.connect(resonantHighPassFilter);
    resonantHighPassFilter.connect(resonantHighPassFilterGain);
    resonantHighPassFilterGain.connect(audioCtx.destination);

    brownNoise2.connect(lowPassFliter2);
    lowPassFliter2.connect(modulationGain);
    modulationGain.connect(resonantHighPassFilter.frequency);
}

function hissing() {
    //hissing 
    //creating white noise 
    const whiteNoise = audioCtx.createBufferSource();
    const bufferSize = audioCtx.sampleRate * 2; // 2 seconds buffer
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // Generate white noise
    }

    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    //low pass
    const lowPassFilter = audioCtx.createBiquadFilter();
    lowPassFilter.type = 'lowpass';

    //high pass filter to remove low freq. sounds in the hissing 
    const highPassFilter = audioCtx.createBiquadFilter();
    highPassFilter.type = 'highpass';
    highPassFilter.frequency.value = 700;

    //variables for updating modulation
    let lastModulatorValue = 0;
    const interval = 0.1; // Change in seconds

    //changes the low freq. modulator to add random bursts of hisses for the fire to be more volatile and violent
    function updateModulator() {
        //range: first to first plus second
        const newModulatorValue = 0.6 + Math.random() * 0.2;
        if (newModulatorValue !== lastModulatorValue) {
            lastModulatorValue = newModulatorValue;
            lowPassFilter.frequency.setValueAtTime(
                1800 * square(newModulatorValue), audioCtx.currentTime
            );
        }
        setTimeout(updateModulator, interval * 500); // Call again after interval in milliseconds
    }

    //square function
    function square(value) {
        return value * value;
    }

    //start modulator loop
    updateModulator();

    //gain node to control volume
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.03;

    whiteNoise.connect(lowPassFilter);
    lowPassFilter.connect(highPassFilter);
    highPassFilter.connect(gainNode);

    gainNode.connect(audioCtx.destination);
    whiteNoise.start();
}

function crackling() {
    const whiteNoise = audioCtx.createBufferSource();
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    //high pass filter creating a random frequency for each crackle to create variation in tone
    const highPassFilter = audioCtx.createBiquadFilter();
    highPassFilter.type = 'highpass';
    highPassFilter.frequency.value = Math.random() * (2000 - 500) + 500

    // creating an envelope 
    const envelope = audioCtx.createGain();
    const attackTime = 0.03; // 30ms attack time

    //giving the decay random values to create variation in duration 
    const decayTime = Math.random() * 0.01 + 0.02; // 10-30ms decay time

    envelope.gain.exponentialRampToValueAtTime(Math.random() * (0.5 - 0.1) + 0.1, audioCtx.currentTime + attackTime);

    //overall volume
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.04;

    whiteNoise.connect(envelope);
    envelope.connect(highPassFilter);
    highPassFilter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    whiteNoise.start();

    // stopping the crackling after a certain duration
    const duration = attackTime + decayTime;
    whiteNoise.stop(audioCtx.currentTime + duration);

    // playing the next crackle  after a random delay
    const randomDelay = Math.random() * (250 - 50) + 50;
    setTimeout(() => {
        crackling();
    }, randomDelay);

}

function flame() {
    const whiteNoise = audioCtx.createBufferSource();
    const bufferSize = audioCtx.sampleRate * 2; // 2 seconds buffer
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // Generate white noise
    }

    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    //resonant bandpass filter to replicate gas passing through tube
    const bandpassFilter = audioCtx.createBiquadFilter();
    bandpassFilter.type = 'bandpass';
    bandpassFilter.frequency.value = 100; // Adjust the frequency of the filter
    bandpassFilter.Q.value = 15; // Adjust the resonance of the filter

    //low-pass filter to remove low frequencies
    const lowPassFilter = audioCtx.createBiquadFilter();
    lowPassFilter.type = 'lowpass';
    lowPassFilter.frequency.value = 600; // Adjust the cutoff frequency

    //limiter for the loud hisses
    const limiter = audioCtx.createDynamicsCompressor();
    limiter.threshold.value = -10; // Adjust the threshold as needed

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 5;

    whiteNoise.connect(bandpassFilter);
    bandpassFilter.connect(lowPassFilter);
    lowPassFilter.connect(limiter);
    limiter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    whiteNoise.start();
}

function pressPlayBabble() {
    playSuspendAudio();
    babble();

    console.log("Babble Pressed");
}

function pressPlayFire() {
    playSuspendAudio();
    hissing();
    crackling();
    flame();
    console.log("Fire Pressed");
}

function playSuspendAudio() {

    if (!audioCtx) {
        initAudio();
        return;
    }
    else if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    else if (audioCtx.state === 'running') {
        audioCtx.suspend();
    }

}




