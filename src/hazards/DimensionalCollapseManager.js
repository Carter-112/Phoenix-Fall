/**
 * DimensionalCollapseManager - Manages dimensional collapse hazards
 * These are large, dangerous areas that create visual distortion and damage
 */
export class DimensionalCollapseManager {
    constructor(worldConfig) {
        this.config = worldConfig.hazards.dimensionalCollapse;
        this.collapses = [];
        this.active = true;
        this.lastSpawnTime = 0;
        
        // Apply any difficulty modifiers if provided
        if (worldConfig.systems.difficulty?.modifiers) {
            const modifiers = worldConfig.systems.difficulty.modifiers;
            this.spawnRateMultiplier = modifiers.spawnRate || 1;
            this.damageMultiplier = modifiers.damage || 1;
        } else {
            this.spawnRateMultiplier = 1;
            this.damageMultiplier = 1;
        }
    }
    
    update(deltaTime, currentTime, width, height) {
        if (!this.active) return;
        
        // Auto-spawn logic - only if not being managed by a pattern coordinator
        const spawnInterval = this.config.spawnRate * this.spawnRateMultiplier;
        if (currentTime - this.lastSpawnTime > spawnInterval && this.collapses.length < this.config.maxActive) {
            // Random position, biased toward center
            const centerBias = 0.3; // How strongly to bias toward center (0-1)
            const randomFactor = 1 - centerBias;
            
            const x = width * (0.5 * centerBias + randomFactor * Math.random());
            const y = height * (0.5 * centerBias + randomFactor * Math.random());
            
            this.spawnCollapse(x, y);
            this.lastSpawnTime = currentTime;
        }
        
        // Update existing collapses
        for (let i = this.collapses.length - 1; i >= 0; i--) {
            const collapse = this.collapses[i];
            
            // Update lifetime
            collapse.lifetime += deltaTime;
            
            // Warning phase
            if (collapse.lifetime < this.config.collapseTime) {
                // Gradually increase warning effect
                collapse.warningIntensity = Math.min(1, collapse.lifetime / this.config.collapseTime);
                
                // Create fluctuating visual effect
                collapse.visualDistortion = 0.2 + 0.3 * Math.sin(collapse.lifetime * 0.01);
            } 
            // Active phase
            else if (collapse.lifetime < this.config.collapseTime + 3000) { // 3 seconds active
                collapse.active = true;
                
                // Full distortion during active phase
                collapse.visualDistortion = 0.5 + 0.5 * Math.sin(collapse.lifetime * 0.005);
                
                // Random particle emission
                if (Math.random() < 0.2) {
                    collapse.particles.push({
                        x: collapse.x + (Math.random() - 0.5) * collapse.width * 0.8,
                        y: collapse.y + (Math.random() - 0.5) * collapse.height * 0.8,
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        size: 5 + Math.random() * 10,
                        lifetime: 0,
                        maxLifetime: 1000 + Math.random() * 1000
                    });
                }
                
                // Update existing particles
                for (let j = collapse.particles.length - 1; j >= 0; j--) {
                    const particle = collapse.particles[j];
                    
                    // Update particle position
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    
                    // Update lifetime
                    particle.lifetime += deltaTime;
                    
                    // Remove if past max lifetime
                    if (particle.lifetime > particle.maxLifetime) {
                        collapse.particles.splice(j, 1);
                    }
                }
            } 
            // Fadeout phase
            else {
                const fadeOutDuration = 1000; // 1 second fade out
                const fadeOutProgress = (collapse.lifetime - (this.config.collapseTime + 3000)) / fadeOutDuration;
                
                if (fadeOutProgress < 1) {
                    collapse.alpha = 1 - fadeOutProgress;
                    collapse.visualDistortion *= (1 - fadeOutProgress);
                } else {
                    // Remove collapse once it's completely faded
                    this.collapses.splice(i, 1);
                    continue;
                }
            }
            
            // Move the collapse if it has velocity
            if (collapse.velocityX !== 0 || collapse.velocityY !== 0) {
                collapse.x += collapse.velocityX * deltaTime * 0.01;
                collapse.y += collapse.velocityY * deltaTime * 0.01;
                
                // Bounce off edges
                if (collapse.x - collapse.width / 2 < 0 && collapse.velocityX < 0) {
                    collapse.velocityX *= -0.8;
                    collapse.x = collapse.width / 2;
                }
                if (collapse.x + collapse.width / 2 > width && collapse.velocityX > 0) {
                    collapse.velocityX *= -0.8;
                    collapse.x = width - collapse.width / 2;
                }
                if (collapse.y - collapse.height / 2 < 0 && collapse.velocityY < 0) {
                    collapse.velocityY *= -0.8;
                    collapse.y = collapse.height / 2;
                }
                if (collapse.y + collapse.height / 2 > height && collapse.velocityY > 0) {
                    collapse.velocityY *= -0.8;
                    collapse.y = height - collapse.height / 2;
                }
            }
        }
    }
    
