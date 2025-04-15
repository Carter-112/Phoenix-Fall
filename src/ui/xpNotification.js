export class XPNotification {
  constructor() {
    this.notifications = [];
    this.notificationLifetime = 3000; // 3 seconds
  }

  addNotification(amount) {
    const notification = {
      amount: amount,
      timestamp: Date.now(),
      opacity: 0,
      scale: 0.5,
      y: 0,
      // Initial position will be set when drawing
    };
    
    this.notifications.push(notification);
  }

  update() {
    const currentTime = Date.now();
    
    // Remove expired notifications
    this.notifications = this.notifications.filter(notification => {
      const elapsed = currentTime - notification.timestamp;
      return elapsed < this.notificationLifetime;
    });
    
    // Update animation states
    this.notifications.forEach(notification => {
      const elapsed = currentTime - notification.timestamp;
      const progress = elapsed / this.notificationLifetime;
      
      // Fade in quickly, then fade out
      if (progress < 0.2) {
        notification.opacity = progress * 5; // 0 to 1 in 20% of time
      } else if (progress > 0.7) {
        notification.opacity = 1 - ((progress - 0.7) / 0.3); // 1 to 0 in last 30% of time
      } else {
        notification.opacity = 1;
      }
      
      // Scale in quickly, then stay
      if (progress < 0.2) {
        notification.scale = 0.5 + (progress * 5) * 0.5; // 0.5 to 1 in 20% of time
      } else {
        notification.scale = 1;
      }
      
      // Float upward
      notification.y = -40 * progress; // Move upward as time passes
    });
  }

  draw(ctx, width, height) {
    if (this.notifications.length === 0) return;
    
    // Update notification states
    this.update();
    
    ctx.save();
    
    this.notifications.forEach(notification => {
      // Position at the top center of the screen
      const x = width / 2;
      const y = height / 4 + notification.y;
      
      // Draw the notification
      this.drawNotification(ctx, x, y, notification);
    });
    
    ctx.restore();
  }

  drawNotification(ctx, x, y, notification) {
    const scale = notification.scale;
    const opacity = notification.opacity;
    
    // Skip if fully transparent
    if (opacity <= 0) return;
    
    ctx.save();
    
    // Set global opacity
    ctx.globalAlpha = opacity;
    
    // Create a container box
    const boxWidth = 220 * scale;
    const boxHeight = 60 * scale;
    const boxX = x - boxWidth / 2;
    const boxY = y - boxHeight / 2;
    
    // Add a subtle shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Background for the notification
    const gradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxHeight);
    gradient.addColorStop(0, 'rgba(50, 50, 50, 0.9)');
    gradient.addColorStop(1, 'rgba(30, 30, 30, 0.9)');
    
    ctx.fillStyle = gradient;
    this.roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 10);
    ctx.fill();
    
    // Border with a glow effect
    ctx.strokeStyle = 'rgba(255, 120, 0, 0.8)';
    ctx.lineWidth = 2;
    this.roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 10);
    ctx.stroke();
    
    // Remove shadow for text
    ctx.shadowColor = 'transparent';
    
    // Title text
    ctx.fillStyle = '#FFA500';
    ctx.font = `${Math.floor(16 * scale)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('RANK XP GAINED', x, boxY + 22 * scale);
    
    // Amount with plus sign
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.floor(20 * scale)}px Arial`;
    ctx.fillText(`+${notification.amount} XP`, x, boxY + 45 * scale);
    
    ctx.restore();
  }

  // Helper method to draw rounded rectangles
  roundRect(ctx, x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }
}