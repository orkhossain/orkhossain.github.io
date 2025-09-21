import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GalleryImage } from './Gallery';

interface GalleryGridProps {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
}



gsap.registerPlugin(ScrollTrigger);

export const GalleryGrid: React.FC<GalleryGridProps> = ({ images, onImageClick }) => {
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const [allLoaded, setAllLoaded] = useState(false);


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

  // Enhanced fade-in animation when gallery appears
  useEffect(() => {
    if (!allLoaded) return;

    const container = containerRef.current;
    const els = itemsRef.current.filter(Boolean) as HTMLDivElement[];
    if (!els.length || !container) return;

    // Set initial state for container and items
    gsap.set(container, { opacity: 0 });
    gsap.set(els, { 
      opacity: 0, 
      y: 80,
      scale: 0.9,
      rotationX: 15
    });

    // Main container fade in
    const tl = gsap.timeline();
    tl.to(container, { 
      opacity: 1, 
      duration: 0.6,
      ease: 'power2.out'
    });
    
    // Staggered gallery items animation with enhanced effects
    tl.to(els, {
      opacity: 1,
      y: 0,
      scale: 1,
      rotationX: 0,
      duration: 1.2,
      stagger: {
        amount: 0.8,
        from: 'start',
        ease: 'power2.out'
      },
      ease: 'power3.out',
      clearProps: 'opacity,transform',
    }, 0.3);
  }, [allLoaded]);

  // Scroll-triggered animations for items coming into view
  useEffect(() => {
    const els = itemsRef.current.filter(Boolean) as HTMLDivElement[];
    if (!els.length) return;

    els.forEach((item, index) => {
      gsap.fromTo(item,
        { 
          opacity: 0.3,
          scale: 0.95,
          y: 30
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            end: 'bottom 10%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [images]);

  return (
    <div className="p-1">
      <div 
        ref={containerRef}
        className="max-w mx-auto columns-2 md:columns-3 lg:columns-4 gap-2 [column-fill:_balance]"
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            ref={el => itemsRef.current[index] = el}
            className="gallery-item cursor-pointer group break-inside-avoid mb-2"
            onClick={() => onImageClick(index)}
          >
            <div className="relative w-full overflow-hidden rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-sm">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                loading="lazy"
              />
              
              {/* Elegant overlay */}
              <div className="gallery-overlay">
                <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
                  {image.title && (
                    <h3 className="slide-text text-xl font-medium mb-2 text-gallery-surface leading-tight">
                      {image.title}
                    </h3>
                  )}
                  {image.description && (
                    <p className="slide-text text-sm text-gallery-surface/80 italic leading-relaxed">
                      {image.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Minimal hover indicator */}
              <div className="absolute top-3 right-3 w-2 h-2 bg-gallery-surface rounded-full opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-150"></div>
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