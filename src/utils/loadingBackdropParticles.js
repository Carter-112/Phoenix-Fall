/**
 * Loading Backdrop Particles
 * 
 * Adds subtle floating particles to the loading screen backdrop
 * for enhanced visual interest and atmosphere.
 * Includes interactive movement that responds to mouse/touch input.
 */
export class LoadingBackdropParticles {
  constructor(backdropElement) {
    this.backdropElement = backdropElement;
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationFrame = null;
    this.initialized = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.isMouseActive = false;
    this.mouseActiveTimer = 0;
    this.lastTouchTime = 0;
  }
  initialize() {
    if (this.initialized) return;
    // Create canvas for particles
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'loading-particles-canvas';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'auto'; // Enable pointer events for interaction
    this.canvas.style.zIndex = '9001'; // Same as loading content to appear on top
    
    // Add canvas to backdrop
    this.backdropElement.appendChild(this.canvas);
    
    // Get context
    this.ctx = this.canvas.getContext('2d');
    
    // Resize canvas to match window
    this.resizeCanvas();
    
    // Create particles
    this.createParticles();
    
    // Start animation
    this.animate();
    
    // Add event listeners
    window.addEventListener('resize', this.resizeCanvas.bind(this));
    this.addInteractionListeners();
    
    this.initialized = true;
  }
  
  resizeCanvas() {
    if (!this.canvas) return;
    
    // Set canvas dimensions to match window
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Set mouse target to center of screen on resize
    this.targetMouseX = this.canvas.width / 2;
    this.targetMouseY = this.canvas.height / 2;
    
    // Recreate particles when canvas size changes
    if (this.initialized) {
      this.createParticles();
    }
  }
  
  createParticles() {
    // Clear existing particles
    this.particles = [];
    
    // Calculate number of particles based on screen size (increased for more particles)
    const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 12000);
    
