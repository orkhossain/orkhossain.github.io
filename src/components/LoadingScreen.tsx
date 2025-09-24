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
    const logoRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<HTMLDivElement[]>([]);
    const circleRef = useRef<SVGCircleElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const subtitleRef = useRef<HTMLDivElement>(null);
    const dotsRef = useRef<HTMLDivElement>(null);
    const [internalProgress, setInternalProgress] = useState(0);

    useEffect(() => {
        if (!containerRef.current || !isLoading) return;

        // Create elegant floating sakura petals
        const container = containerRef.current;
        const particles: HTMLDivElement[] = [];

        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'absolute w-3 h-3 opacity-20';
            particle.innerHTML = '🌸';

            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;

            gsap.set(particle, {
                x,
                y,
                scale: Math.random() * 0.6 + 0.4,
                rotation: Math.random() * 360
            });

            container.appendChild(particle);
            particles.push(particle);

            // Gentle floating animation
            gsap.to(particle, {
                y: y - 200 - Math.random() * 100,
                x: x + (Math.random() - 0.5) * 200,
                rotation: Math.random() * 720,
                duration: 8 + Math.random() * 4,
                ease: "power1.inOut",
                repeat: -1,
                yoyo: true,
                delay: Math.random() * 3
            });

            // Gentle scale pulsing
            gsap.to(particle, {
                scale: Math.random() * 0.8 + 0.6,
                duration: 3 + Math.random() * 2,
                ease: "power2.inOut",
                repeat: -1,
                yoyo: true,
                delay: Math.random() * 2
            });
        }

        particlesRef.current = particles;

        // Enhanced entrance animation
        const tl = gsap.timeline();

        // Set initial states
        gsap.set([textRef.current, subtitleRef.current, dotsRef.current], { opacity: 0, y: 30 });
        gsap.set(circleRef.current, { strokeDasharray: "0 283", rotation: -90 });
        gsap.set(progressBarRef.current, { opacity: 0, scaleX: 0 });

        // Longer, more meditative entrance sequence
        tl.to(textRef.current, {
            opacity: 1,
            y: 0,
            duration: 2,
            ease: "power3.out"
        })
            .to(subtitleRef.current, {
                opacity: 1,
                y: 0,
                duration: 1.5,
                ease: "power3.out"
            }, 1)
            .to(circleRef.current, {
                strokeDasharray: "283 283",
                duration: 3,
                ease: "power2.inOut"
            }, 1.5)
            .to(dotsRef.current, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out"
            }, 2.5)
            .to(progressBarRef.current, {
                opacity: 1,
                scaleX: 1,
                duration: 1.2,
                ease: "power3.out"
            }, 3);

        // Slower, more meditative breathing animation for the circle
        gsap.to(circleRef.current, {
            scale: 1.08,
            duration: 4,
            ease: "power2.inOut",
            repeat: -1,
            yoyo: true,
            transformOrigin: "center"
        });

        // Slower, more graceful floating dots animation
        const dots = dotsRef.current?.children;
        if (dots) {
            Array.from(dots).forEach((dot, index) => {
                gsap.to(dot, {
                    y: -8,
                    duration: 1.5,
                    ease: "power2.inOut",
                    repeat: -1,
                    yoyo: true,
                    delay: index * 0.5
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
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-black dark:to-slate-800"
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

            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-current rounded-full"></div>
                <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-current rounded-full"></div>
                <div className="absolute top-1/3 right-1/3 w-16 h-16 border border-current rounded-full"></div>
            </div>
        </div>
    );
};