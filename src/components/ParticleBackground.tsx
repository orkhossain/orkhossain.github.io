import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface ParticleBackgroundProps {
    isActive: boolean;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ isActive }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        if (!containerRef.current || !isActive) return;

        const container = containerRef.current;
        const particles: HTMLDivElement[] = [];

        // Create floating particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'absolute w-1 h-1 bg-white/20 rounded-full';

            // Random initial position
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;

            gsap.set(particle, {
                x,
                y,
                scale: Math.random() * 0.5 + 0.5,
                opacity: Math.random() * 0.3 + 0.1
            });

            container.appendChild(particle);
            particles.push(particle);

            // Animate particle floating
            gsap.to(particle, {
                y: y - 100 - Math.random() * 200,
                x: x + (Math.random() - 0.5) * 100,
                duration: 8 + Math.random() * 4,
                ease: "none",
                repeat: -1,
                yoyo: true,
                delay: Math.random() * 2
            });

            // Pulse animation
            gsap.to(particle, {
                scale: Math.random() * 0.8 + 0.3,
                opacity: Math.random() * 0.4 + 0.1,
                duration: 2 + Math.random() * 2,
                ease: "power2.inOut",
                repeat: -1,
                yoyo: true,
                delay: Math.random() * 3
            });
        }

        particlesRef.current = particles;

        return () => {
            particles.forEach(particle => {
                gsap.killTweensOf(particle);
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            });
        };
    }, [isActive]);

    if (!isActive) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 pointer-events-none z-10"
            style={{ mixBlendMode: 'screen' }}
        />
    );
};