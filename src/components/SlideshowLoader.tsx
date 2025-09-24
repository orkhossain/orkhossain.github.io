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

        const tl = gsap.timeline();

        // Set initial states
        gsap.set([textRef.current, dotsRef.current], { opacity: 0, y: 20 });
        gsap.set(circleRef.current, { strokeDasharray: "0 100" });

        // Entrance animation
        tl.to(textRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out"
        })
            .to(dotsRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power3.out"
            }, 0.3)
            .to(circleRef.current, {
                strokeDasharray: "100 100",
                duration: 2,
                ease: "power2.inOut",
                repeat: -1,
                yoyo: true
            }, 0.5);

        // Breathing animation for the circle
        gsap.to(circleRef.current, {
            scale: 1.1,
            duration: 2,
            ease: "power2.inOut",
            repeat: -1,
            yoyo: true,
            transformOrigin: "center"
        });

        // Floating dots animation
        const dots = dotsRef.current?.children;
        if (dots) {
            Array.from(dots).forEach((dot, index) => {
                gsap.to(dot, {
                    y: -8,
                    duration: 0.6,
                    ease: "power2.inOut",
                    repeat: -1,
                    yoyo: true,
                    delay: index * 0.2
                });
            });
        }

        // Auto complete after 3 seconds
        const timer = setTimeout(() => {
            if (onComplete) onComplete();
        }, 3000);

        return () => {
            clearTimeout(timer);
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
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
        >
            <div className="text-center">
                {/* Zen Circle */}
                <div className="relative mb-8">
                    <svg width="80" height="80" className="mx-auto">
                        <circle
                            cx="40"
                            cy="40"
                            r="30"
                            fill="none"
                            stroke="rgba(255,255,255,0.3)"
                            strokeWidth="1"
                            className="opacity-30"
                        />
                        <circle
                            ref={circleRef}
                            cx="40"
                            cy="40"
                            r="30"
                            fill="none"
                            stroke="rgba(255,255,255,0.8)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="transform -rotate-90"
                            style={{ transformOrigin: '40px 40px' }}
                        />
                    </svg>
                </div>

                {/* Japanese Text */}
                <div ref={textRef} className="mb-6">
                    <div className="text-white/90 text-lg font-light tracking-wider mb-2">
                        読み込み中
                    </div>
                    <div className="text-white/60 text-sm font-light tracking-wide">
                        Loading your gallery
                    </div>
                </div>

                {/* Minimal Dots */}
                <div ref={dotsRef} className="flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                    <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                    <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};