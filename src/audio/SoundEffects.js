/* Procedural Web Audio Synthesizer for Hyperloop 3D */
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.engineOsc = null;
    this.engineGain = null;
    this.isEngineRunning = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted && this.engineGain) {
      this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    return this.muted;
  }

  playClick() {
    if (this.muted) return;
    this.init();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playExplode() {
    if (this.muted) return;
    this.init();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playHotspot() {
    if (this.muted) return;
    this.init();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.16); // G5

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  startEngine() {
    if (this.isEngineRunning || this.muted) return;
    this.init();

    this.engineOsc = this.ctx.createOscillator();
    this.engineGain = this.ctx.createGain();

    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.setValueAtTime(60, this.ctx.currentTime);

    this.engineGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.engineGain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 1.0);

    // Lowpass filter for smooth turbine hum
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);

    this.engineOsc.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);

    this.engineOsc.start();
    this.isEngineRunning = true;
  }

  setEngineSpeed(speedRatio) { // 0.0 to 1.0
    if (!this.isEngineRunning || !this.engineOsc || this.muted) return;
    const freq = 60 + speedRatio * 420;
    this.engineOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1);
  }

  stopEngine() {
    if (!this.isEngineRunning || !this.engineOsc) return;
    this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
    setTimeout(() => {
      if (this.engineOsc) {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
        this.engineOsc = null;
      }
      this.isEngineRunning = false;
    }, 350);
  }
}

export const sfx = new SoundEffects();
