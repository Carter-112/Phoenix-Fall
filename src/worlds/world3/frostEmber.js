import { Ember } from 'ember';

export class FrostEmber extends Ember {
    constructor(x, y, value = 100) {
        super(x, y, value);
        this.radius = 18;
        this.baseRadius = this.radius;
        this.crystalPoints = 6;
        this.rotationSpeed = 0.02;
        this.rotation = Math.random() * Math.PI * 2;
        this.glowIntensity = 0;
        this.glowDirection = 1;
        
        // Crystal shard particles
        this.shards = [];
        this.initializeShards();
    }

    initializeShards() {
        const shardCount = 8;
        for (let i = 0; i < shardCount; i++) {
            this.shards.push({
                angle: (Math.PI * 2 * i) / shardCount,
                distance: this.radius * 0.7,
                size: 3 + Math.random() * 2,
                oscillationSpeed: 0.03 + Math.random() * 0.02,
                oscillationOffset: Math.random() * Math.PI * 2
            });
        }
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Rotate the crystalline structure
        this.rotation += this.rotationSpeed;

        // Update glow effect
        this.glowIntensity += 0.04 * this.glowDirection;
        if (this.glowIntensity >= 1) {
            this.glowDirection = -1;
        } else if (this.glowIntensity <= 0) {
            this.glowDirection = 1;
        }

        // Update shards
        this.shards.forEach(shard => {
            shard.distance = this.radius * 0.7 + 
                Math.sin(Date.now() * shard.oscillationSpeed + shard.oscillationOffset) * 5;
        });

        // Pulsing radius
        this.radius = this.baseRadius + Math.sin(Date.now() * 0.003) * 2;
    }

    draw(ctx) {
        // Draw outer glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 2.5
        );
        gradient.addColorStop(0, `rgba(150, 220, 255, ${0.5 + this.glowIntensity * 0.3})`);
        gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
        
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw crystalline structure
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        for (let i = 0; i < this.crystalPoints; i++) {
            const angle = (Math.PI * 2 * i) / this.crystalPoints;
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                Math.cos(angle) * this.radius * 1.2,
                Math.sin(angle) * this.radius * 1.2
            );
            ctx.strokeStyle = `rgba(200, 240, 255, ${0.6 + this.glowIntensity * 0.4})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.restore();

        // Draw core
        const coreGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        coreGradient.addColorStop(0, '#FFFFFF');
        coreGradient.addColorStop(0.4, '#A0E8FF');
        coreGradient.addColorStop(1, '#60C0FF');
        
        ctx.beginPath();
        ctx.fillStyle = coreGradient;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw shards
        this.shards.forEach(shard => {
            const px = this.x + Math.cos(shard.angle + this.rotation) * shard.distance;
            const py = this.y + Math.sin(shard.angle + this.rotation) * shard.distance;
            
            const shardGradient = ctx.createRadialGradient(
                px, py, 0,
                px, py, shard.size
            );
            shardGradient.addColorStop(0, `rgba(255, 255, 255, ${0.9 + this.glowIntensity * 0.1})`);
            shardGradient.addColorStop(1, 'rgba(150, 220, 255, 0)');
            
            ctx.beginPath();
            ctx.fillStyle = shardGradient;
            ctx.arc(px, py, shard.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}