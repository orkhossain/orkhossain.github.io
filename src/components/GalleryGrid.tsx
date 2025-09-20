import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GalleryImage } from './Gallery';

gsap.registerPlugin(ScrollTrigger);

interface GalleryGridProps {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({ images, onImageClick }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (gridRef.current && itemsRef.current.length > 0) {
      // Clear previous animations
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());

      // Elegant slide-up animation on scroll
      itemsRef.current.forEach((item, index) => {
        if (item) {
          gsap.fromTo(
            item,
            {
              opacity: 0,
              y: 80,
              x: index % 2 === 0 ? -30 : 30,
            },
            {
              opacity: 1,
              y: 0,
              x: 0,
              duration: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: item,
                start: 'top bottom-=120',
                end: 'bottom top',
                toggleActions: 'play none none reverse',
              },
            }
          );

          // Subtle parallax effect on images
          gsap.to(item.querySelector('img'), {
            y: -20,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          });

          // Text sliding animation
          const textElements = item.querySelectorAll('.slide-text');
          gsap.fromTo(
            textElements,
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              delay: 0.2,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: item,
                start: 'top bottom-=100',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [images]);

  const getGridItemClass = (index: number) => {
    // Create masonry-like layout with different sizes
    const patterns = [
      'md:col-span-2 md:row-span-2', // Large
      'md:col-span-1 md:row-span-2', // Tall
      'md:col-span-1 md:row-span-1', // Regular
      'md:col-span-2 md:row-span-1', // Wide
      'md:col-span-1 md:row-span-1', // Regular
      'md:col-span-1 md:row-span-2', // Tall
    ];
    return patterns[index % patterns.length];
  };

  return (
    <div className="px-8 py-12">
      <div 
        ref={gridRef}
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 auto-rows-[240px]"
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            ref={el => itemsRef.current[index] = el}
            className={`gallery-card cursor-pointer group ${getGridItemClass(index)}`}
            onClick={() => onImageClick(index)}
          >
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Elegant overlay */}
              <div className="gallery-overlay">
                <div className="absolute bottom-0 left-0 right-0 p-8">
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
              <div className="absolute top-6 right-6 w-2 h-2 bg-gallery-surface rounded-full opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-150"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Elegant loading indicator */}
      <div className="h-32 flex items-center justify-center mt-16">
        <div className="w-1 h-1 bg-gallery-text-muted rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};