// Sound Effects & Ambient Audio Engine
// Uses Web Audio API to generate all sounds procedurally — no external files needed

let audioCtx = null;
let ambientSource = null;
let ambientGain = null;
let isAmbientPlaying = false;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// --- One-shot sound effects ---

export function playCorrect() {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);     // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
}

export function playIncorrect() {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
}

export function playClick() {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
}

export function playTimerWarning() {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
}

export function playTimerTimeout() {
    const ctx = getAudioContext();

    // Double beep
    for (let i = 0; i < 2; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(440, ctx.currentTime + i * 0.2);

        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.2 + 0.15);

        osc.start(ctx.currentTime + i * 0.2);
        osc.stop(ctx.currentTime + i * 0.2 + 0.15);
    }
}

export function playScenarioComplete() {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6

    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.3);

        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
}

export function playAlert() {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    // Rapid pitch oscillation for "alert" feel
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.08);
    osc.frequency.setValueAtTime(600, ctx.currentTime + 0.16);
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.24);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
}

// --- Ambient background audio ---

export function startAmbient() {
    if (isAmbientPlaying) return;
    const ctx = getAudioContext();

    // Create subtle "cyber" ambient with filtered noise + low drone
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    ambientSource = ctx.createBufferSource();
    ambientSource.buffer = noiseBuffer;
    ambientSource.loop = true;

    // Low-pass filter for deep hum
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.Q.setValueAtTime(1, ctx.currentTime);

    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0, ctx.currentTime);
    ambientGain.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 2); // Fade in

    ambientSource.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(ctx.destination);

    // Add a low drone oscillator
    const drone = ctx.createOscillator();
    const droneGain = ctx.createGain();
    drone.type = 'sine';
    drone.frequency.setValueAtTime(55, ctx.currentTime); // A1 — very low
    droneGain.gain.setValueAtTime(0, ctx.currentTime);
    droneGain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 2);
    drone.connect(droneGain);
    droneGain.connect(ctx.destination);

    ambientSource.start();
    drone.start();
    isAmbientPlaying = true;

    // Store drone ref for cleanup
    ambientSource._drone = drone;
    ambientSource._droneGain = droneGain;
}

export function stopAmbient() {
    if (!isAmbientPlaying) return;
    try {
        if (ambientGain) {
            ambientGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
        }
        if (ambientSource?._droneGain) {
            ambientSource._droneGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
        }
        setTimeout(() => {
            try {
                ambientSource?.stop();
                ambientSource?._drone?.stop();
            } catch (e) { /* already stopped */ }
        }, 1200);
    } catch (e) { /* ignore */ }
    isAmbientPlaying = false;
}

export function isAmbientActive() {
    return isAmbientPlaying;
}
