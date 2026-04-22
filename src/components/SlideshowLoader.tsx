import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface SlideshowLoaderProps {
  isLoading: boolean;
}

export const SlideshowLoader: React.FC<SlideshowLoaderProps> = ({ isLoading }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading || !containerRef.current) return;

    const container = containerRef.current;
    const circle = circleRef.current;
    const text = textRef.current;
    const dots = dotsRef.current;
    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < 8; i += 1) {
      const particle = document.createElement('div');
      particle.className = 'absolute h-1 w-1 rounded-full bg-white/25 pointer-events-none';

      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;

      gsap.set(particle, {
        x,
        y,
        scale: Math.random() * 0.8 + 0.4,
        opacity: Math.random() * 0.4 + 0.2,
      });

      container.appendChild(particle);
      particles.push(particle);

      gsap.to(particle, {
        y: y - 140 - Math.random() * 120,
        x: x + (Math.random() - 0.5) * 120,
        duration: 7 + Math.random() * 3,
        ease: 'none',
        repeat: -1,
        yoyo: true,
        delay: Math.random() * 2,
      });

      gsap.to(particle, {
        opacity: Math.random() * 0.5 + 0.2,
        scale: Math.random() * 1.2 + 0.6,
        duration: 2 + Math.random() * 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: Math.random() * 2,
      });
    }

    gsap.set([text, dots], { opacity: 0, y: 18, filter: 'blur(8px)' });
    gsap.set(circle, { opacity: 0, scale: 0.9, strokeDasharray: '0 188' });

    const tl = gsap.timeline();
    tl.to(circle, {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: 'power3.out',
    })
      .to(
        text,
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          ease: 'power3.out',
        },
        0.15
      )
      .to(
        dots,
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.7,
          ease: 'power3.out',
        },
        0.35
      )
      .to(
        circle,
        {
          strokeDasharray: '188 188',
          duration: 1.8,
          ease: 'power2.inOut',
        },
        0.2
      );

    gsap.to(circle, {
      rotation: 360,
      duration: 10,
      ease: 'none',
      repeat: -1,
      transformOrigin: 'center',
    });

    gsap.to(circle, {
      scale: 1.08,
      duration: 2.2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      transformOrigin: 'center',
    });

    const dotChildren = dots?.children;
    if (dotChildren) {
      Array.from(dotChildren).forEach((dot, index) => {
        gsap.to(dot, {
          y: -10,
          scale: 1.3,
          duration: 0.9 + index * 0.12,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: index * 0.18,
        });
      });
    }

    return () => {
      tl.kill();
      gsap.killTweensOf([circle, text, dots]);
      particles.forEach((particle) => {
        gsap.killTweensOf(particle);
        particle.remove();
      });
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/95 backdrop-blur-sm"
    >
      <div className="text-center">
        <div className="relative mb-8">
          <svg width="84" height="84" className="mx-auto">
            <circle
              cx="42"
              cy="42"
              r="30"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
            />
            <circle
              ref={circleRef}
              cx="42"
              cy="42"
              r="30"
              fill="none"
              stroke="rgba(255,255,255,0.82)"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ transformOrigin: '42px 42px' }}
            />
          </svg>
        </div>

        <div ref={textRef} className="mb-6">
          <div className="mb-2 text-lg font-light tracking-[0.24em] text-white/90">
            LOADING
          </div>
          <div className="text-sm font-light tracking-[0.18em] text-white/55">
            Preparing the slideshow
          </div>
        </div>

        <div ref={dotsRef} className="flex justify-center gap-2">
          <div className="h-2 w-2 rounded-full bg-white/35" />
          <div className="h-2 w-2 rounded-full bg-white/35" />
          <div className="h-2 w-2 rounded-full bg-white/35" />
        </div>
      </div>
    </div>
  );
};
