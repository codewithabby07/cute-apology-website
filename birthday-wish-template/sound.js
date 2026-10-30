// Web Audio Procedural Sound Synthesizer & Background Music Engine
// Recreating Cutiepage Folio Sound Engine with Mobile Autoplay Support

class FolioSoundEngine {
  constructor() {
    this.audioCtx = null;
    this.compressor = null;
    this.musicAudio = null;
    this.isMuted = false;
    this.isPlaying = false;
    this.isUnlocked = false;
    this.volume = 0.85;
    this.musicUrl = 'assets/audio/music.mp3';

    this.onStateChangeCallbacks = [];
  }

  initAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        try {
          this.audioCtx = new AudioContextClass();

          // Prime silent buffer
          const buffer = this.audioCtx.createBuffer(1, 1, 22050);
          const source = this.audioCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(this.audioCtx.destination);
          source.start(0);

          // Dynamics compressor
          const comp = this.audioCtx.createDynamicsCompressor();
          comp.threshold.value = -12;
          comp.knee.value = 6;
          comp.ratio.value = 8;
          comp.attack.value = 0.002;
          comp.release.value = 0.25;
          comp.connect(this.audioCtx.destination);
          this.compressor = comp;
        } catch (e) {
          console.warn('AudioContext init error:', e);
        }
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  unlock() {
    this.initAudioContext();
    this.isUnlocked = true;

    // Connect to DOM audio element or create audio
    if (!this.musicAudio) {
      const domAudio = document.getElementById('bg-music');
      if (domAudio) {
        this.musicAudio = domAudio;
      } else {
        this.musicAudio = new Audio(this.musicUrl);
      }
      this.musicAudio.loop = true;
      this.musicAudio.volume = this.volume;

      this.musicAudio.addEventListener('play', () => {
        this.isPlaying = true;
        this.notifyState();
      });
      this.musicAudio.addEventListener('pause', () => {
        this.isPlaying = false;
        this.notifyState();
      });
      this.musicAudio.addEventListener('error', (e) => {
        console.warn('Audio element error, falling back to procedural audio:', e);
      });
    }
  }

  playMusic() {
    this.unlock();
    if (this.musicAudio && !this.isMuted) {
      this.musicAudio.volume = this.volume;
      const playPromise = this.musicAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isPlaying = true;
          this.notifyState();
        }).catch(err => {
          console.log('Autoplay restriction prevented direct play:', err);
          // Try synth melody fallback if needed
        });
      }
    }
  }

  pauseMusic() {
    if (this.musicAudio) {
      this.musicAudio.pause();
      this.isPlaying = false;
      this.notifyState();
    }
  }

  toggleMusic() {
    this.unlock();
    if (this.isPlaying) {
      this.pauseMusic();
      return false;
    } else {
      this.playMusic();
      return true;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.musicAudio) {
      this.musicAudio.muted = this.isMuted;
    }
    this.notifyState();
  }

  onStateChange(cb) {
    this.onStateChangeCallbacks.push(cb);
  }

  notifyState() {
    this.onStateChangeCallbacks.forEach(cb => cb({
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      isUnlocked: this.isUnlocked
    }));
  }

  // Procedural Sound Effects Synthesizer
  play(soundName) {
    this.initAudioContext();
    if (!this.audioCtx || this.isMuted) return;

    const ctx = this.audioCtx;
    const dest = this.compressor || ctx.destination;
    const now = ctx.currentTime;

    switch (soundName) {
      case 'unlock': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(740, now + 0.16);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }

      case 'switch': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }

      case 'popper': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.14);
        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.14);
        break;
      }

      case 'puff': {
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        noise.start(now);
        break;
      }

      case 'cut': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }

      case 'shake': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(320, now + 0.05);
        osc.frequency.linearRampToValueAtTime(240, now + 0.1);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }

      case 'charge': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 1.4);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.45, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 1.5);
        break;
      }

      case 'win': {
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
          const t = now + idx * 0.09;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.35, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(t);
          osc.stop(t + 0.35);
        });
        break;
      }

      case 'reveal': {
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
          const t = now + idx * 0.08;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(t);
          osc.stop(t + 0.25);
        });
        break;
      }

      case 'scratch': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }

      case 'tick': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }

      case 'tap':
      case 'next': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }

      case 'horn': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(260, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }

      default:
        break;
    }
  }

  playEffect(name) {
    this.play(name);
  }
}

// Global Sound Instance
window.sound = new FolioSoundEngine();