    spawnCollapse(x, y, velocityX = 0, velocityY = 0) {
        // Only spawn if under max active limit
        if (this.collapses.length >= this.config.maxActive) return null;
        
        const collapse = {
            x,
            y,
            velocityX: velocityX,
            velocityY: velocityY,
            width: this.config.width,
            height: this.config.height,
            lifetime: 0,
            warningIntensity: 0,
            visualDistortion: 0,
            active: false,
            alpha: 1,
            particles: []
        };
        
        this.collapses.push(collapse);
        
        // Play spawn sound if sound manager is available
        if (window.gameInstance && window.gameInstance.soundManager) {
            try {
                window.gameInstance.soundManager.playSound('dimensionalCollapse', 0.6);
            } catch (error) {
                console.log('Could not play dimensional collapse sound');
            }
        }
        
        return collapse;
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        // Draw each dimensional collapse
        for (const collapse of this.collapses) {
            // Skip if invisible
            if (collapse.alpha <= 0) continue;
            
            ctx.save();
            
            // Warning phase appearance
            if (!collapse.active && collapse.warningIntensity > 0) {
                // Draw warning boundary
                const halfWidth = collapse.width / 2;
                const halfHeight = collapse.height / 2;
                
                // Flicker effect
                const flickerIntensity = 0.5 + 0.5 * Math.sin(collapse.lifetime * 0.02);
                const opacity = collapse.warningIntensity * flickerIntensity;
                
                // Draw boundary
                ctx.strokeStyle = `rgba(255, 0, 100, ${opacity})`;
                ctx.lineWidth = 3 + 2 * Math.sin(collapse.lifetime * 0.01);
                ctx.setLineDash([10, 5]);
                
                // Draw a distorted rectangle
                const distortion = 5 + 10 * collapse.visualDistortion;
                
                ctx.beginPath();
                ctx.moveTo(collapse.x - halfWidth + (Math.random() - 0.5) * distortion, 
                           collapse.y - halfHeight + (Math.random() - 0.5) * distortion);
                ctx.lineTo(collapse.x + halfWidth + (Math.random() - 0.5) * distortion, 
                           collapse.y - halfHeight + (Math.random() - 0.5) * distortion);
                ctx.lineTo(collapse.x + halfWidth + (Math.random() - 0.5) * distortion, 
                           collapse.y + halfHeight + (Math.random() - 0.5) * distortion);
                ctx.lineTo(collapse.x - halfWidth + (Math.random() - 0.5) * distortion, 
                           collapse.y + halfHeight + (Math.random() - 0.5) * distortion);
                ctx.closePath();
                ctx.stroke();
                
                // Draw warning symbol
                const symbolSize = Math.min(collapse.width, collapse.height) * 0.2;
                
                // Draw a dimensional rift symbol
                ctx.strokeStyle = `rgba(255, 50, 200, ${opacity * 0.8})`;
                ctx.lineWidth = 4;
                ctx.setLineDash([]);
                
                // Draw crossed lines
                ctx.beginPath();
                ctx.moveTo(collapse.x - symbolSize, collapse.y - symbolSize);
                ctx.lineTo(collapse.x + symbolSize, collapse.y + symbolSize);
                ctx.moveTo(collapse.x + symbolSize, collapse.y - symbolSize);
                ctx.lineTo(collapse.x - symbolSize, collapse.y + symbolSize);
                ctx.stroke();
                
                // Draw circle
                ctx.beginPath();
                ctx.arc(collapse.x, collapse.y, symbolSize * 0.7, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Active dimensional collapse
            if (collapse.active) {
                // Rectangular area with distortion effects
                const halfWidth = collapse.width / 2;
                const halfHeight = collapse.height / 2;
                
                // Create a purple/magenta gradient for the dimensional rift
                const gradient = ctx.createLinearGradient(
                    collapse.x - halfWidth, collapse.y - halfHeight,
                    collapse.x + halfWidth, collapse.y + halfHeight
                );
                
                gradient.addColorStop(0, `rgba(100, 0, 150, ${0.7 * collapse.alpha})`);
                gradient.addColorStop(0.5, `rgba(200, 0, 100, ${0.5 * collapse.alpha})`);
                gradient.addColorStop(1, `rgba(50, 0, 100, ${0.7 * collapse.alpha})`);
                
                ctx.fillStyle = gradient;
                
                // Draw a distorted rectangle with rounded corners
                const cornerRadius = 20;
                const distortion = 10 * collapse.visualDistortion;
                
                ctx.beginPath();
                
                // Top-left corner
                ctx.moveTo(collapse.x - halfWidth + cornerRadius + (Math.random() - 0.5) * distortion, 
                           collapse.y - halfHeight + (Math.random() - 0.5) * distortion);
                
                // Top edge
                ctx.lineTo(collapse.x + halfWidth - cornerRadius + (Math.random() - 0.5) * distortion, 
                           collapse.y - halfHeight + (Math.random() - 0.5) * distortion);
                
                // Top-right corner
                ctx.quadraticCurveTo(
                    collapse.x + halfWidth + (Math.random() - 0.5) * distortion, 
                    collapse.y - halfHeight + (Math.random() - 0.5) * distortion,
                    collapse.x + halfWidth + (Math.random() - 0.5) * distortion, 
                    collapse.y - halfHeight + cornerRadius + (Math.random() - 0.5) * distortion
                );
                
                // Right edge
                ctx.lineTo(collapse.x + halfWidth + (Math.random() - 0.5) * distortion, 
                           collapse.y + halfHeight - cornerRadius + (Math.random() - 0.5) * distortion);
                
                // Bottom-right corner
                ctx.quadraticCurveTo(
                    collapse.x + halfWidth + (Math.random() - 0.5) * distortion, 
                    collapse.y + halfHeight + (Math.random() - 0.5) * distortion,
                    collapse.x + halfWidth - cornerRadius + (Math.random() - 0.5) * distortion, 
                    collapse.y + halfHeight + (Math.random() - 0.5) * distortion
                );
                
                // Bottom edge
                ctx.lineTo(collapse.x - halfWidth + cornerRadius + (Math.random() - 0.5) * distortion, 
                           collapse.y + halfHeight + (Math.random() - 0.5) * distortion);
                
                // Bottom-left corner
                ctx.quadraticCurveTo(
                    collapse.x - halfWidth + (Math.random() - 0.5) * distortion, 
                    collapse.y + halfHeight + (Math.random() - 0.5) * distortion,
                    collapse.x - halfWidth + (Math.random() - 0.5) * distortion, 
                    collapse.y + halfHeight - cornerRadius + (Math.random() - 0.5) * distortion
                );
                
                // Left edge
                ctx.lineTo(collapse.x - halfWidth + (Math.random() - 0.5) * distortion, 
                           collapse.y - halfHeight + cornerRadius + (Math.random() - 0.5) * distortion);
                
                // Top-left corner
                ctx.quadraticCurveTo(
                    collapse.x - halfWidth + (Math.random() - 0.5) * distortion, 
                    collapse.y - halfHeight + (Math.random() - 0.5) * distortion,
                    collapse.x - halfWidth + cornerRadius + (Math.random() - 0.5) * distortion, 
                    collapse.y - halfHeight + (Math.random() - 0.5) * distortion
                );
                
                ctx.fill();
                
                // Draw energy lines across the collapse
                const lineCount = 8;
                ctx.strokeStyle = `rgba(255, 50, 255, ${0.8 * collapse.alpha})`;
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                
                for (let i = 0; i < lineCount; i++) {
                    const yPos = collapse.y - halfHeight + (collapse.height / (lineCount - 1)) * i;
                    const distortAmount = 5 + 10 * collapse.visualDistortion;
                    
                    ctx.beginPath();
                    ctx.moveTo(collapse.x - halfWidth, yPos + (Math.random() - 0.5) * distortAmount);
                    
                    // Create a wavy line
                    const segments = 10;
                    for (let j = 1; j <= segments; j++) {
                        const xPos = collapse.x - halfWidth + (collapse.width / segments) * j;
                        const waveOffset = Math.sin(j / segments * Math.PI * 4 + collapse.lifetime * 0.003) * 15;
                        ctx.lineTo(xPos, yPos + waveOffset + (Math.random() - 0.5) * distortAmount);
                    }
                    
                    ctx.stroke();
                }
                
                // Draw energy particles
                ctx.setLineDash([]);
                
                for (const particle of collapse.particles) {
                    const particleOpacity = 1 - (particle.lifetime / particle.maxLifetime);
                    
                    // Main particle
                    ctx.fillStyle = `rgba(255, 150, 255, ${particleOpacity * collapse.alpha})`;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Glow effect
                    const glow = ctx.createRadialGradient(
                        particle.x, particle.y, 0,
                        particle.x, particle.y, particle.size * 2
                    );
                    glow.addColorStop(0, `rgba(255, 150, 255, ${0.5 * particleOpacity * collapse.alpha})`);
                    glow.addColorStop(1, `rgba(255, 150, 255, 0)`);
                    
                    ctx.fillStyle = glow;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            ctx.restore();
        }
    }
    
    checkCollisions(phoenix) {
        if (!phoenix || !this.active) return 0;
        
        let totalDamage = 0;
        
        // Check each active collapse
        for (const collapse of this.collapses) {
            if (!collapse.active) continue;
            
            // Calculate if phoenix is inside the collapse area
            const halfWidth = collapse.width / 2;
            const halfHeight = collapse.height / 2;
            
            if (phoenix.x > collapse.x - halfWidth && 
                phoenix.x < collapse.x + halfWidth && 
                phoenix.y > collapse.y - halfHeight && 
                phoenix.y < collapse.y + halfHeight) {
                
                // Calculate damage based on proximity to center (more damage closer to center)
                const centerX = collapse.x;
                const centerY = collapse.y;
                const dx = (phoenix.x - centerX) / halfWidth; // -1 to 1
                const dy = (phoenix.y - centerY) / halfHeight; // -1 to 1
                const distanceFromCenter = Math.sqrt(dx * dx + dy * dy) / Math.sqrt(2); // 0 to 1
                
                const proximityFactor = 1 - distanceFromCenter;
                const damage = this.config.damage * proximityFactor * this.damageMultiplier * 0.1; // per frame
                
                totalDamage += damage;
                
                // Apply visual distortion effect to phoenix if it has an applyVisualEffect method
                if (phoenix.applyVisualEffect) {
                    phoenix.applyVisualEffect('dimensionalDistortion', 0.5 * proximityFactor);
                }
                
                // Apply subtle force toward the center
                const pullStrength = 0.05 * proximityFactor;
                phoenix.velocityX += (centerX - phoenix.x) * pullStrength * 0.01;
                phoenix.velocityY += (centerY - phoenix.y) * pullStrength * 0.01;
                
                // Visual effect on collision
                if (phoenix.createDamageEffect && Math.random() < 0.1) {
                    phoenix.createDamageEffect();
                }
            }
        }
        
        return totalDamage;
    }
    
    reset() {
        this.collapses = [];
        this.lastSpawnTime = 0;
    }
    
    setActive(active) {
        this.active = active;
        if (!active) {
            this.reset();
        }
    }
} 