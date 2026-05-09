/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private initialized = false;

  private init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.3; // Low master volume
      this.initialized = true;

      // Resume context on first interaction if needed
      if (this.ctx.state === 'suspended') {
        const resume = () => {
          this.ctx?.resume();
          window.removeEventListener('keydown', resume);
          window.removeEventListener('mousedown', resume);
        };
        window.addEventListener('keydown', resume);
        window.addEventListener('mousedown', resume);
      }
    } catch (e) {
      console.error('Web Audio API not supported', e);
    }
  }

  playCollectSound(value: number = 1) {
    if (!this.initialized) this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Frequency increases slightly with score value or randomly for variety
    const baseFreq = 400 + Math.random() * 200;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2, now + 0.1);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  playDeathSound() {
    if (!this.initialized) this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.5);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }
}

export const audioManager = new AudioManager();
