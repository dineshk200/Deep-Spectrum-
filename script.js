// Initialize AOS Library
AOS.init({
    duration: 800,
    once: true,
    offset: 100
});

// Mobile Menu Toggle
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
});

// --- 3D PARTICLE CLOUD ANIMATION (HERO) ---
const canvas = document.getElementById('hero-3d-canvas');

if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    // Configuration
    const particleCount = 100;
    const connectionDistance = 150;
    const rotationSpeed = 0.002; // Speed of rotation
    const focalLength = 400; // Simulates camera depth

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Point3D {
        constructor() {
            // Random position in 3D space (-width/2 to width/2)
            this.x = (Math.random() - 0.5) * width;
            this.y = (Math.random() - 0.5) * height;
            this.z = (Math.random() - 0.5) * width;
            this.size = Math.random() * 2 + 1;
        }

        rotateY(angle) {
            // Rotate around Y axis formula
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const x = this.x * cos - this.z * sin;
            const z = this.z * cos + this.x * sin;
            this.x = x;
            this.z = z;
        }

        project() {
            // Perspective Projection: 3D (x,y,z) -> 2D (x,y)
            // Scale based on depth (z)
            const scale = focalLength / (focalLength + this.z + width/2); 
            const x2d = this.x * scale + width / 2;
            const y2d = this.y * scale + height / 2;
            
            return { x: x2d, y: y2d, scale: scale };
        }
    }

    function init() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Point3D());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Sort particles by Z depth so closer ones draw on top
        particles.sort((a, b) => b.z - a.z);

        particles.forEach(p => {
            p.rotateY(rotationSpeed);
            const proj = p.project();

            // Draw Particle (Scale size by perspective)
            // Only draw if within reasonable bounds
            if (proj.scale > 0) {
                ctx.fillStyle = `rgba(0, 198, 255, ${proj.scale})`; // Blue/Cyan color
                ctx.beginPath();
                ctx.arc(proj.x, proj.y, p.size * proj.scale, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];
                
                // Calculate distance in 3D space
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dz = p1.z - p2.z;
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

                if (dist < connectionDistance) {
                    const proj1 = p1.project();
                    const proj2 = p2.project();
                    
                    // Average scale for line thickness/opacity
                    const avgScale = (proj1.scale + proj2.scale) / 2;
                    
                    if (avgScale > 0) {
                        ctx.strokeStyle = `rgba(0, 102, 204, ${0.15 * avgScale})`;
                        ctx.lineWidth = 0.5 * avgScale;
                        ctx.beginPath();
                        ctx.moveTo(proj1.x, proj1.y);
                        ctx.lineTo(proj2.x, proj2.y);
                        ctx.stroke();
                    }
                }
            }
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
        init();
    });

    resize();
    init();
    animate();
}