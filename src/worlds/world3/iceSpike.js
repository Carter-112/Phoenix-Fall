export class IceSpike {
    constructor(x, height, config) {
        this.x = x;
        this.groundHeight = height;
        this.width = config.width;
        this.height = config.height;
        this.damage = config.damage;
        
        // Animation states
        this.active = true;
        this.state = 'warning'; // warning -> rising -> active -> retracting
        this.stateTime = 0;
        this.y = height;
        
        // Warning indicator
        this.warningAlpha = 0;
        this.warningHeight = 150;
        
        // Timing configuration
        this.timings = {
            warning: 1000,    // 1 second warning
            rise: 500,        // 0.5 seconds to rise
            active: 2000,     // 2 seconds fully extended
            retract: 300      // 0.3 seconds to retract
        };
    }

    update(deltaTime) {
        this.stateTime += deltaTime;

        switch (this.state) {
            case 'warning':
                this.warningAlpha = Math.sin(this.stateTime * 0.01) * 0.5 + 0.5;
                if (this.stateTime >= this.timings.warning) {
                    this.state = 'rising';
                    this.stateTime = 0;
                }
                break;

            case 'rising':
                const riseProgress = Math.min(this.stateTime / this.timings.rise, 1);
                this.y = this.groundHeight - (this.height * riseProgress);
                if (this.stateTime >= this.timings.rise) {
                    this.state = 'active';
                    this.stateTime = 0;
                }
                break;

            case 'active':
                if (this.stateTime >= this.timings.active) {
                    this.state = 'retracting';
                    this.stateTime = 0;
                }
                break;

            case 'retracting':
                const retractProgress = this.stateTime / this.timings.retract;
                this.y = this.groundHeight - (this.height * (1 - retractProgress));
                if (this.stateTime >= this.timings.retract) {
                    this.active = false;
                }
                break;
        }
    }

    draw(ctx) {
        // Draw warning indicator
        if (this.state === 'warning') {
            ctx.save();
            ctx.globalAlpha = this.warningAlpha;
            const gradient = ctx.createLinearGradient(
                this.x - this.width/2,
                this.groundHeight - this.warningHeight,
                this.x - this.width/2,
                this.groundHeight
            );
            gradient.addColorStop(0, 'rgba(200, 230, 255, 0)');
            gradient.addColorStop(1, 'rgba(200, 230, 255, 0.5)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(
                this.x - this.width/2,
                this.groundHeight - this.warningHeight,
                this.width,
                this.warningHeight
            );
            ctx.restore();
        }

        // Draw ice spike
        if (this.state !== 'warning') {
            // Ice crystal gradient
            const spikeGradient = ctx.createLinearGradient(
                this.x - this.width/2, this.y,
                this.x + this.width/2, this.y + this.height
            );
            spikeGradient.addColorStop(0, 'rgba(200, 230, 255, 0.9)');
            spikeGradient.addColorStop(0.5, 'rgba(150, 200, 255, 0.7)');
            spikeGradient.addColorStop(1, 'rgba(100, 170, 255, 0.8)');

            ctx.fillStyle = spikeGradient;
            
            // Draw spike shape
            ctx.beginPath();
            ctx.moveTo(this.x - this.width/2, this.groundHeight);
            ctx.lineTo(this.x - this.width/4, this.y);
            ctx.lineTo(this.x, this.y - 20);
            ctx.lineTo(this.x + this.width/4, this.y);
            ctx.lineTo(this.x + this.width/2, this.groundHeight);
            ctx.closePath();
            ctx.fill();

            // Add crystalline highlights
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x - this.width/4, this.y + this.height/3);
            ctx.lineTo(this.x, this.y + this.height/2);
            ctx.lineTo(this.x + this.width/4, this.y + this.height/3);
            ctx.stroke();
        }
    }

    checkCollision(phoenix) {
        if (this.state === 'warning' || !this.active) return false;

        const phoenixRadius = phoenix.radius || 20;
        const spikeHitbox = {
            x: this.x - this.width/2,
            y: this.y,
            width: this.width,
            height: this.height
        };

        const phoenixLeft = phoenix.x - phoenixRadius;
        const phoenixRight = phoenix.x + phoenixRadius;
        const phoenixTop = phoenix.y - phoenixRadius;
        const phoenixBottom = phoenix.y + phoenixRadius;

        return !(phoenixLeft > spikeHitbox.x + spikeHitbox.width ||
                phoenixRight < spikeHitbox.x ||
                phoenixTop > spikeHitbox.y + spikeHitbox.height ||
                phoenixBottom < spikeHitbox.y);
    }
}