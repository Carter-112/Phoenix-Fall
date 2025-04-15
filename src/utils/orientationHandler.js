/**
 * Handles device orientation changes for mobile devices
 * This ensures proper UI adjustments when rotating between portrait and landscape
 */
export class OrientationHandler {
  constructor(game) {
    this.game = game;
    this.currentOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    
    // Store last dimensions to detect real orientation changes
    this.lastWidth = window.innerWidth;
    this.lastHeight = window.innerHeight;
    
    // Bind event handlers
    this.orientationChangeHandler = this.handleOrientationChange.bind(this);
    this.resizeHandler = this.handleResize.bind(this);
    this.keyboardHandler = this.handleKeyboard.bind(this);
    
    // Set up event listeners
    window.addEventListener('orientationchange', this.orientationChangeHandler);
    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('keydown', this.keyboardHandler);
    
    // Set up mouse wheel event for PC zoom
    window.addEventListener('wheel', (e) => {
      // Prevent default zoom behavior on PC
      if (e.ctrlKey) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // Log initial orientation
    console.log(`Initial orientation: ${this.currentOrientation}`);
    console.log(`Platform type: ${this.getPlatformType()}`);
  }
  
  /**
   * Detect platform type (mobile or desktop)
   * @returns {string} 'mobile' or 'desktop'
   */
  getPlatformType() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android|ipad|iphone|ipod/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }
  
  /**
   * Handle keyboard events for PC controls
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyboard(e) {
    // Only handle keyboard if game instance exists
    if (!this.game || !this.game.phoenix) return;
    
    const speed = 10;
    
    switch (e.key) {
      case 'ArrowLeft':
        this.game.phoenix.targetX = Math.max(0, this.game.phoenix.x - speed);
        break;
      case 'ArrowRight':
        this.game.phoenix.targetX = Math.min(window.innerWidth, this.game.phoenix.x + speed);
        break;
      case 'ArrowUp':
        this.game.phoenix.targetY = Math.max(0, this.game.phoenix.y - speed);
        break;
      case 'ArrowDown':
        this.game.phoenix.targetY = Math.min(window.innerHeight, this.game.phoenix.y + speed);
        break;
      case ' ':
        // Space bar for special attack
        if (this.game.triggerPhoenixSpecialAttack) {
          this.game.triggerPhoenixSpecialAttack(this.game.phoenix.x, this.game.phoenix.y);
        }
        break;
    }
  }
  
  /**
   * Handle orientation change events
   */
  handleOrientationChange() {
    // Wait for the orientation change to complete
    setTimeout(() => {
      this.updateOrientation();
    }, 200);
  }
  
  /**
   * Handle resize events that might indicate orientation changes
   */
  handleResize() {
    // Check if this is likely an orientation change
    const isOrientationChange = 
      (window.innerWidth > window.innerHeight && this.lastWidth < this.lastHeight) ||
      (window.innerWidth < window.innerHeight && this.lastWidth > this.lastHeight);
    
    // Update stored dimensions
    this.lastWidth = window.innerWidth;
    this.lastHeight = window.innerHeight;
    
    if (isOrientationChange) {
      this.updateOrientation();
    }
  }
  
  /**
   * Update orientation status and adjust UI accordingly
   */
  updateOrientation() {
    const newOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    
    // Only proceed if orientation actually changed
    if (newOrientation !== this.currentOrientation) {
      console.log(`Orientation changed: ${this.currentOrientation} → ${newOrientation}`);
      this.currentOrientation = newOrientation;
      
      // Adjust UI based on new orientation
      this.adjustUI(newOrientation);
      
      // Trigger a canvas redraw if game is running
      if (this.game && this.game.render) {
        this.game.render();
      }
    }
  }
  
  /**
   * Adjust UI elements based on orientation
   * @param {string} orientation - 'portrait' or 'landscape'
   */
  adjustUI(orientation) {
    // Adjust rank bar
    const rankBar = document.querySelector('.rank-bar-container');
    if (rankBar) {
      if (orientation === 'portrait') {
        rankBar.style.width = '85%';
        rankBar.style.maxWidth = '400px';
      } else {
        rankBar.style.width = '60%';
        rankBar.style.maxWidth = '500px';
      }
    }
    
    // Adjust settings button position
    const settingsButton = document.querySelector('.settings-button');
    if (settingsButton) {
      if (orientation === 'portrait') {
        settingsButton.style.top = '110px';
      } else {
        settingsButton.style.top = '120px';
      }
    }
    
    // Adjust pause menu
    if (this.game && this.game.pauseMenu && this.game.pauseMenu.menuElement) {
      const menuPanel = this.game.pauseMenu.menuElement.querySelector('.pause-menu-panel');
      if (menuPanel) {
        if (orientation === 'portrait') {
          menuPanel.style.width = '90%';
          menuPanel.style.maxWidth = '320px';
        } else {
          menuPanel.style.width = '80%';
          menuPanel.style.maxWidth = '350px';
        }
      }
    }
    
    // Adjust world selector if in main menu
    if (window.mainMenu && window.mainMenu.worldSelector) {
      if (orientation === 'portrait') {
        // Make world selector vertical in portrait mode
        window.mainMenu.worldSelector.style.flexDirection = 'column';
        window.mainMenu.worldSelector.style.gap = '5px';
        
        // Make world buttons larger on mobile portrait
        const worldButtons = window.mainMenu.worldSelector.querySelectorAll('.world-button');
        worldButtons.forEach(button => {
          button.style.width = '100px';
          button.style.height = '100px';
          button.style.margin = '5px';
          
          // Enlarge world number
          const worldNumber = button.querySelector('div');
          if (worldNumber) {
            worldNumber.style.fontSize = '2.5rem';
          }
        });
        
        // Adjust world labels
        const worldLabels = window.mainMenu.worldSelector.querySelectorAll('.world-label');
        worldLabels.forEach(label => {
          label.style.fontSize = '1.1rem';
          label.style.fontWeight = 'bold';
        });
        
        // Adjust world description
        const worldDescription = document.querySelector('.world-description');
        if (worldDescription) {
          worldDescription.style.width = '90%';
          worldDescription.style.padding = '10px';
          worldDescription.style.marginTop = '15px';
        }
      } else {
        // Landscape mode
        window.mainMenu.worldSelector.style.flexDirection = 'row';
        window.mainMenu.worldSelector.style.gap = '20px';
        
        // Reset world buttons to normal size
        const worldButtons = window.mainMenu.worldSelector.querySelectorAll('.world-button');
        worldButtons.forEach(button => {
          button.style.width = '80px';
          button.style.height = '80px';
          button.style.margin = '10px';
          
          // Reset world number
          const worldNumber = button.querySelector('div');
          if (worldNumber) {
            worldNumber.style.fontSize = '2rem';
          }
        });
        
        // Reset world labels
        const worldLabels = window.mainMenu.worldSelector.querySelectorAll('.world-label');
        worldLabels.forEach(label => {
          label.style.fontSize = '0.9rem';
          label.style.fontWeight = 'normal';
        });
        
        // Reset world description
        const worldDescription = document.querySelector('.world-description');
        if (worldDescription) {
          worldDescription.style.width = '80%';
          worldDescription.style.padding = '15px';
          worldDescription.style.marginTop = '20px';
        }
      }
    }
    
    // Dispatch custom event for other components to respond to
    const orientationEvent = new CustomEvent('gameorientationchange', {
      detail: { orientation: orientation }
    });
    window.dispatchEvent(orientationEvent);
  }
  
  /**
   * Clean up event listeners when not needed
   */
  cleanup() {
    window.removeEventListener('orientationchange', this.orientationChangeHandler);
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('keydown', this.keyboardHandler);
    console.log('OrientationHandler: Event listeners removed');
  }
} 