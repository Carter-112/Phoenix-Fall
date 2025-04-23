/**
 * TargetIndicator class for visualizing target location
 * Used by entities that need to show targeting information
 */
export class TargetIndicator {
  constructor() {
    this.angle = 0;
    this.pulseSize = 1;
    this.opacity = 0;
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.size = 30;
  }

  /**
   * Update the indicator animation
   * @param {number} deltaTime - Time elapsed since last frame
   */
  update(deltaTime) {
    // Rotate the indicator
    this.angle += 2 * deltaTime;
    if (this.angle > Math.PI * 2) {
      this.angle -= Math.PI * 2;
    }
    
    // Pulse the indicator size
    this.pulseSize = 1 + 0.3 * Math.sin(Date.now() / 100);
  }

  /**
   * Draw the target indicator on canvas
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
   * @param {number} x - The x position of the entity
   * @param {number} y - The y position of the entity
   * @param {number} targetX - The target x position
   * @param {number} targetY - The target y position
   */
  draw(ctx, x, y, targetX, targetY) {
    if (this.opacity <= 0) return;
    
    ctx.save();
    
    // Store positions
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    
    // Draw glowing circle around entity
    const baseSize = this.size;
    const pulseSize = baseSize * this.pulseSize;
    
    // Create a bright red glow
    const glowGradient = ctx.createRadialGradient(
      x, y, baseSize * 0.5,
      x, y, pulseSize
    );
    
    glowGradient.addColorStop(0, `rgba(255, 50, 50, ${0.7 * this.opacity})`);
    glowGradient.addColorStop(0.6, `rgba(255, 30, 30, ${0.4 * this.opacity})`);
    glowGradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw targeting triangles around the entity
    ctx.strokeStyle = `rgba(255, 50, 50, ${this.opacity})`;
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 3; i++) {
      const angle = this.angle + (i * Math.PI * 2 / 3);
      const distance = pulseSize * 1.2;
      
      const triangleX = x + Math.cos(angle) * distance;
      const triangleY = y + Math.sin(angle) * distance;
      
      // Draw triangle pointer
      ctx.beginPath();
      ctx.moveTo(
        triangleX + Math.cos(angle) * 10,
        triangleY + Math.sin(angle) * 10
      );
      ctx.lineTo(
        triangleX + Math.cos(angle + Math.PI * 0.8) * 8,
        triangleY + Math.sin(angle + Math.PI * 0.8) * 8
      );
      ctx.lineTo(
        triangleX + Math.cos(angle - Math.PI * 0.8) * 8,
        triangleY + Math.sin(angle - Math.PI * 0.8) * 8
      );
      ctx.closePath();
      ctx.stroke();
    }
    
    // Draw targeting line to target when set
    if (targetX !== undefined && targetY !== undefined) {
      const dx = targetX - x;
      const dy = targetY - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > pulseSize) {
        const angle = Math.atan2(dy, dx);
        const lineLength = Math.min(distance - pulseSize, 100);
        
        // Calculate start and end points for the line
        const startX = x + Math.cos(angle) * pulseSize;
        const startY = y + Math.sin(angle) * pulseSize;
        const endX = startX + Math.cos(angle) * lineLength;
        const endY = startY + Math.sin(angle) * lineLength;
        
        // Create gradient for line
        const lineGradient = ctx.createLinearGradient(startX, startY, endX, endY);
        lineGradient.addColorStop(0, `rgba(255, 50, 50, ${this.opacity})`);
        lineGradient.addColorStop(1, `rgba(255, 50, 50, 0)`);
        
        // Draw dotted targeting line
        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    
    ctx.restore();
  }
  
  /**
   * Show the indicator
   */
  show() {
    this.opacity = 1;
    this.angle = 0;
    this.pulseSize = 1;
  }
  
  /**
   * Hide the indicator
   */
  hide() {
    this.opacity = 0;
  }
  
  /**
   * Fade out the indicator
   * @param {number} deltaTime - Time elapsed since last frame
   */
  fadeOut(deltaTime) {
    this.opacity -= deltaTime * 3;
    if (this.opacity < 0) this.opacity = 0;
  }
} 