    // Create new particles
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 3 + 1, // 1-4px
        baseSize: Math.random() * 3 + 1, // Store original size for reference
        speedX: Math.random() * 0.5 - 0.25, // -0.25 to 0.25
        speedY: Math.random() * 0.5 - 0.25, // -0.25 to 0.25
        opacity: Math.random() * 0.5 + 0.2, // 0.2-0.7
        baseOpacity: Math.random() * 0.5 + 0.2, // Store original opacity
        color: this.getRandomFireColor(),
        pulseSpeed: Math.random() * 0.02 + 0.01, // For size pulsing
        pulsePhase: Math.random() * Math.PI * 2, // Random starting phase
        interactionForce: Math.random() * 2 + 1, // Random interaction strength
        friction: 0.95 + Math.random() * 0.04, // Friction to slow down movement
        mass: Math.random() * 3 + 0.5, // Mass affects how much particles are pulled
        vx: 0, // Velocity X component for physics
        vy: 0, // Velocity Y component for physics
        angle: Math.random() * Math.PI * 2 // Random angle for movement
      });
    }
  }
  
  getRandomFireColor() {
    // Phoenix fire colors: from dark red to bright orange/yellow
    const colors = [
      'rgba(255, 50, 0, ', // bright red
      'rgba(255, 100, 0, ', // orange-red
      'rgba(255, 150, 0, ', // orange
      'rgba(255, 200, 0, ', // yellow-orange
      'rgba(150, 30, 0, '   // dark red
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  addInteractionListeners() {
    // Mouse movement tracking for desktop
    this.canvas.addEventListener('mousemove', (e) => {
      this.targetMouseX = e.clientX;
      this.targetMouseY = e.clientY;
      this.isMouseActive = true;
      this.mouseActiveTimer = 120; // Frames to keep mouse influence active
    });
    
    // Touch movement tracking for mobile
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault(); // Prevent scrolling when interacting with particles
      const touch = e.touches[0];
      this.targetMouseX = touch.clientX;
      this.targetMouseY = touch.clientY;
      this.isMouseActive = true;
      this.mouseActiveTimer = 120;
      this.lastTouchTime = Date.now();
    });
    
    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.targetMouseX = touch.clientX;
      this.targetMouseY = touch.clientY;
      this.isMouseActive = true;
      this.mouseActiveTimer = 120;
      this.lastTouchTime = Date.now();
    });
    
    // Gradually move to center when mouse leaves
    this.canvas.addEventListener('mouseleave', () => {
      // We'll let the animate loop handle this transition
      this.mouseActiveTimer = 30; // Shorter fade out when mouse leaves
    });
    
    // Touch end - set a timer to gradually reduce influence
    this.canvas.addEventListener('touchend', () => {
      this.mouseActiveTimer = 60;
    });
  }
  
  animate() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Smooth mouse movement by easing current position toward target
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.1;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.1;
    
    // Decrease active timer if interaction has stopped
    if (this.mouseActiveTimer > 0) {
      this.mouseActiveTimer--;
    } else if (this.isMouseActive) {
      // When timer runs out, gradually move influence point to center
      this.isMouseActive = false;
      this.targetMouseX = this.canvas.width / 2;
      this.targetMouseY = this.canvas.height / 2;
    }
    
    // Calculate interaction strength based on timer
    const interactionStrength = this.mouseActiveTimer > 0 ? 
                               Math.min(1, this.mouseActiveTimer / 60) : 0;
    
    // Update and draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      // Apply interactive force toward mouse position if mouse is active
      if (interactionStrength > 0) {
        // Calculate distance from particle to mouse
        const dx = this.mouseX - p.x;
        const dy = this.mouseY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Skip particles too far from mouse position
        if (distance < 200) {
          // Calculate attraction/repulsion force
          // Particles closer than 50px are pushed away, particles further are attracted
          const force = distance < 50 ? -0.2 : 0.05;
          const strength = (1 - Math.min(1, distance / 200)) * force * interactionStrength * p.interactionForce;
          
          // Apply force to particle velocity
          p.vx += (dx / distance) * strength / p.mass;
          p.vy += (dy / distance) * strength / p.mass;
          
          // Increase size when interacting
          const sizeFactor = 1 + (0.5 * interactionStrength * (1 - Math.min(1, distance / 150)));
          p.size = p.baseSize * sizeFactor;
          
          // Increase opacity based on interaction
          p.opacity = Math.min(1, p.baseOpacity * (1 + interactionStrength * 0.5));
        }
      } else {
        // Gradually return to base size and opacity
        p.size += (p.baseSize - p.size) * 0.05;
        p.opacity += (p.baseOpacity - p.opacity) * 0.05;
      }
      
      // Apply friction to gradually slow down particles
      p.vx *= p.friction + 0.001; // Slightly higher friction for smoother motion
      p.vy *= p.friction + 0.001;
      
      // Add some baseline movement
      p.vx += p.speedX * 0.1;
      p.vy += p.speedY * 0.1;
      
      // Update position based on velocity
      p.x += p.vx;
      p.y += p.vy;
      
      // Reset particle if it goes off screen
      if (p.x < -50) p.x = this.canvas.width + 50;
      if (p.x > this.canvas.width + 50) p.x = -50;
      if (p.y < -50) p.y = this.canvas.height + 50;
      if (p.y > this.canvas.height + 50) p.y = -50;
      
      // Apply subtle movement based on time for more organic feeling
      const time = Date.now() / 1000;
      const waveX = Math.sin(time * 0.5 + i) * 0.5;
      const waveY = Math.cos(time * 0.3 + i) * 0.5;
      
      // Draw particle with subtle glow
      this.ctx.beginPath();
      this.ctx.arc(p.x + waveX, p.y + waveY, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + p.opacity + ')';
      this.ctx.fill();
      
      // Add glow effect to some particles
      if (p.size > 1.5) {
        this.ctx.beginPath();
        this.ctx.arc(p.x + waveX, p.y + waveY, p.size * 2, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color + (p.opacity * 0.3) + ')';
        this.ctx.fill();
      }
    }
    
    // Request next frame
    this.animationFrame = requestAnimationFrame(this.animate.bind(this));
  }
  
  show() {
    if (!this.initialized) {
      this.initialize();
    }
    
    if (this.canvas) {
      this.canvas.style.display = 'block';
    }
    
    // Initialize mouse position to center when first shown
    if (this.canvas) {
      this.targetMouseX = this.canvas.width / 2;
      this.targetMouseY = this.canvas.height / 2;
      this.mouseX = this.targetMouseX;
      this.mouseY = this.targetMouseY;
    }
    
    // Resume animation if it was stopped
    if (!this.animationFrame) {
      this.animate();
    }
  }
  
  hide() {
    if (this.canvas) {
      this.canvas.style.display = 'none';
    }
    
    // Stop animation to save resources
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  
  cleanup() {
    // Stop animation
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // Remove all event listeners
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.handleMouseMove);
      this.canvas.removeEventListener('touchmove', this.handleTouchMove);
      this.canvas.removeEventListener('touchstart', this.handleTouchStart);
      this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
      this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    }
    
    // Remove resize listener
    window.removeEventListener('resize', this.resizeCanvas.bind(this));
    
    // Remove canvas from DOM
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    
    this.initialized = false;
  }
}