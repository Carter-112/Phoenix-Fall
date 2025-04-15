/**
 * Loading Animation Manager
 * 
 * Creates and controls a loading animation that displays during game initialization
 * and other loading moments. Uses CSS animations and particle effects for smooth,
 * visually appealing performance.
 */
// Fix the broken import
// import { LoadingBackdropParticles } from 'loadingBackdropParticles';

// Simple fallback implementation for LoadingBackdropParticles if missing
class LoadingBackdropParticles {
  constructor(element) {
    this.element = element;
    this.particles = [];
    this.initialized = false;
  }

  initialize() {
    // No-op implementation
    this.initialized = true;
  }

  update() {
    // No-op implementation
  }
}

export class LoadingAnimation {
  constructor() {
    this.loadingElement = null;
    this.initialized = false;
    this.backdropElement = null;
    this.particleSystem = null;
    this.typingInterval = null;
    this.fullText = '';
    this.titleElement = null;
    this.isHiding = false; // Track if a hide operation is in progress
    this.timeout = null; // Store timeout reference
  }
  
  /**
   * Initialize the loading animation elements
   */
  initialize() {
    if (this.initialized) return;
    
    // Create backdrop with full black color for complete coverage
    this.backdropElement = document.createElement('div');
    this.backdropElement.className = 'loading-screen-backdrop';
    this.backdropElement.style.position = 'fixed';
    this.backdropElement.style.top = '0';
    this.backdropElement.style.left = '0';
    this.backdropElement.style.width = '100vw';
    this.backdropElement.style.height = '100vh';
    this.backdropElement.style.background = 'linear-gradient(45deg, #000000, #1a0000, #240000, #1a0000, #000000)';
    this.backdropElement.style.backgroundSize = '400% 400%';
    this.backdropElement.style.animation = 'gradientShift 15s ease infinite';
    this.backdropElement.style.zIndex = '9000';
    this.backdropElement.style.opacity = '0'; // Start with zero opacity for fade-in
    this.backdropElement.style.display = 'none'; // Hide initially
    this.backdropElement.style.pointerEvents = 'all';
    
    // Create main container
    this.loadingElement = document.createElement('div');
    this.loadingElement.className = 'loading-screen';
    this.loadingElement.style.position = 'fixed';
    this.loadingElement.style.top = '0';
    this.loadingElement.style.left = '0';
    this.loadingElement.style.width = '100vw';
    this.loadingElement.style.height = '100vh';
    this.loadingElement.style.display = 'flex';
    this.loadingElement.style.flexDirection = 'column';
    this.loadingElement.style.justifyContent = 'center';
    this.loadingElement.style.alignItems = 'center';
    this.loadingElement.style.textAlign = 'center';
    this.loadingElement.style.zIndex = '9001';
    this.loadingElement.style.overflow = 'hidden';
    this.loadingElement.style.opacity = '0'; // Start with zero opacity for fade-in
    this.loadingElement.style.display = 'none'; // Hide initially
    this.loadingElement.style.pointerEvents = 'all';
    
    // Create title with fiery effect
    const title = document.createElement('h2');
    title.textContent = ''; // Start empty for typing effect
    title.style.color = '#FF5500';
    title.style.fontSize = '3.5rem';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '30px';
    title.style.textShadow = '0 0 10px rgba(255, 85, 0, 0.7), 0 0 20px rgba(255, 85, 0, 0.5)';
    title.style.letterSpacing = '3px';
    title.style.animation = 'flicker 3s infinite alternate';
    title.style.opacity = '1'; // Make immediately visible, not tied to animation
    title.style.textAlign = 'center'; // Ensure text is centered
    title.style.width = '100%'; // Ensure full width
    title.style.display = 'block'; // Changed from flex to block for better text centering
    title.style.margin = '0 auto';
    title.style.padding = '0 10px'; // Add some padding for better appearance on small screens
    this.titleElement = title; // Store reference for typing effect
    this.fullText = 'PHOENIX FALL'; // Store the full text to be typed
    
    // Create loading spinner container
    const spinnerContainer = document.createElement('div');
    spinnerContainer.className = 'spinner-container';
    spinnerContainer.style.position = 'relative';
    spinnerContainer.style.width = '200px';
    spinnerContainer.style.height = '200px';
    spinnerContainer.style.margin = '25px auto 0';
    spinnerContainer.style.display = 'flex';
    spinnerContainer.style.justifyContent = 'center';
    spinnerContainer.style.alignItems = 'center';
    spinnerContainer.style.alignSelf = 'center';
    spinnerContainer.style.animation = 'floatIn 0.8s ease-out 0.2s forwards';
    spinnerContainer.style.opacity = '0'; // Start invisible for the float-in animation
    spinnerContainer.style.left = 'auto';
    spinnerContainer.style.transform = 'none';
    
    // Create phoenix spinner with flame effect
    const phoenixSpinner = document.createElement('div');
    phoenixSpinner.className = 'phoenix-spinner';
    phoenixSpinner.style.position = 'absolute';
    phoenixSpinner.style.top = '50%';
    phoenixSpinner.style.left = '50%';
    phoenixSpinner.style.width = '100%';
    phoenixSpinner.style.height = '100%';
    phoenixSpinner.style.transform = 'translate(-50%, -50%)';
    phoenixSpinner.style.border = '6px solid transparent';
    phoenixSpinner.style.borderTop = '6px solid #FF5500';
    phoenixSpinner.style.borderRight = '6px solid #FF8800';
    phoenixSpinner.style.borderRadius = '50%';
    phoenixSpinner.style.animation = 'spin 1.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite';
    phoenixSpinner.style.boxShadow = '0 0 20px rgba(255, 85, 0, 0.5)';
    
    // Create inner phoenix spinner
    const innerSpinner = document.createElement('div');
    innerSpinner.className = 'inner-spinner';
    innerSpinner.style.position = 'absolute';
    innerSpinner.style.top = '50%';
    innerSpinner.style.left = '50%';
    innerSpinner.style.width = 'calc(100% - 40px)';
    innerSpinner.style.height = 'calc(100% - 40px)';
    innerSpinner.style.transform = 'translate(-50%, -50%)';
    innerSpinner.style.border = '5px solid transparent';
    innerSpinner.style.borderBottom = '5px solid #FF9900';
    innerSpinner.style.borderLeft = '5px solid #FFCC00';
    innerSpinner.style.borderRadius = '50%';
    innerSpinner.style.animation = 'spin 1.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite reverse';
    innerSpinner.style.boxShadow = '0 0 15px rgba(255, 153, 0, 0.5) inset';
    
    // Create phoenix icon with trail container
    const phoenixIconContainer = document.createElement('div');
    phoenixIconContainer.className = 'phoenix-icon-container';
    phoenixIconContainer.style.position = 'absolute';
    phoenixIconContainer.style.top = '50%';
    phoenixIconContainer.style.left = '50%';
    phoenixIconContainer.style.width = '130px';
    phoenixIconContainer.style.height = '130px';
    phoenixIconContainer.style.transform = 'translate(-50%, -50%)';
    phoenixIconContainer.style.margin = '0';
    phoenixIconContainer.style.padding = '0';
    phoenixIconContainer.style.zIndex = '1';
    phoenixIconContainer.style.position = 'absolute';
    phoenixIconContainer.style.top = '50%';
    phoenixIconContainer.style.left = '50%';
    
    // Create the actual phoenix icon
    const phoenixIcon = document.createElement('div');
    phoenixIcon.className = 'phoenix-icon';
    phoenixIcon.style.position = 'absolute';
    phoenixIcon.style.top = '50%';
    phoenixIcon.style.left = '50%';
    phoenixIcon.style.transform = 'translate(-50%, -50%)';
    phoenixIcon.style.width = '80px';
    phoenixIcon.style.height = '80px';
    phoenixIcon.style.position = 'absolute';
    phoenixIcon.style.top = '50%';
    phoenixIcon.style.left = '50%';
    phoenixIcon.style.borderRadius = '50%';
    phoenixIcon.style.background = 'radial-gradient(circle, #FFCC00, #FF5500)';
    phoenixIcon.style.boxShadow = '0 0 25px rgba(255, 85, 0, 0.8), 0 0 40px rgba(255, 153, 0, 0.4)';
    phoenixIcon.style.animation = 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite';
    phoenixIcon.style.zIndex = '2';
    
    // Create trail container
    const trailContainer = document.createElement('div');
    trailContainer.className = 'flame-trail-container';
    trailContainer.style.position = 'absolute';
    trailContainer.style.top = '50%';
    trailContainer.style.left = '50%';
    trailContainer.style.width = '100%';
    trailContainer.style.height = '100%';
    trailContainer.style.transform = 'translate(-50%, -50%)';
    trailContainer.style.zIndex = '1';
    
    // Create flame trail particles
    const trailCount = 24; // Number of trail particles
    for (let i = 0; i < trailCount; i++) {
        const trail = document.createElement('div');
        trail.className = 'flame-trail';
        trail.style.position = 'absolute';
        trail.style.top = '50%';
        trail.style.left = '50%';
        trail.style.width = `${Math.random() * 12 + 18}px`; // Random size between 18-30px
        trail.style.height = `${Math.random() * 12 + 18}px`; // Random size between 18-30px
        trail.style.borderRadius = '50%';
        
        // Randomize trail colors
        const colorType = Math.random();
        if (colorType < 0.4) {
            trail.style.background = 'radial-gradient(circle, rgba(255,204,0,0.8), rgba(255,85,0,0.2))'; // Yellow to orange
        } else if (colorType < 0.7) {
            trail.style.background = 'radial-gradient(circle, rgba(255,140,0,0.8), rgba(255,50,0,0.2))'; // Orange to red
        } else {
            trail.style.background = 'radial-gradient(circle, rgba(255,255,150,0.8), rgba(255,150,0,0.2))'; // Bright yellow
        }
        
        // Set random initial position and animation delay
        const angle = (i / trailCount) * Math.PI * 2; // Evenly distribute around circle
        const distance = 10 + Math.random() * 5; // Initial distance from center
        const delay = i * (0.7 / trailCount); // Staggered delays based on position
        const duration = 1.5 + Math.random() * 1; // Random duration
        
        // Position relative to center
        trail.style.transform = `translate(-50%, -50%) translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(${0.5 + Math.random() * 0.5})`;
        
        // Custom animation for each trail particle
        trail.style.animation = `trailAnimation ${duration}s ${delay}s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95)`;
        trail.style.opacity = 0.8 + Math.random() * 0.2; // Random opacity
        
        trailContainer.appendChild(trail);
    }
    
    // Add phoenix wings to make it more representative
    const phoenixWings = document.createElement('div');
    phoenixWings.className = 'phoenix-wings';
    phoenixWings.style.position = 'absolute';
    phoenixWings.style.top = '0';
    phoenixWings.style.left = '0';
    phoenixWings.style.width = '100%';
    phoenixWings.style.height = '100%';
    phoenixWings.style.animation = 'wings 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';
    phoenixIcon.appendChild(phoenixWings);
    
    // Assemble the phoenix icon with trails
    phoenixIconContainer.appendChild(trailContainer);
    phoenixIconContainer.appendChild(phoenixIcon);
    
    // Create flame effects around the spinner (separate from the phoenix trail)
    for (let i = 0; i < 5; i++) {
      const flame = document.createElement('div');
      flame.className = 'flame';
      flame.style.position = 'absolute';
      flame.style.width = '25px';
      flame.style.height = '25px';
      flame.style.borderRadius = '50%';
      flame.style.background = 'radial-gradient(circle, rgba(255,204,0,0.8), rgba(255,85,0,0.3))';
      flame.style.boxShadow = '0 0 10px rgba(255, 85, 0, 0.6)';
      
      // Random positioning around the spinner
      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 30;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      flame.style.top = `calc(50% + ${y}px)`;
      flame.style.left = `calc(50% + ${x}px)`;
      flame.style.transform = 'translate(-50%, -50%)';
      
      // Random animation delay and duration
      const delay = Math.random() * 2;
      const duration = 1 + Math.random() * 2;
      flame.style.animation = `flameFloat ${duration}s cubic-bezier(0.4, 0, 0.6, 1) ${delay}s infinite alternate, flameGlow 1.5s cubic-bezier(0.4, 0, 0.6, 1) ${delay/2}s infinite alternate`;
      
      spinnerContainer.appendChild(flame);
    }
    
    // Create empty div to maintain layout spacing without text
    const spacerDiv = document.createElement('div');
    spacerDiv.style.height = '40px'; // Same margin as the former loading text had
    spacerDiv.style.width = '100%';
    spacerDiv.style.alignSelf = 'center';
    
    // Create and add improved CSS animations
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes gradientShift {
        0% { background-position: 0% 50% }
        50% { background-position: 100% 50% }
        100% { background-position: 0% 50% }
      }
      
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
    
      @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        50% { transform: translate(-50%, -50%) rotate(180deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }
      @keyframes floatIn {
        0% { transform: translateY(20px); opacity: 0; }
        60% { transform: translateY(-5px); opacity: 0.95; }
        100% { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes pulse {
        0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.7; }
        25% { transform: translate(-50%, -50%) scale(0.92); opacity: 0.8; }
        50% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
        75% { transform: translate(-50%, -50%) scale(0.92); opacity: 0.8; }
        100% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.7; }
      }
      
      @keyframes rotate {
        0% { transform: translate(-50%, -50%) rotate(0); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }
      
      @keyframes flicker {
        0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% {
          opacity: 0.99;
          text-shadow: 0 0 10px rgba(255, 85, 0, 0.7), 0 0 20px rgba(255, 85, 0, 0.5);
        }
        20%, 21.999%, 63%, 63.999%, 65%, 69.999% {
          opacity: 0.7;
          text-shadow: 0 0 10px rgba(255, 85, 0, 0.5), 0 0 15px rgba(255, 85, 0, 0.3);
        }
      }
      
      @keyframes titleGlow {
        0% {
          text-shadow: 0 0 10px rgba(255, 85, 0, 0.7), 0 0 20px rgba(255, 85, 0, 0.5);
        }
        50% {
          text-shadow: 0 0 15px rgba(255, 85, 0, 0.9), 0 0 30px rgba(255, 85, 0, 0.7), 0 0 45px rgba(255, 100, 0, 0.5);
        }
        100% {
          text-shadow: 0 0 10px rgba(255, 85, 0, 0.8), 0 0 25px rgba(255, 85, 0, 0.6), 0 0 35px rgba(255, 100, 0, 0.4);
        }
      }
      
      @keyframes trailAnimation {
        0% {
          transform: translate(-50%, -50%) rotate(0deg) translateY(15px) scale(0.7);
          opacity: 1;
        }
        25% {
          transform: translate(-50%, -50%) rotate(90deg) translateY(22px) scale(0.6);
          opacity: 0.9;
        }
        50% {
          transform: translate(-50%, -50%) rotate(180deg) translateY(30px) scale(0.4);
          opacity: 0.7;
          box-shadow: 0 0 15px rgba(255, 85, 0, 0.6), 0 0 20px rgba(255, 153, 0, 0.3);
        }
        75% {
          transform: translate(-50%, -50%) rotate(270deg) translateY(35px) scale(0.25);
          opacity: 0.3;
        }
        100% {
          transform: translate(-50%, -50%) rotate(360deg) translateY(40px) scale(0.1);
          opacity: 0;
          box-shadow: 0 0 8px rgba(255, 85, 0, 0.3);
        }
      }
      
      @keyframes wings {
        0%, 100% {
          box-shadow: 
            -30px -5px 20px -15px rgba(255, 153, 0, 0.7),
            30px -5px 20px -15px rgba(255, 153, 0, 0.7);
        }
        25%, 75% {
          box-shadow: 
            -35px -7px 25px -12px rgba(255, 153, 0, 0.75),
            35px -7px 25px -12px rgba(255, 153, 0, 0.75);
        }
        50% {
          box-shadow: 
            -40px -10px 30px -10px rgba(255, 153, 0, 0.8),
            40px -10px 30px -10px rgba(255, 153, 0, 0.8);
        }
      }
      
      @keyframes flameFloat {
        0% {
          transform: translate(-50%, -50%) scale(0.7);
          opacity: 0.4;
        }
        40% {
          transform: translate(-50%, -50%) translateY(-6px) scale(0.85);
          opacity: 0.6;
        }
        70% {
          transform: translate(-50%, -50%) translateY(-10px) scale(1.0);
          opacity: 0.8;
        }
        100% {
          transform: translate(-50%, -50%) translateY(-15px) scale(1.1);
          opacity: 0.9;
        }
      }
      
      @keyframes flameGlow {
        0% {
          box-shadow: 0 0 10px rgba(255, 85, 0, 0.6);
        }
        50% {
          box-shadow: 0 0 15px rgba(255, 115, 0, 0.7), 0 0 20px rgba(255, 133, 0, 0.35);
        }
        100% {
          box-shadow: 0 0 20px rgba(255, 85, 0, 0.8), 0 0 30px rgba(255, 153, 0, 0.4);
        }
      }
      
      /* Loading text animations removed */
      
      @media (max-width: 768px) {
        .loading-screen {
          padding: 20px;
          box-sizing: border-box;
        }
        
        .spinner-container {
          width: 160px !important;
          height: 160px !important;
          margin: 25px auto 0 !important;
        }
        
        .phoenix-icon {
          width: 65px !important;
          height: 65px !important;
        }
        
        .phoenix-icon-container {
          width: 100px !important;
          height: 100px !important;
        }
        
        .flame-trail {
          width: 12px !important;
          height: 12px !important;
        }
        .loading-screen h2 {
          font-size: 2.2rem !important;
          width: 100% !important;
          text-align: center !important;
          display: block !important;
          margin: 0 auto !important;
        }
        
        .spinner-container {
          width: 130px !important;
          height: 130px !important;
          margin: 0 auto !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          align-self: center !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          position: relative !important;
        }
        }
        
        .loading-screen {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          width: 100vw !important;
          height: 100vh !important;
          overflow: hidden !important;
        }
        
        .loading-text {
          font-size: 1.2rem !important;
          text-align: center !important;
        }
        
        .phoenix-icon {
          width: 50px !important;
          height: 50px !important;
        }
        
        .phoenix-icon-container {
          width: 80px !important;
          height: 80px !important;
        }
        
        .flame-trail {
          width: 12px !important;
          height: 12px !important;
        }
      }
      
      @media (max-width: 480px) {
        .loading-screen h2 {
          font-size: 1.8rem !important;
          width: 100% !important;
          display: flex !important;
          justify-content: center !important;
          padding: 0 15px !important;
        }
        
        .spinner-container {
          width: 140px !important;
          height: 140px !important;
          margin: 20px auto 0 !important;
        }
        
        .phoenix-icon {
          width: 55px !important;
          height: 55px !important;
        }
        
        .phoenix-icon-container {
          width: 90px !important;
          height: 90px !important;
        }
        
        .flame-trail {
          width: 10px !important;
          height: 10px !important;
        }
      }
      
      /* Add extra small screen sizes */
      @media (max-width: 360px) {
        .loading-screen h2 {
          font-size: 1.5rem !important;
          margin-bottom: 15px !important;
        }
        
        .spinner-container {
          width: 120px !important;
          height: 120px !important;
          margin: 15px auto 0 !important;
        }
        
        .phoenix-icon {
          width: 45px !important;
          height: 45px !important;
        }
        
        .phoenix-icon-container {
          width: 80px !important;
          height: 80px !important;
        }
        
        /* Adjust flame animations for smaller screens */
        .flame {
          width: 16px !important;
          height: 16px !important;
        }
      }
      
      /* Add orientation-specific adjustments */
      @media (max-height: 500px) and (orientation: landscape) {
        .loading-screen h2 {
          font-size: 1.6rem !important;
          margin-bottom: 10px !important;
        }
        
        .spinner-container {
          width: 130px !important;
          height: 130px !important;
          margin: 10px auto 0 !important;
        }
        
        /* Make container more compact in landscape */
        .centeringContainer {
          max-width: 400px !important;
        }
      }
    `;
    document.head.appendChild(styleElement);
    
    // Assemble the elements
    spinnerContainer.appendChild(phoenixSpinner);
    spinnerContainer.appendChild(innerSpinner);
    spinnerContainer.appendChild(phoenixIconContainer);
    
    // Create a container div for better centering
    const centeringContainer = document.createElement('div');
    centeringContainer.className = 'centeringContainer';
    centeringContainer.style.width = '100%';
    centeringContainer.style.display = 'flex';
    centeringContainer.style.flexDirection = 'column';
    centeringContainer.style.alignItems = 'center';
    centeringContainer.style.justifyContent = 'center';
    centeringContainer.style.position = 'absolute';
    centeringContainer.style.top = '55%'; // Keep vertical positioning
    centeringContainer.style.left = '40%'; // Move from 50% to 40% to position more left
    centeringContainer.style.transform = 'translate(-50%, -50%)';
    centeringContainer.style.padding = '0';
    centeringContainer.style.margin = '0';
    centeringContainer.style.width = '100%';
    centeringContainer.style.maxWidth = '500px';
    
    // Fix spinner container positioning
    spinnerContainer.style.left = 'auto';
    spinnerContainer.style.transform = 'none';
    spinnerContainer.style.position = 'relative';
    spinnerContainer.style.margin = '30px auto 0';
    spinnerContainer.style.top = '0'; // Remove any top offset
    
    // Ensure title is properly centered
    title.style.width = '100%';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    
    centeringContainer.appendChild(title);
    centeringContainer.appendChild(spinnerContainer);
    centeringContainer.appendChild(spacerDiv);
    
    this.loadingElement.appendChild(centeringContainer);
    
    // Initialize particle system
    this.particleSystem = new LoadingBackdropParticles(this.backdropElement);
    this.initialized = true;
  }
  
  /**
   * Show the loading animation
   */
  show() {
    // Clear any existing hide timeout
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    
    if (!this.initialized) {
      this.initialize();
    }
    
    const alreadyInDOM = document.body.contains(this.loadingElement);
    if (!alreadyInDOM) {
      // Add to DOM if not already present
      document.body.appendChild(this.backdropElement);
      document.body.appendChild(this.loadingElement);
    }
    
    // Make visible
    this.backdropElement.style.display = 'block';
    this.loadingElement.style.display = 'flex';
    
    // Add a tiny delay to ensure display has been applied before opacity transition
    requestAnimationFrame(() => {
      this.backdropElement.style.opacity = '1';
      this.loadingElement.style.opacity = '1';
      
      // Add animation keyframes if not already present
      this.ensureAnimationStyles();
      
      // Start the typing effect only if not already typed
      if (this.titleElement && this.titleElement.textContent !== this.fullText) {
        this.startTypingEffect();
      }
    });
  }
  
  /**
   * Hide the loading animation
   */
  hide() {
    if (this.isHiding) return; // Prevent multiple calls during transition
    
    this.isHiding = true;
    
    // Ensure there's something to hide
    if (!this.loadingElement || !this.backdropElement) {
      this.isHiding = false;
      return;
    }
    
    // Set a timeout to start the actual hiding once DOM updates have had time to occur
    this.timeout = setTimeout(() => {
      // Fade out with transition
      this.backdropElement.style.opacity = '0';
      this.loadingElement.style.opacity = '0';
      
      // Remove after transition
      this.timeout = setTimeout(() => {
        if (this.backdropElement.parentNode) {
          this.backdropElement.parentNode.removeChild(this.backdropElement);
        }
        
        if (this.loadingElement.parentNode) {
          this.loadingElement.parentNode.removeChild(this.loadingElement);
        }
        
        this.isHiding = false;
      }, 500); // Match transition duration
    }, 100);
  }
  
  /**
   * Ensure animation keyframes are added to document
   */
  ensureAnimationStyles() {
    if (document.getElementById('loading-animation-styles')) return;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'loading-animation-styles';
    styleSheet.textContent = `
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(0.95); }
        100% { transform: scale(1); }
      }
      @keyframes flicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.9; }
      }
      @keyframes floatIn {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes wings {
        0% { transform: scaleX(1); }
        50% { transform: scaleX(1.2); }
        100% { transform: scaleX(1); }
      }
      @keyframes trailAnimation {
        0% { transform: translate(-50%, -50%) translate(var(--startX, 0px), var(--startY, 0px)) scale(0.5); opacity: 0.8; }
        50% { opacity: 0.4; }
        100% { transform: translate(-50%, -50%) translate(var(--endX, 30px), var(--endY, 30px)) scale(0.1); opacity: 0; }
      }
    `;
    
    document.head.appendChild(styleSheet);
  }
  
  /**
   * Empty method to maintain compatibility with existing code
   * Previously used to update loading text which has been removed
   */
  updateLoadingText(text) {
    // Text display functionality has been removed
    return;
  }
  
  /**
   * Applies responsive adjustments based on current screen size and orientation
   * Called when showing the loading animation to ensure proper display
   */
  applyResponsiveAdjustments() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isLandscape = width > height;
    
    // Find our centering container
    const centeringContainer = this.loadingElement.querySelector('.centeringContainer');
    if (!centeringContainer) return;
    
    // Find title element
    const title = centeringContainer.querySelector('h2');
    // Find spinner container
    const spinnerContainer = centeringContainer.querySelector('.spinner-container');
    
    if (width <= 360) {
      // Extra small screens
      if (title) {
        title.style.fontSize = '1.5rem';
        title.style.marginBottom = '15px';
      }
      if (spinnerContainer) {
        spinnerContainer.style.width = '120px';
        spinnerContainer.style.height = '120px';
        spinnerContainer.style.margin = '15px auto 0';
      }
    } else if (width <= 480) {
      // Small screens
      if (title) {
        title.style.fontSize = '1.8rem';
        title.style.padding = '0 15px';
      }
      if (spinnerContainer) {
        spinnerContainer.style.width = '140px';
        spinnerContainer.style.height = '140px';
        spinnerContainer.style.margin = '20px auto 0';
      }
    } else if (width <= 768) {
      // Medium screens
      if (title) {
        title.style.fontSize = '2.2rem';
      }
      if (spinnerContainer) {
        spinnerContainer.style.width = '160px';
        spinnerContainer.style.height = '160px';
        spinnerContainer.style.margin = '25px auto 0';
      }
    }
    
    // Additional adjustments for landscape mode with small height
    if (isLandscape && height <= 500) {
      if (title) {
        title.style.fontSize = '1.6rem';
        title.style.marginBottom = '10px';
      }
      if (spinnerContainer) {
        spinnerContainer.style.width = '130px';
        spinnerContainer.style.height = '130px';
        spinnerContainer.style.margin = '10px auto 0';
      }
      if (centeringContainer) {
        centeringContainer.style.maxWidth = '400px';
      }
    }
    
    // Apply vertical and horizontal position adjustments for landscape orientation
    if (isLandscape) {
      // In landscape, we want a slightly different vertical position
      centeringContainer.style.top = '52%'; // Smaller adjustment for landscape
      centeringContainer.style.left = '45%'; // Less shift to the left in landscape mode
    }
  }
  
  /**
   * Start typing effect for title
   */
  startTypingEffect() {
    // Clear any existing typing interval
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
    
    // Ensure we have a titleElement to work with
    if (!this.titleElement) {
      console.error("Title element not found for typing effect");
      return;
    }
    
    // Initialize text as empty
    this.titleElement.textContent = '';
    
    // Variables for typing effect
    let charIndex = 0;
    
    // Start the typing interval
    this.typingInterval = setInterval(() => {
      if (charIndex <= this.fullText.length) {
        this.titleElement.textContent = this.fullText.slice(0, charIndex);
        charIndex++;
      } else {
        // Stop the interval when done
        clearInterval(this.typingInterval);
        this.typingInterval = null;
      }
    }, 100); // Time between characters
  }
}