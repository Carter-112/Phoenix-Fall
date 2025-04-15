import { Hazard } from 'hazard';

export class LavaGolem extends Hazard {
    constructor(x, y, speed, health) {
        super(x, y, speed, health);
        this.width = 80;
        this.height = 120;
        this.damage = 40;
        this.frameCount = 0;
        this.active = true;
        
        // Golem-specific properties
        this.armLength = 50;
        this.armPhase = 0;
        this.armSpeed = 0.05;
        this.crackGlowIntensity = 0;
        this.glowDirection = 1;
        
        // Initialize lava drops
        this.lavaDrops = [];
        for (let i = 0; i < 8; i++) {
            this.lavaDrops.push({
                x: 0,
                y: 0,
                size: 3 + Math.random() * 3,
                speed: 2 + Math.random() * 2,
                active: false,
                delay: Math.random() * 1000
            });
        }
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.frameCount++;
        
        // Update arm animation
        this.armPhase += this.armSpeed;
        
        // Update crack glow effect
        this.crackGlowIntensity += 0.03 * this.glowDirection;
        if (this.crackGlowIntensity >= 1) this.glowDirection = -1;
        if (this.crackGlowIntensity <= 0) this.glowDirection = 1;
        
        // Update lava drops
        this.lavaDrops.forEach(drop => {
            if (!drop.active && this.frameCount > drop.delay) {
                drop.active = true;
                drop.x = this.x + (Math.random() - 0.5) * this.width * 0.8;
                drop.y = this.y - this.height/2;
            }
            
            if (drop.active) {
                drop.y += drop.speed;
                if (drop.y > this.y + this.height) {
                    drop.active = false;
                    drop.delay = this.frameCount + Math.random() * 1000;
                }
            }
        });
    }

    draw(ctx) {
        // Draw lava glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.width
        );
        gradient.addColorStop(0, 'rgba(255, 50, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 30, 0, 0)');
        
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw the body
        ctx.fillStyle = '#4a4a4a';
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 3;
        
        // Main body (rocky texture)
        ctx.beginPath();
        ctx.rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        ctx.fill();
        ctx.stroke();
        
        // Draw lava cracks
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 100, 0, ${0.7 + this.crackGlowIntensity * 0.3})`;
        ctx.lineWidth = 2;
        this.drawCracks(ctx);
        ctx.stroke();
        
        // Draw arms
        this.drawArms(ctx);
        
        // Draw lava drops
        this.lavaDrops.forEach(drop => {
            if (drop.active) {
                const dropGradient = ctx.createRadialGradient(
                    drop.x, drop.y, 0,
                    drop.x, drop.y, drop.size
                );
                dropGradient.addColorStop(0, 'rgba(255, 200, 0, 0.9)');
                dropGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
                
                ctx.beginPath();
                ctx.fillStyle = dropGradient;
                ctx.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    drawCracks(ctx) {
        // Generate random-looking but consistent cracks
        const crackPoints = [
            { x: this.x - this.width * 0.3, y: this.y - this.height * 0.4 },
            { x: this.x + this.width * 0.2, y: this.y },
            { x: this.x - this.width * 0.1, y: this.y + this.height * 0.3 }
        ];
        
        crackPoints.forEach(point => {
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(point.x + Math.cos(this.frameCount * 0.02) * 20,
                      point.y + Math.sin(this.frameCount * 0.02) * 20);
        });
    }

    drawArms(ctx) {
        const leftX = this.x - this.width/2;
        const rightX = this.x + this.width/2;
        const centerY = this.y;
        
        // Arm movement pattern
        const leftArmY = centerY + Math.sin(this.armPhase) * 20;
        const rightArmY = centerY + Math.sin(this.armPhase + Math.PI) * 20;
        
        // Draw left arm
        ctx.beginPath();
        ctx.lineWidth = 15;
        ctx.strokeStyle = '#4a4a4a';
        ctx.moveTo(leftX, centerY);
        ctx.lineTo(leftX - this.armLength, leftArmY);
        ctx.stroke();
        
        // Draw right arm
        ctx.beginPath();
        ctx.moveTo(rightX, centerY);
        ctx.lineTo(rightX + this.armLength, rightArmY);
        ctx.stroke();
        
        // Draw lava highlights on arms
        ctx.lineWidth = 5;
        ctx.strokeStyle = `rgba(255, 100, 0, ${0.6 + this.crackGlowIntensity * 0.4})`;
        ctx.beginPath();
        ctx.moveTo(leftX, centerY);
        ctx.lineTo(leftX - this.armLength, leftArmY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(rightX, centerY);
        ctx.lineTo(rightX + this.armLength, rightArmY);
        ctx.stroke();
    }
}