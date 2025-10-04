import React, { useRef, useEffect, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GalleryImage } from './Gallery';

interface GalleryGridProps {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
}

// Creative layout patterns
const LAYOUT_PATTERNS = [
  'mosaic', 'spiral', 'wave', 'diamond', 'organic'
] as const;

type LayoutPattern = typeof LAYOUT_PATTERNS[number];

gsap.registerPlugin(ScrollTrigger);

export const GalleryGrid: React.FC<GalleryGridProps> = ({ images, onImageClick }) => {
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const [allLoaded, setAllLoaded] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<LayoutPattern>('mosaic');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Generate creative layout configurations
  const layoutConfig = useMemo(() => {
    const configs = {
      mosaic: images.map((_, index) => ({
        size: index % 7 === 0 ? 'large' : index % 3 === 0 ? 'medium' : 'small',
        rotation: (Math.random() - 0.5) * 6,
        zIndex: Math.floor(Math.random() * 10),
      })),
      spiral: images.map((_, index) => {
        const angle = (index * 137.5) * (Math.PI / 180); // Golden angle
        const radius = Math.sqrt(index) * 20;
        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          rotation: angle * (180 / Math.PI),
          scale: Math.max(0.6, 1 - index * 0.02),
        };
      }),
      wave: images.map((_, index) => ({
        y: Math.sin(index * 0.5) * 30,
        rotation: Math.sin(index * 0.3) * 8,
        delay: index * 0.1,
      })),
      diamond: images.map((_, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const offset = row % 2 === 0 ? 0 : 2;
        return {
          x: (col + offset) * 25,
          y: row * 30,
          rotation: (row + col) % 2 === 0 ? 45 : -45,
        };
      }),
      organic: images.map(() => ({
        borderRadius: `${20 + Math.random() * 30}% ${20 + Math.random() * 30}% ${20 + Math.random() * 30}% ${20 + Math.random() * 30}%`,
        rotation: (Math.random() - 0.5) * 20,
        scale: 0.8 + Math.random() * 0.4,
      })),
    };
    return configs[currentLayout];
  }, [currentLayout, images]);


  // Watch images in the DOM and mark when they’ve all loaded
  useEffect(() => {
    setAllLoaded(false);
    const container = containerRef.current;
    if (!container) return;

    const imgs = Array.from(container.querySelectorAll('img')) as HTMLImageElement[];
    if (imgs.length === 0) {
      setAllLoaded(true);
      return;
    }

    let loaded = 0;
    const onOneLoad = () => {
      loaded += 1;
      if (loaded >= imgs.length) setAllLoaded(true);
    };

    imgs.forEach((img) => {
      if (img.complete && img.naturalWidth > 0) {
        onOneLoad();
      } else {
        img.addEventListener('load', onOneLoad, { once: true });
        img.addEventListener('error', onOneLoad, { once: true });
      }
    });

    return () => {
      imgs.forEach((img) => {
        img.removeEventListener('load', onOneLoad);
        img.removeEventListener('error', onOneLoad);
      });
    };
  }, [images]);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Update custom cursor
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX - 10,
          y: e.clientY - 10,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Creative entrance animations based on layout
  useEffect(() => {
    if (!allLoaded) return;

    const container = containerRef.current;
    const els = itemsRef.current.filter(Boolean) as HTMLDivElement[];
    if (!els.length || !container) return;

    gsap.set(container, { opacity: 0 });

    // Different entrance animations for each layout (no spinning)
    const entranceAnimations = {
      mosaic: () => {
        gsap.set(els, { opacity: 0, scale: 0.8, y: 50 });
        const tl = gsap.timeline();
        tl.to(container, { opacity: 1, duration: 0.8, ease: 'power2.out' });
        tl.to(els, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.6,
          stagger: { amount: 1.8, from: 'random' },
          ease: 'elastic.out(1, 0.8)'
        }, 0.3);
      },
      spiral: () => {
        gsap.set(els, { opacity: 0, scale: 0.6, y: 80 });
        const tl = gsap.timeline();
        tl.to(container, { opacity: 1, duration: 0.8, ease: 'power2.out' });
        tl.to(els, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 2,
          stagger: { amount: 2.5, from: 'center' },
          ease: 'back.out(1.4)'
        }, 0.3);
      },
      wave: () => {
        gsap.set(els, { opacity: 0, y: 100, scale: 0.9 });
        const tl = gsap.timeline();
        tl.to(container, { opacity: 1, duration: 0.8, ease: 'power2.out' });
        tl.to(els, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.5,
          stagger: { amount: 2, from: 'start' },
          ease: 'power3.out'
        }, 0.3);
      },
      diamond: () => {
        gsap.set(els, { opacity: 0, scale: 0.7, y: 60 });
        const tl = gsap.timeline();
        tl.to(container, { opacity: 1, duration: 0.8, ease: 'power2.out' });
        tl.to(els, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.8,
          stagger: { amount: 2.2, from: 'edges' },
          ease: 'bounce.out'
        }, 0.3);
      },
      organic: () => {
        gsap.set(els, { opacity: 0, scale: 0.8, filter: 'blur(4px)', y: 40 });
        const tl = gsap.timeline();
        tl.to(container, { opacity: 1, duration: 0.8, ease: 'power2.out' });
        tl.to(els, {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          y: 0,
          duration: 2,
          stagger: { amount: 2.5, from: 'random' },
          ease: 'power2.out'
        }, 0.3);
      }
    };

    entranceAnimations[currentLayout]();
  }, [allLoaded, currentLayout]);

  // Interactive hover effects with magnetic attraction
  const handleMouseEnter = (index: number, element: HTMLDivElement) => {
    setHoveredIndex(index);

    // Magnetic effect - attract nearby items
    const els = itemsRef.current.filter(Boolean) as HTMLDivElement[];
    els.forEach((el, i) => {
      if (!el) return;

      const distance = Math.abs(i - index);
      if (distance <= 2 && i !== index) {
        const direction = i < index ? -1 : 1;
        gsap.to(el, {
          x: direction * (20 - distance * 8),
          scale: 1 - distance * 0.05,
          duration: 0.6,
          ease: 'power2.out'
        });
      }
    });

    // Enhanced hover effect for the main item
    gsap.to(element, {
      scale: 1.15,
      rotationY: 10,
      z: 100,
      boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
      duration: 0.6,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);

    // Reset all items
    const els = itemsRef.current.filter(Boolean) as HTMLDivElement[];
    els.forEach((el) => {
      if (!el) return;
      gsap.to(el, {
        x: 0,
        scale: 1,
        rotationY: 0,
        z: 0,
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)'
      });
    });
  };

  // Layout switching animation
  const switchLayout = (newLayout: LayoutPattern) => {
    if (newLayout === currentLayout) return;

    const els = itemsRef.current.filter(Boolean) as HTMLDivElement[];

    // Animate out
    gsap.to(els, {
      opacity: 0,
      scale: 0.8,
      rotation: 180,
      duration: 0.5,
      stagger: { amount: 0.3, from: 'random' },
      ease: 'power2.in',
      onComplete: () => {
        setCurrentLayout(newLayout);
      }
    });
  };

  return (
    <div className="p-3">
      <div
        ref={containerRef}
        className="max-w-screen-3xl mx-auto columns-2 md:columns-3 lg:columns-6 gap-6 [column-fill:_balance]"
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            ref={el => itemsRef.current[index] = el}
            className={`gallery-item cursor-pointer group break-inside-avoid mb-2 will-change-transform ${image.width > image.height ? 'col-span-2' : ''}`}
            onClick={() => onImageClick(index)}
            style={{
              transform: 'translateZ(0)', // Force hardware acceleration
              backfaceVisibility: 'hidden' // Prevent flickering
            }}
          >
            <div className="relative w-full overflow-hidden rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
                loading="lazy"
                decoding="async"
                onLoad={(e) => {
                  // Smooth fade-in when image loads
                  gsap.fromTo(e.currentTarget,
                    { opacity: 0, scale: 1.05 },
                    { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }
                  );
                }}
                style={{
                  imageRendering: 'auto',
                  transform: 'translateZ(0)', // Hardware acceleration
                  opacity: 0 // Start invisible for fade-in effect
                }}
              />

              {/* Enhanced overlay with gradient animation */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-all duration-500 group-hover:opacity-100">
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 transform translate-y-4 transition-transform duration-500 group-hover:translate-y-0">
                  {image.title && (
                    <h3 className="text-lg md:text-xl font-medium mb-2 text-white leading-tight transform translate-y-2 transition-transform duration-500 delay-100 group-hover:translate-y-0">
                      {image.title}
                    </h3>
                  )}
                  {image.description && (
                    <p className="text-sm text-white/90 italic leading-relaxed transform translate-y-2 transition-transform duration-500 delay-200 group-hover:translate-y-0">
                      {image.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Animated corner indicator */}
              <div className="absolute top-3 right-3 w-3 h-3 bg-white/80 rounded-full opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-125 group-hover:bg-white shadow-lg"></div>

              {/* Subtle border glow effect */}
              <div className="absolute inset-0 rounded-xl border-2 border-white/0 transition-all duration-500 group-hover:border-white/30 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Elegant loading indicator */}
      {!allLoaded && (
        <div className="h-32 flex items-center justify-center mt-16">
          <div className="w-1 h-1 bg-gallery-text-muted rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};