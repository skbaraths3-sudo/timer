import { AlarmTone } from '../types';

class AlarmSoundEngine {
  private audioCtx: AudioContext | null = null;
  private isAlarmPlaying = false;
  private loopIntervalId: number | null = null;
  private volume = 0.8;

  private getContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Plays a single iteration of the chosen tone
   */
  public playToneOnce(tone: AlarmTone = 'chime') {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(this.volume * 0.4, now);
      gainNode.connect(ctx.destination);

      if (tone === 'digital') {
        // Double electronic beep
        const beeps = [0, 0.15, 0.4, 0.55];
        beeps.forEach((startTime) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(1046.5, now + startTime); // C6

          noteGain.gain.setValueAtTime(0, now + startTime);
          noteGain.gain.linearRampToValueAtTime(this.volume * 0.25, now + startTime + 0.01);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + startTime + 0.09);

          osc.connect(noteGain);
          noteGain.connect(gainNode);

          osc.start(now + startTime);
          osc.stop(now + startTime + 0.1);
        });
      } else if (tone === 'bell') {
        // Resonant bell chord
        const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);

          noteGain.gain.setValueAtTime(0, now + idx * 0.06);
          noteGain.gain.linearRampToValueAtTime(this.volume * 0.35, now + idx * 0.06 + 0.02);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 1.2);

          osc.connect(noteGain);
          noteGain.connect(gainNode);

          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 1.25);
        });
      } else if (tone === 'marimba') {
        // Warm marimba arpeggio
        const freqs = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);

          noteGain.gain.setValueAtTime(0, now + idx * 0.1);
          noteGain.gain.linearRampToValueAtTime(this.volume * 0.4, now + idx * 0.1 + 0.01);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);

          osc.connect(noteGain);
          noteGain.connect(gainNode);

          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.45);
        });
      } else {
        // Default 'chime' - harmonious and uplifting melody
        const notes = [
          { freq: 587.33, start: 0, dur: 0.35 },    // D5
          { freq: 739.99, start: 0.12, dur: 0.35 }, // F#5
          { freq: 880.00, start: 0.24, dur: 0.4 },  // A5
          { freq: 1174.66, start: 0.36, dur: 0.8 }, // D6
        ];

        notes.forEach(({ freq, start, dur }) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + start);

          noteGain.gain.setValueAtTime(0, now + start);
          noteGain.gain.linearRampToValueAtTime(this.volume * 0.35, now + start + 0.02);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

          osc.connect(noteGain);
          noteGain.connect(gainNode);

          osc.start(now + start);
          osc.stop(now + start + dur + 0.05);
        });
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /**
   * Starts looping the alarm sound until stopAlarm is called
   */
  public startAlarm(tone: AlarmTone = 'chime') {
    this.stopAlarm();
    this.isAlarmPlaying = true;

    // Immediately play first pulse
    this.playToneOnce(tone);

    // Repeat every 1.5 seconds while active
    const loopInterval = tone === 'bell' ? 2000 : 1500;
    this.loopIntervalId = window.setInterval(() => {
      if (this.isAlarmPlaying) {
        this.playToneOnce(tone);
      } else {
        this.stopAlarm();
      }
    }, loopInterval);
  }

  /**
   * Stops the ongoing alarm sound
   */
  public stopAlarm() {
    this.isAlarmPlaying = false;
    if (this.loopIntervalId !== null) {
      clearInterval(this.loopIntervalId);
      this.loopIntervalId = null;
    }
  }

  public isPlaying(): boolean {
    return this.isAlarmPlaying;
  }
}

export const alarmEngine = new AlarmSoundEngine();
