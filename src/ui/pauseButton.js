/**
 * PauseButton Class - Creates an on-screen pause button for the game
 * 
 * Features:
 * - Positioned in the top-right corner of the screen
 * - Semi-transparent until touched/hovered
 * - Responsive design for all screen sizes
 * - Handles both touch and mouse events
 */
export class PauseButton {
    constructor(container, pauseCallback) {
      this.container = container;
      this.pauseCallback = pauseCallback;
      this.element = null;
      
      this.createButton();
      this.setupEventListeners();
    }
    
    createButton() {
      // Create pause button element
      const button = document.createElement('div');
      button.className = 'pause-button';
      button.style.position = 'absolute';
      button.style.top = '100px';
      button.style.right = '15px';
      button.style.width = '40px';
      button.style.height = '40px';
      button.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
      button.style.borderRadius = '50%';
      button.style.display = 'flex';
      button.style.justifyContent = 'center';
      button.style.alignItems = 'center';
      button.style.zIndex = '500';
      button.style.cursor = 'pointer';
      button.style.transition = 'transform 0.2s, background-color 0.2s, opacity 0.2s';
      button.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
      button.style.border = '2px solid #FF5500';
      button.style.opacity = '1';
      
      // Create pause icon (two vertical bars)
      const pauseIcon = document.createElement('div');
      pauseIcon.style.width = '40%';
      pauseIcon.style.height = '40%';
      pauseIcon.style.position = 'relative';
      
      // Left bar
      const leftBar = document.createElement('div');
      leftBar.style.position = 'absolute';
      leftBar.style.left = '0';
      leftBar.style.top = '0';
      leftBar.style.width = '30%';
      leftBar.style.height = '100%';
      leftBar.style.backgroundColor = '#FF5500';
      leftBar.style.borderRadius = '2px';
      
      // Right bar
      const rightBar = document.createElement('div');
      rightBar.style.position = 'absolute';
      rightBar.style.right = '0';
      rightBar.style.top = '0';
      rightBar.style.width = '30%';
      rightBar.style.height = '100%';
      rightBar.style.backgroundColor = '#FF5500';
      rightBar.style.borderRadius = '2px';
      
      // Assemble the button
      pauseIcon.appendChild(leftBar);
      pauseIcon.appendChild(rightBar);
      button.appendChild(pauseIcon);
      this.container.appendChild(button);
      
      // Store reference to the button element
      this.element = button;
      
      // Initially hidden
      this.hide();
    }
    
    setupEventListeners() {
      if (!this.element) return;
      
      // Mouse events
      this.element.addEventListener('mouseenter', () => {
        this.element.style.transform = 'scale(1.1)';
        this.element.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      });
      
      this.element.addEventListener('mouseleave', () => {
        this.element.style.transform = 'scale(1)';
        this.element.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
      });
      
      // Touch events
      this.element.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent default touch behavior
        this.element.style.transform = 'scale(1.1)';
        this.element.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      }, { passive: false });
      
      this.element.addEventListener('touchend', (e) => {
        e.preventDefault(); // Prevent default touch behavior
        this.element.style.transform = 'scale(1)';
        this.element.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        
        // Call pause callback
        if (this.pauseCallback) {
          this.pauseCallback();
        }
      }, { passive: false });
      
      // Click event for mouse
      this.element.addEventListener('click', () => {
        if (this.pauseCallback) {
          this.pauseCallback();
        }
      });
    }
    
    show() {
      if (this.element) {
        // Reset opacity and display before animation
        this.element.style.opacity = '0';
        this.element.style.display = 'flex';
        
        // Small animation when showing
        this.element.style.transform = 'scale(0.8)';
        
        // Trigger animation after a short delay
        setTimeout(() => {
          this.element.style.opacity = '1';
          this.element.style.transform = 'scale(1)';
        }, 10);
      }
    }
    
    hide() {
      if (this.element) {
        // Hide immediately without animation
        this.element.style.opacity = '0';
        this.element.style.transform = 'scale(0.8)';
        this.element.style.display = 'none';
      }
    }
  }