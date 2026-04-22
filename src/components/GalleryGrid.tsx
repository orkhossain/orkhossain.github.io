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

const hashToUnit = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return (hash % 1000) / 1000;
};

export const GalleryGrid: React.FC<GalleryGridProps> = ({ images, onImageClick }) => {
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const [allLoaded, setAllLoaded] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<LayoutPattern>('mosaic');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const tileSpans = useMemo(() => {
    const pick = <T,>(options: T[], key: string) => {
      const randomIndex = Math.floor(hashToUnit(key) * options.length);
      return options[randomIndex];
    };

    return Object.fromEntries(
      images.map((image, index) => {
        const aspectRatio = image.width / image.height;
        const key = `${image.id}-${index}-${images.length}`;

        if (aspectRatio >= 1.1) {
          return [image.id, pick([
            'col-span-2 row-span-1',
            'col-span-2 row-span-2',
          ], key)];
        }

        if (aspectRatio <= 0.9) {
          return [image.id, pick([
            'col-span-1 row-span-2',
            'col-span-2 row-span-2',
          ], key)];
        }

        return [image.id, pick([
          'col-span-1 row-span-1',
          'col-span-1 row-span-2',
          'col-span-2 row-span-1',
        ], key)];
      })
    );
  }, [images]);

  // Generate creative layout configurations
  const layoutConfig = useMemo(() => {
    const configs = {
      mosaic: images.map((_, index) => ({
        size: index % 7 === 0 ? 'large' : index % 3 === 0 ? 'medium' : 'small',
        rotation: (hashToUnit(`mosaic-rotation-${index}`) - 0.5) * 6,
        zIndex: Math.floor(hashToUnit(`mosaic-z-${index}`) * 10),
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
      organic: images.map((_, index) => ({
        borderRadius: `${20 + hashToUnit(`organic-radius-a-${index}`) * 30}% ${20 + hashToUnit(`organic-radius-b-${index}`) * 30}% ${20 + hashToUnit(`organic-radius-c-${index}`) * 30}% ${20 + hashToUnit(`organic-radius-d-${index}`) * 30}%`,
        rotation: (hashToUnit(`organic-rotation-${index}`) - 0.5) * 20,
        scale: 0.8 + hashToUnit(`organic-scale-${index}`) * 0.4,
      })),
    };
    return configs[currentLayout];
  }, [currentLayout, images]);


  // Watch images in the DOM and mark when they’ve all loaded
  useEffect(() => {
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

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
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
    <div className="p-3 md:p-4">
      <div
        ref={containerRef}
        className="mx-auto grid max-w-screen-3xl grid-cols-2 gap-3 auto-rows-[160px] sm:auto-rows-[190px] md:grid-cols-4 md:gap-4 md:auto-rows-[220px] xl:grid-cols-6 xl:gap-5"
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            ref={el => itemsRef.current[index] = el}
            className={`gallery-item ${tileSpans[image.id] ?? 'col-span-1 row-span-1'} group relative cursor-pointer overflow-hidden rounded-xl will-change-transform transition-opacity duration-500 ${
              hoveredIndex !== null && hoveredIndex !== index ? 'opacity-40' : 'opacity-100'
            }`}
            onClick={() => onImageClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-xl bg-white/50 shadow-lg backdrop-blur-sm transition-all duration-500 dark:bg-white/5">
              <img
                src={image.thumbSrc}
                alt={image.alt}
                className={`h-full w-full object-cover transition-all duration-700 ${
                  hoveredIndex !== null && hoveredIndex !== index ? 'brightness-50 saturate-75' : ''
                }`}
                loading={index < 6 ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={index < 4 ? 'high' : 'auto'}
                sizes={image.width > image.height
                  ? '(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 34vw'
                  : '(max-width: 767px) 50vw, (max-width: 1279px) 25vw, 17vw'}
                onLoad={(e) => {
                  gsap.fromTo(e.currentTarget,
                    { opacity: 0, scale: 1.05 },
                    { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }
                  );
                }}
                style={{
                  imageRendering: 'auto',
                  transform: 'translateZ(0)',
                  opacity: 0
                }}
              />

              <div
                className={`absolute inset-0 transition-all duration-500 ${
                  hoveredIndex !== null && hoveredIndex !== index ? 'bg-black/25' : 'bg-transparent'
                }`}
              />
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
