import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface LoadingScreenProps {
    isLoading: boolean;
    progress?: number;
    onComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
    isLoading,
    progress = 0,
    onComplete
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const progressFillRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Create floating particles
        const container = containerRef.current;
        const particles: HTMLDivElement[] = [];

        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'absolute w-2 h-2 bg-white/30 rounded-full';

            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;

            gsap.set(particle, {
                x,
                y,
                scale: Math.random() * 0.8 + 0.2,
                opacity: Math.random() * 0.5 + 0.2
            });

            container.appendChild(particle);
            particles.push(particle);

            // Floating animation
            gsap.to(particle, {
                y: y - 50 - Math.random() * 100,
                x: x + (Math.random() - 0.5) * 50,
                duration: 3 + Math.random() * 2,
                ease: "power1.inOut",
                repeat: -1,
                yoyo: true,
                delay: Math.random() * 2
            });

            // Pulse animation
            gsap.to(particle, {
                scale: Math.random() * 1.2 + 0.3,
                opacity: Math.random() * 0.7 + 0.3,
                duration: 1.5 + Math.random(),
                ease: "power2.inOut",
                repeat: -1,
                yoyo: true,
                delay: Math.random() * 1.5
            });
        }

        particlesRef.current = particles;

        // Entrance animation
        const tl = gsap.timeline();

        gsap.set([logoRef.current, progressBarRef.current], { opacity: 0, y: 30 });

        tl.to(logoRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "back.out(1.5)"
        })
            .to(progressBarRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power3.out"
            }, 0.3);

        return () => {
            particles.forEach(particle => {
                gsap.killTweensOf(particle);
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            });
        };
    }, []);

    useEffect(() => {
        if (progressFillRef.current) {
            gsap.to(progressFillRef.current, {
                width: `${progress}%`,
                duration: 0.5,
                ease: "power2.out"
            });
        }
    }, [progress]);

    useEffect(() => {
        if (!isLoading && containerRef.current) {
            // Exit animation
            const tl = gsap.timeline({
                onComplete: () => onComplete?.()
            });

            tl.to(containerRef.current, {
                opacity: 0,
                scale: 0.95,
                duration: 0.6,
                ease: "power2.inOut"
            })
                .to(particlesRef.current, {
                    opacity: 0,
                    scale: 0,
                    duration: 0.4,
                    stagger: 0.02,
                    ease: "power2.inOut"
                }, 0);
        }
    }, [isLoading, onComplete]);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-white dark:bg-black">
            <div className="relative flex flex-col items-center gap-6">
                {/* Logo / Title */}
                <div className="text-2xl md:text-3xl font-light tracking-widest text-black/80 dark:text-white/80 text-center px-4">
                    金継ぎのように、壊れたものを直すことで新しい美しさが生まれる。
                </div>
                {/* Pulsing circle */}
                <div className="w-10 h-10 rounded-full bg-black/40 dark:bg-white/60 animate-ping"></div>
                {/* Thin progress bar */}
                <div className="w-40 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div className="h-full w-1/2 bg-black/50 dark:bg-white/60 animate-pulse"></div>
                </div>
                <div className="text-xs uppercase tracking-[0.3em] text-black/60 dark:text-white/60">Loading</div>
            </div>
        </div>
    );
};