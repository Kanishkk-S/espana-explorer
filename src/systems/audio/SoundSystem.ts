// ============================================================
// ESPAÑA EXPLORER — Procedural Sound Synthesizer (Web Audio API)
// Generates cozy medieval/fantasy sound effects with zero external assets
// ============================================================

class SoundSystem {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private isMuted: boolean = false;
  private sfxVol: number = 0.7;
  private musicVol: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.isMuted ? 0 : this.sfxVol;
      this.sfxGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.isMuted ? 0 : this.musicVol;
      this.musicGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.sfxGain) this.sfxGain.gain.value = muted ? 0 : this.sfxVol;
    if (this.musicGain) this.musicGain.gain.value = muted ? 0 : this.musicVol;
  }

  public setVolumes(sfx: number, music: number) {
    this.sfxVol = Math.max(0, Math.min(1, sfx));
    this.musicVol = Math.max(0, Math.min(1, music));
    if (!this.isMuted) {
      if (this.sfxGain) this.sfxGain.gain.value = this.sfxVol;
      if (this.musicGain) this.musicGain.gain.value = this.musicVol;
    }
  }

  /** Subtle UI button click */
  public playClick() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /** Item pickup or coin collect */
  public playItemPickup() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.2, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.2);
      });
    } catch {
      // Ignore
    }
  }

  /** NPC Interaction chirp */
  public playDialogueChirp() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore
    }
  }

  /** Quest completion fanfare */
  public playQuestComplete() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      // Medieval triumphant arpeggio
      const notes = [392.00, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
      notes.forEach((freq, i) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = i === notes.length - 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        const duration = i === notes.length - 1 ? 0.6 : 0.25;
        gain.gain.setValueAtTime(0.25, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + duration);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + duration);
      });
    } catch {
      // Ignore
    }
  }

  /** Puzzle solve chime */
  public playPuzzleSolve() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const chords = [
        [440, 554.37, 659.25], // A major
        [523.25, 659.25, 783.99], // C major
        [587.33, 739.99, 880.00], // D major
      ];

      chords.forEach((chord, chordIdx) => {
        chord.forEach((freq) => {
          if (!this.ctx || !this.sfxGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + chordIdx * 0.18);

          gain.gain.setValueAtTime(0.15, now + chordIdx * 0.18);
          gain.gain.exponentialRampToValueAtTime(0.001, now + chordIdx * 0.18 + 0.35);

          osc.connect(gain);
          gain.connect(this.sfxGain);

          osc.start(now + chordIdx * 0.18);
          osc.stop(now + chordIdx * 0.18 + 0.35);
        });
      });
    } catch {
      // Ignore
    }
  }

  /** Puzzle wrong buzz */
  public playPuzzleError() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.2);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Ignore
    }
  }

  /** Door or portal passage */
  public playTransition() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.3);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundSystem();
