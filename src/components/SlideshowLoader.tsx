import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface SlideshowLoaderProps {
    isLoading: boolean;
    onComplete?: () => void;
}

export const SlideshowLoader: React.FC<SlideshowLoaderProps> = ({
    isLoading,
    onComplete
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const circleRef = useRef<SVGCircleElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const dotsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !isLoading) return;

        // Create floating particles for slideshow loader
        const container = containerRef.current;
        const particles: HTMLDivElement[] = [];

        // Create subtle light particles
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'absolute w-1 h-1 bg-white/30 rounded-full pointer-events-none';

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

            // Gentle floating motion
            gsap.to(particle, {
                y: y - 100 - Math.random() * 200,
                x: x + (Math.random() - 0.5) * 150,
                duration: 8 + Math.random() * 4,
                ease: "none",
                repeat: -1,
                delay: Math.random() * 3
            });

            // Twinkling effect
            gsap.to(particle, {
                opacity: Math.random() * 0.8 + 0.1,
                scale: Math.random() * 1.2 + 0.3,
                duration: 2 + Math.random() * 2,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                delay: Math.random() * 2
            });
        }

        const tl = gsap.timeline();

        // Enhanced initial states
        gsap.set([textRef.current, dotsRef.current], {
            opacity: 0,
            y: 30,
            scale: 0.9,
            filter: 'blur(8px)'
        });
        gsap.set(circleRef.current, {
            strokeDasharray: "0 188",
            scale: 0.8,
            opacity: 0,
            rotation: -90
        });

        // Cinematic entrance animation
        tl.to(circleRef.current, {
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "back.out(1.7)"
        })
            .to(textRef.current, {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: 'blur(0px)',
                duration: 1.5,
                ease: "power3.out"
            }, 0.3)
            .to(circleRef.current, {
                strokeDasharray: "188 188",
                duration: 2.5,
                ease: "power2.inOut"
            }, 0.5)
            .to(dotsRef.current, {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: 'blur(0px)',
                duration: 1,
                ease: "elastic.out(1, 0.5)"
            }, 1);

        // Enhanced breathing animation with multiple layers
        gsap.to(circleRef.current, {
            scale: 1.15,
            duration: 3,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            transformOrigin: "center"
        });

        // Continuous rotation
        gsap.to(circleRef.current, {
            rotation: 270,
            duration: 12,
            ease: "none",
            repeat: -1,
            transformOrigin: "center"
        });

        // Enhanced floating dots with wave motion
        const dots = dotsRef.current?.children;
        if (dots) {
            Array.from(dots).forEach((dot, index) => {
                // Vertical floating
                gsap.to(dot, {
                    y: -12,
                    duration: 1.2 + index * 0.2,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    delay: index * 0.3
                });

                // Scale pulsing
                gsap.to(dot, {
                    scale: 1.5,
                    duration: 1.8 + index * 0.1,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    delay: index * 0.2
                });

                // Opacity breathing
                gsap.to(dot, {
                    opacity: 0.9,
                    duration: 2.5 + index * 0.3,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    delay: index * 0.4
                });
            });
        }

        // Auto complete after 2.5 seconds
        const timer = setTimeout(() => {
            if (onComplete) onComplete();
        }, 2500);

        return () => {
            clearTimeout(timer);
            particles.forEach(particle => {
                gsap.killTweensOf(particle);
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            });
            gsap.killTweensOf([circleRef.current, textRef.current, dotsRef.current]);
        };
    }, [isLoading, onComplete]);

    useEffect(() => {
        if (!isLoading && containerRef.current) {
            // Exit animation
            const tl = gsap.timeline({
                onComplete: () => onComplete?.()
            });

            tl.to(containerRef.current, {
                opacity: 0,
                scale: 0.9,
                duration: 0.6,
                ease: "power3.inOut"
            });
        }
    }, [isLoading, onComplete]);

    if (!isLoading) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[100] bg-gradient-to-br from-black via-slate-900 to-black backdrop-blur-md flex items-center justify-center overflow-hidden"
        >
            {/* Enhanced Background Effects */}
            <div className="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent"></div>
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/4 left-1/4 w-24 h-24 border border-white/20 rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/3 right-1/3 w-16 h-16 border border-white/15 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 right-1/4 w-32 h-32 border border-white/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="text-center relative z-10">
                {/* Enhanced Zen Circle */}
                <div className="relative mb-10">
                    <svg width="100" height="100" className="mx-auto">
                        {/* Outer glow circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="35"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                            className="opacity-50"
                        />
                        {/* Background circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="30"
                            fill="none"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="1"
                            className="opacity-40"
                        />
                        {/* Progress circle */}
                        <circle
                            ref={circleRef}
                            cx="50"
                            cy="50"
                            r="30"
                            fill="none"
                            stroke="rgba(255,255,255,0.9)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="drop-shadow-lg"
                            style={{
                                transformOrigin: '50px 50px',
                                filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))'
                            }}
                        />
                    </svg>

                    {/* Center glow */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white/60 rounded-full animate-pulse shadow-lg"></div>
                    </div>
                </div>

                {/* Enhanced Japanese Text */}
                <div ref={textRef} className="mb-8 space-y-3">
                    <div className="text-white/95 text-xl font-light tracking-wider mb-3 drop-shadow-lg">
                        瞬間を捉える
                    </div>
                    <div className="text-white/70 text-sm font-light tracking-wide">
                        Capturing the moment
                    </div>
                    <div className="text-white/50 text-xs font-light tracking-widest">
                        Preparing slideshow experience
                    </div>
                </div>

                {/* Enhanced Floating Dots */}
                <div ref={dotsRef} className="flex justify-center space-x-3">
                    <div className="w-2.5 h-2.5 bg-white/50 rounded-full shadow-lg"></div>
                    <div className="w-2.5 h-2.5 bg-white/50 rounded-full shadow-lg"></div>
                    <div className="w-2.5 h-2.5 bg-white/50 rounded-full shadow-lg"></div>
                </div>
            </div>

            {/* Ambient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 pointer-events-none"></div>
        </div>
    );
};