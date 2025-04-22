/**
 * ScreenEffects - Handles visual effects like flashes, fades, and transitions
 * for various game events like taking damage, level completion, etc.
 */

export class ScreenEffects {
  constructor(game) {
    this.game = game;
    this.ctx = game.ctx;
    this.width = game.width;
    this.height = game.height;
    
    // Flash effect
    this.flashActive = false;
    this.flashIntensity = 0;
    this.flashDuration = 0;
    this.flashTimeLeft = 0;
    this.flashColor = 'white';
    
    // Fade effect
    this.fadeActive = false;
    this.fadeAmount = 0;
    this.fadeTarget = 0;
    this.fadeSpeed = 0.05;
    this.fadeColor = 'black';
    
    // Vignette effect
    this.vignetteActive = false;
    this.vignetteIntensity = 0.3;
  }
  
  /**
   * Update method to be called each frame
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    // Update flash effect
    if (this.flashActive) {
      this.flashTimeLeft -= deltaTime;
      
      if (this.flashTimeLeft <= 0) {
        this.flashActive = false;
      }
    }
    
    // Update fade effect
    if (this.fadeActive) {
      const diff = this.fadeTarget - this.fadeAmount;
      if (Math.abs(diff) < 0.01) {
        this.fadeAmount = this.fadeTarget;
      } else {
        this.fadeAmount += diff * this.fadeSpeed;
      }
      
      if (this.fadeAmount === this.fadeTarget) {
        this.fadeActive = false;
      }
    }
  }
  
  /**
   * Draw all active screen effects
   */
  draw() {
    // Draw flash effect
    if (this.flashActive && this.flashTimeLeft > 0) {
      const alpha = (this.flashTimeLeft / this.flashDuration) * this.flashIntensity;
      this.ctx.fillStyle = this.getRGBAString(this.flashColor, alpha);
      this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    // Draw fade effect
    if (this.fadeActive || this.fadeAmount > 0) {
      this.ctx.fillStyle = this.getRGBAString(this.fadeColor, this.fadeAmount);
      this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    // Draw vignette effect
    if (this.vignetteActive) {
      this.drawVignette();
    }
  }
  
  /**
   * Trigger a screen flash effect
   * @param {string} color - Color of the flash (default: white)
   * @param {number} intensity - Intensity of the flash from 0-1 (default: 0.7)
   * @param {number} duration - Duration of the flash in seconds (default: 0.3)
   */
  triggerFlash(color = 'white', intensity = 0.7, duration = 0.3) {
    this.flashActive = true;
    this.flashColor = color;
    this.flashIntensity = intensity;
    this.flashDuration = duration;
    this.flashTimeLeft = duration;
  }
  
  /**
   * Fade the screen to or from a color
   * @param {string} color - Color to fade to/from (default: black)
   * @param {number} target - Target opacity from 0-1 (default: 1)
   * @param {number} speed - Speed of the fade (default: 0.05)
   */
  fadeToColor(color = 'black', target = 1, speed = 0.05) {
    this.fadeActive = true;
    this.fadeColor = color;
    this.fadeTarget = target;
    this.fadeSpeed = speed;
  }
  
  /**
   * Reset all fade effects
   */
  resetFade() {
    this.fadeActive = false;
    this.fadeAmount = 0;
    this.fadeTarget = 0;
  }
  
  /**
   * Toggle vignette effect
   * @param {boolean} active - Whether to enable the vignette
   * @param {number} intensity - Intensity of the vignette from 0-1 (default: 0.3)
   */
  setVignette(active, intensity = 0.3) {
    this.vignetteActive = active;
    this.vignetteIntensity = intensity;
  }
  
  /**
   * Draw vignette effect (darkened edges)
   */
  drawVignette() {
    const gradient = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, 10,
      this.width / 2, this.height / 2, this.width / 1.5
    );
    
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(0,0,0,${this.vignetteIntensity})`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  
  /**
   * Helper to convert color and alpha to rgba string
   * @param {string} color - CSS color name or hex
   * @param {number} alpha - Alpha value from 0-1
   * @returns {string} RGBA string for canvas
   */
  getRGBAString(color, alpha) {
    // Handle hex colors
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    // Handle named colors
    return `rgba(${color}, ${alpha})`;
  }
} 