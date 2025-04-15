export class SoundManager {
  constructor() {
    // Initialize audio context
    this.audioContext = null;
    this.sounds = {};
    this.isMuted = false;
    this.masterGain = null;
    this.soundsCreated = false;
    
    // Don't auto-create the audio context, wait for user interaction
    this.setupUserInteractionListeners();
  }
  
  setupUserInteractionListeners() {
    // These events will initialize audio after user interaction
    const interactionEvents = ['click', 'touchstart', 'keydown'];
    
    const initAudio = () => {
      if (!this.audioContext) {
        this.initializeAudioContext();
        
        // Remove event listeners once audio is initialized
        interactionEvents.forEach(event => {
          document.removeEventListener(event, initAudio);
        });
      }
    };
    
    // Add event listeners
    interactionEvents.forEach(event => {
      document.addEventListener(event, initAudio, { once: false });
    });
  }
  
  initializeAudioContext() {
    // Try to initialize audio context
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      
      // Create sounds once audio context is ready
      this.createSounds();
      this.soundsCreated = true;
      console.log("Audio context initialized after user interaction");
    } catch (e) {
      console.error("Web Audio API not supported:", e);
    }
  }
  
  createSounds() {
    // Don't create sounds if audio context isn't ready
    if (!this.audioContext) return;
    
    // Create basic explosion sound (synthesized)
    this.createExplosionSound();
    
    // Create helicopter hit sound
    this.createHelicopterHitSound();
    
    // Create ember collection sound
    this.createEmberCollectSound();
    
    // Create gameplay background sounds
    this.createGameplaySound();
    
    // Create game over sound
    this.createGameOverSound();
  }
  
  createExplosionSound() {
    if (!this.audioContext) return;
    
    const bufferSize = this.audioContext.sampleRate * 1.5; // 1.5 seconds
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Create explosion waveform
    for (let i = 0; i < bufferSize; i++) {
      // Initial blast
      const t = i / this.audioContext.sampleRate;
      let noise = Math.random() * 2 - 1;
      
      // Envelope to shape the explosion (quick attack, long decay)
      let envelope = Math.exp(-3 * t);
      
      // Lower frequency rumble
      let rumble = Math.sin(2 * Math.PI * 30 * t) * Math.exp(-2 * t);
      
      // Combine components
      data[i] = (noise * 0.6 + rumble * 0.4) * envelope;
    }
    
    this.sounds.explosion = buffer;
  }
  
  createHelicopterHitSound() {
    if (!this.audioContext) return;
    
    const bufferSize = this.audioContext.sampleRate * 0.3; // 0.3 seconds
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Create impact sound
    for (let i = 0; i < bufferSize; i++) {
      const t = i / this.audioContext.sampleRate;
      const noise = Math.random() * 2 - 1;
      const envelope = Math.exp(-15 * t);
      const highFreq = Math.sin(2 * Math.PI * 900 * t) * Math.exp(-20 * t);
      
      data[i] = (noise * 0.4 + highFreq * 0.6) * envelope;
    }
    
    this.sounds.helicopterHit = buffer;
  }
  
  createEmberCollectSound() {
    if (!this.audioContext) return;
    
    const bufferSize = this.audioContext.sampleRate * 0.5; // 0.5 seconds
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Create a sparkly collection sound
    for (let i = 0; i < bufferSize; i++) {
      const t = i / this.audioContext.sampleRate;
      const freq = 800 + 400 * Math.sin(2 * Math.PI * 8 * t);
      const tone = Math.sin(2 * Math.PI * freq * t);
      const envelope = Math.exp(-8 * t) * (1 - Math.exp(-20 * t));
      
      data[i] = tone * envelope * 0.5;
    }
    
    this.sounds.emberCollect = buffer;
  }
  
  createGameplaySound() {
    if (!this.audioContext) return;
    
    const bufferSize = this.audioContext.sampleRate * 2; // 2 seconds
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Create ambient fire sound
    for (let i = 0; i < bufferSize; i++) {
      const t = i / this.audioContext.sampleRate;
      const noise = Math.random() * 2 - 1;
      const slowNoise = Math.sin(2 * Math.PI * 4 * t + 5 * noise);
      const envelope = 0.15;
      
      data[i] = noise * slowNoise * envelope;
    }
    
    this.sounds.gameplay = buffer;
  }
  
  createGameOverSound() {
    if (!this.audioContext) return;
    
    const bufferSize = this.audioContext.sampleRate * 2; // 2 seconds
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Create a descending tone for game over
    for (let i = 0; i < bufferSize; i++) {
      const t = i / this.audioContext.sampleRate;
      const freq = 300 * Math.exp(-1.5 * t);
      const tone = Math.sin(2 * Math.PI * freq * t);
      const noise = Math.random() * 2 - 1;
      const envelope = Math.exp(-1 * t);
      
      data[i] = (tone * 0.7 + noise * 0.3) * envelope * 0.5;
    }
    
    this.sounds.gameOver = buffer;
  }
  
  playSound(soundName, options = {}) {
    // Handle case when audio isn't initialized yet
    if (!this.audioContext) {
      this.initializeAudioContext();
      // If still not available, quietly return
      if (!this.audioContext) return null;
    }
    
    // Don't play if muted
    if (this.isMuted) return null;
    
    // Resume audio context if it was suspended (autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    const buffer = this.sounds[soundName];
    if (!buffer) return null;
    
    // Create source and connect to master gain
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    
    // Individual gain control for this sound
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = options.volume || 1.0;
    
    // Connect source to individual gain to master gain
    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    // Playback rate (pitch) variation if specified
    if (options.pitchVariation) {
      source.playbackRate.value = 1.0 + (Math.random() * 2 - 1) * options.pitchVariation;
    }
    
    // Play the sound
    source.start();
    
    // Return the source in case we need to stop it later
    return source;
  }
  
  playExplosion(size = 1.0) {
    return this.playSound('explosion', {
      volume: 0.7 * size,
      pitchVariation: 0.2
    });
  }
  
  playHelicopterHit() {
    return this.playSound('helicopterHit', {
      volume: 0.5,
      pitchVariation: 0.1
    });
  }
  
  playEmberCollect() {
    return this.playSound('emberCollect', {
      volume: 0.3,
      pitchVariation: 0.2
    });
  }
  
  playGameplayLoop() {
    // Handle case when audio isn't initialized yet
    if (!this.audioContext) {
      this.initializeAudioContext();
      // If still not available, quietly return
      if (!this.audioContext) return null;
    }
    
    // Don't play if muted
    if (this.isMuted) return null;
    
    // Return early if gameplay sound isn't created yet
    if (!this.sounds.gameplay) return null;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = this.sounds.gameplay;
    source.loop = true;
    
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0.2;
    
    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    // Resume audio context if needed
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    source.start();
    
    this.gameplaySource = source;
    return source;
  }
  
  stopGameplayLoop() {
    if (this.gameplaySource) {
      this.gameplaySource.stop();
      this.gameplaySource = null;
    }
  }
  
  playGameOver() {
    return this.playSound('gameOver', {
      volume: 0.6
    });
  }
  
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.masterGain.gain.value = this.isMuted ? 0 : 1;
    return this.isMuted;
  }
  
  setMasterVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }
}