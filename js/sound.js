/**
 * Sound Engine using Web Audio API
 * No external audio files needed - 100% self-contained synthesized sounds
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.initialized = false;
    }

    init() {
        if (!this.initialized) {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioContext();
                this.initialized = true;
            } catch (e) {
                console.warn('Web Audio not supported', e);
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    playClick() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playWhistle(isDouble = false) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const playSingle = (startTime, duration) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(2600, startTime);
            osc.frequency.linearRampToValueAtTime(2800, startTime + duration * 0.5);
            osc.frequency.linearRampToValueAtTime(2500, startTime + duration);

            // Shivering/trill effect
            const mod = this.ctx.createOscillator();
            const modGain = this.ctx.createGain();
            mod.frequency.value = 35;
            modGain.gain.value = 150;
            mod.connect(osc.frequency);
            mod.start(startTime);
            mod.stop(startTime + duration);

            gain.gain.setValueAtTime(0.0, startTime);
            gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
            gain.gain.setValueAtTime(0.25, startTime + duration - 0.05);
            gain.gain.linearRampToValueAtTime(0.01, startTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
        };

        const now = this.ctx.currentTime;
        if (isDouble) {
            playSingle(now, 0.18);
            playSingle(now + 0.25, 0.35);
        } else {
            playSingle(now, 0.3);
        }
    }

    playGoal() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // Big Bass Impact
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);

        // Fanfare chord progression
        const chordNotes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        chordNotes.forEach((freq, idx) => {
            const noteOsc = this.ctx.createOscillator();
            const noteGain = this.ctx.createGain();
            noteOsc.type = 'triangle';
            noteOsc.frequency.value = freq;

            const noteStart = now + 0.1 + idx * 0.08;
            noteGain.gain.setValueAtTime(0, noteStart);
            noteGain.gain.linearRampToValueAtTime(0.18, noteStart + 0.04);
            noteGain.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.8);

            noteOsc.connect(noteGain);
            noteGain.connect(this.ctx.destination);
            noteOsc.start(noteStart);
            noteOsc.stop(noteStart + 0.8);
        });

        // Crowd roar noise simulation
        this.playCrowdRoar(now + 0.1, 1.2);
    }

    playCrowdRoar(startTime, duration) {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Lowpass filter for deep crowd roar
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, startTime);
        filter.frequency.linearRampToValueAtTime(800, startTime + duration * 0.3);
        filter.frequency.linearRampToValueAtTime(300, startTime + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(startTime);
    }

    playAward() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880, 1108.73]; // A major triumphant
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.12);

            gain.gain.setValueAtTime(0, now + idx * 0.12);
            gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.9);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 0.9);
        });
    }
}

window.sound = new SoundEngine();
