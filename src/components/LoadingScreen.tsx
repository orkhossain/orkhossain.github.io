import React, { useEffect, useRef, useState } from 'react';
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

    const particlesRef = useRef<HTMLDivElement[]>([]);
    const circleRef = useRef<SVGCircleElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const subtitleRef = useRef<HTMLDivElement>(null);
    const dotsRef = useRef<HTMLDivElement>(null);
    const [internalProgress, setInternalProgress] = useState(0);

    useEffect(() => {
        if (!containerRef.current || !isLoading) return;

        // Create enhanced floating elements with variety
        const container = containerRef.current;
        const particles: HTMLDivElement[] = [];

        // Create different types of floating elements
        const elements = ['🌸', '✨', '🍃', '💫', '🌙', '⭐'];

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            const element = elements[Math.floor(Math.random() * elements.length)];

            particle.className = 'absolute pointer-events-none select-none';
            particle.innerHTML = element;

            // Varied sizes and opacities
            const size = Math.random() * 0.8 + 0.4;
            const opacity = Math.random() * 0.3 + 0.1;

            particle.style.fontSize = `${size * 1.5}rem`;
            particle.style.opacity = opacity.toString();

            const x = Math.random() * window.innerWidth;
            const y = window.innerHeight + Math.random() * 200;

            gsap.set(particle, {
                x,
                y,
                scale: size,
                rotation: Math.random() * 360
            });

            container.appendChild(particle);
            particles.push(particle);

            // Enhanced floating animation with physics-like movement
            gsap.to(particle, {
                y: -200 - Math.random() * 300,
                x: x + (Math.random() - 0.5) * 400,
                rotation: Math.random() * 1080,
                duration: 12 + Math.random() * 8,
                ease: "none",
                repeat: -1,
                delay: Math.random() * 5
            });

            // Organic pulsing and rotation
            gsap.to(particle, {
                scale: size * (0.8 + Math.random() * 0.6),
                duration: 4 + Math.random() * 3,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                delay: Math.random() * 3
            });

            // Subtle drift animation
            gsap.to(particle, {
                x: `+=${(Math.random() - 0.5) * 100}`,
                duration: 6 + Math.random() * 4,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                delay: Math.random() * 2
            });
        }

        particlesRef.current = particles;

        // Sophisticated entrance animation with staggered reveals
        const tl = gsap.timeline();

        // Set initial states with more dramatic transforms
        gsap.set([textRef.current, subtitleRef.current, dotsRef.current], {
            opacity: 0,
            y: 50,
            scale: 0.9,
            filter: 'blur(10px)'
        });
        gsap.set(circleRef.current, {
            strokeDasharray: "0 283",
            rotation: -90,
            scale: 0.8,
            opacity: 0
        });
        gsap.set(progressBarRef.current, {
            opacity: 0,
            scaleX: 0,
            y: 20
        });

        // Cinematic entrance sequence
        tl.to(circleRef.current, {
            opacity: 1,
            scale: 1,
            duration: 1.5,
            ease: "back.out(1.7)"
        })
            .to(textRef.current, {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: 'blur(0px)',
                duration: 2.5,
                ease: "power3.out"
            }, 0.5)
            .to(circleRef.current, {
                strokeDasharray: "283 283",
                duration: 4,
                ease: "power2.inOut"
            }, 1)
            .to(subtitleRef.current, {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: 'blur(0px)',
                duration: 2,
                ease: "power3.out"
            }, 1.5)
            .to(dotsRef.current, {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: 'blur(0px)',
                duration: 1.5,
                ease: "elastic.out(1, 0.5)"
            }, 2.5)
            .to(progressBarRef.current, {
                opacity: 1,
                scaleX: 1,
                y: 0,
                duration: 1.8,
                ease: "power3.out"
            }, 3);

        // Enhanced breathing animation with multiple layers
        gsap.to(circleRef.current, {
            scale: 1.12,
            duration: 5,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            transformOrigin: "center"
        });

        // Subtle rotation for the circle
        gsap.to(circleRef.current, {
            rotation: 360,
            duration: 20,
            ease: "none",
            repeat: -1,
            transformOrigin: "center"
        });

        // Enhanced floating dots with wave-like motion
        const dots = dotsRef.current?.children;
        if (dots) {
            Array.from(dots).forEach((dot, index) => {
                // Vertical floating
                gsap.to(dot, {
                    y: -12,
                    duration: 2 + index * 0.3,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    delay: index * 0.6
                });

                // Subtle scale pulsing
                gsap.to(dot, {
                    scale: 1.4,
                    duration: 1.5 + index * 0.2,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    delay: index * 0.4
                });

                // Opacity breathing
                gsap.to(dot, {
                    opacity: 0.8,
                    duration: 3 + index * 0.5,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    delay: index * 0.3
                });
            });
        }

        // Simulate slower, more dramatic progress
        const progressTl = gsap.timeline({ delay: 2 });
        progressTl.to({ value: 0 }, {
            value: 100,
            duration: 4,
            ease: "power2.out",
            onUpdate: function () {
                setInternalProgress(this.targets()[0].value);
            }
        });

        return () => {
            particles.forEach(particle => {
                gsap.killTweensOf(particle);
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            });
            progressTl.kill();
        };
    }, [isLoading]);

    useEffect(() => {
        // Use the higher of actual progress or internal progress for smoother experience
        const displayProgress = Math.max(progress, internalProgress);

        if (progressFillRef.current) {
            gsap.to(progressFillRef.current, {
                width: `${displayProgress}%`,
                duration: 0.8,
                ease: "power3.out"
            });
        }

        // Update circle progress
        if (circleRef.current) {
            const circumference = 283; // 2 * π * 45
            const offset = circumference - (displayProgress / 100) * circumference;
            gsap.to(circleRef.current, {
                strokeDasharray: `${circumference - offset} ${circumference}`,
                duration: 0.8,
                ease: "power3.out"
            });
        }
    }, [progress, internalProgress]);

    useEffect(() => {
        if (!isLoading && containerRef.current) {
            // Elegant exit animation
            const tl = gsap.timeline({
                onComplete: () => onComplete?.()
            });

            tl.to([textRef.current, subtitleRef.current], {
                opacity: 0,
                y: -20,
                duration: 0.6,
                ease: "power3.inOut",
                stagger: 0.1
            })
                .to([circleRef.current, dotsRef.current, progressBarRef.current], {
                    opacity: 0,
                    scale: 0.8,
                    duration: 0.5,
                    ease: "power3.inOut",
                    stagger: 0.05
                }, 0.2)
                .to(containerRef.current, {
                    opacity: 0,
                    duration: 0.4,
                    ease: "power2.inOut"
                }, 0.6)
                .to(particlesRef.current, {
                    opacity: 0,
                    y: -50,
                    duration: 0.8,
                    stagger: 0.03,
                    ease: "power2.inOut"
                }, 0);
        }
    }, [isLoading, onComplete]);

    if (!isLoading) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-black dark:to-slate-800 overflow-hidden"
        >
            {/* Main Content */}
            <div className="relative flex flex-col items-center space-y-8">

                {/* Zen Circle with Progress */}
                <div className="relative">
                    <svg width="120" height="120" className="transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="60"
                            cy="60"
                            r="45"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            className="text-black/10 dark:text-white/10"
                        />
                        {/* Progress circle */}
                        <circle
                            ref={circleRef}
                            cx="60"
                            cy="60"
                            r="45"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="text-black/60 dark:text-white/60"
                            style={{
                                strokeDasharray: "0 283",
                                transformOrigin: '60px 60px'
                            }}
                        />
                    </svg>

                    {/* Center dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-black/40 dark:bg-white/40 rounded-full"></div>
                    </div>
                </div>

                {/* Japanese Text */}
                <div className="text-center space-y-6">
                    <div
                        ref={textRef}
                        className="text-lg md:text-xl font-light tracking-wide text-black/80 dark:text-white/80 max-w-lg leading-relaxed"
                    >
                        美しさは静寂の中に宿る
                    </div>
                    <div
                        ref={subtitleRef}
                        className="space-y-3"
                    >
                        <div className="text-sm text-black/60 dark:text-white/60 font-light tracking-wider">
                            Beauty dwells in silence
                        </div>
                        <div className="text-xs text-black/40 dark:text-white/40 font-light tracking-widest">
                            Preparing your visual journey
                        </div>
                        <div className="text-xs text-black/30 dark:text-white/30 font-light tracking-widest">
                            瞬間を永遠に変える
                        </div>
                    </div>
                </div>

                {/* Elegant Progress Bar */}
                <div
                    ref={progressBarRef}
                    className="w-64 h-px bg-black/20 dark:bg-white/20 overflow-hidden"
                >
                    <div
                        ref={progressFillRef}
                        className="h-full bg-black/60 dark:bg-white/60 origin-left"
                        style={{ width: '0%' }}
                    />
                </div>

                {/* Floating Dots */}
                <div
                    ref={dotsRef}
                    className="flex space-x-3"
                >
                    <div className="w-1.5 h-1.5 bg-black/30 dark:bg-white/30 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-black/30 dark:bg-white/30 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-black/30 dark:bg-white/30 rounded-full"></div>
                </div>

                {/* Progress Percentage */}
                <div className="text-xs font-mono text-black/50 dark:text-white/50 tracking-wider">
                    {Math.round(Math.max(progress, internalProgress))}%
                </div>
            </div>

            {/* Ultra Massive Display-Filling Circles */}
            <div className="absolute inset-0 opacity-6 dark:opacity-15 overflow-hidden">
                {/* Gigantic primary circles that dominate the display */}
                <div className="absolute -top-3/4 -left-3/4 w-[300vw] h-[300vh] border-2 border-current rounded-full animate-mega-pulse" style={{ animationDelay: '0s', animationDuration: '20s' }}></div>
                <div className="absolute -bottom-2/3 -right-2/3 w-[280vw] h-[280vh] border border-current rounded-full animate-mega-pulse" style={{ animationDelay: '5s', animationDuration: '25s' }}></div>
                <div className="absolute -top-2/3 -right-3/4 w-[250vw] h-[250vh] border border-current rounded-full animate-pulse" style={{ animationDelay: '10s', animationDuration: '30s' }}></div>
                <div className="absolute -bottom-3/4 -left-1/2 w-[320vw] h-[320vh] border border-current rounded-full animate-mega-pulse" style={{ animationDelay: '3s', animationDuration: '22s' }}></div>

                {/* Massive secondary layer */}
                <div className="absolute -top-1/2 -left-1/2 w-[220vw] h-[220vh] border-2 border-current rounded-full animate-pulse" style={{ animationDelay: '7s', animationDuration: '18s' }}></div>
                <div className="absolute -bottom-1/2 -right-1/2 w-[240vw] h-[240vh] border border-current rounded-full animate-mega-pulse" style={{ animationDelay: '12s', animationDuration: '16s' }}></div>
                <div className="absolute top-0 -left-2/3 w-[200vw] h-[200vh] border border-current rounded-full animate-pulse" style={{ animationDelay: '8s', animationDuration: '24s' }}></div>
                <div className="absolute -top-1/3 right-0 w-[180vw] h-[180vh] border border-current rounded-full animate-mega-pulse" style={{ animationDelay: '15s', animationDuration: '14s' }}></div>

                {/* Large overlay circles for additional depth */}
                <div className="absolute top-1/4 left-1/4 w-[160vw] h-[160vh] border border-current rounded-full animate-pulse opacity-70" style={{ animationDelay: '2s', animationDuration: '12s' }}></div>
                <div className="absolute bottom-1/4 right-1/4 w-[140vw] h-[140vh] border border-current rounded-full animate-mega-pulse opacity-60" style={{ animationDelay: '9s', animationDuration: '15s' }}></div>
                <div className="absolute top-1/2 right-1/3 w-[120vw] h-[120vh] border border-current rounded-full animate-pulse opacity-80" style={{ animationDelay: '6s', animationDuration: '19s' }}></div>

                {/* Ultra-massive atmospheric circles */}
                <div className="absolute -top-full -left-full w-[400vw] h-[400vh] border border-current rounded-full animate-ultra-pulse opacity-25" style={{ animationDelay: '18s' }}></div>
                <div className="absolute -bottom-full -right-full w-[350vw] h-[350vh] border border-current rounded-full animate-ultra-pulse opacity-20" style={{ animationDelay: '25s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-[500vw] h-[500vh] border border-current rounded-full animate-ultra-pulse opacity-15" style={{ animationDelay: '30s' }}></div>
            </div>

            {/* Ambient Light Effect */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/5 dark:to-white/5 pointer-events-none"></div>
        </div>
    );
};