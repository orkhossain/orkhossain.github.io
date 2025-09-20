import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { GalleryImage } from './Gallery';

interface ThumbnailNavProps {
  images: GalleryImage[];
  currentIndex: number;
  onImageSelect: (index: number) => void;
}

export const ThumbnailNav: React.FC<ThumbnailNavProps> = ({
  images,
  currentIndex,
  onImageSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Elegant entrance animation
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { x: 60, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.4 }
      );
    }
  }, []);

  useEffect(() => {
    // Auto-scroll to current thumbnail
    if (scrollRef.current && thumbnailRefs.current[currentIndex]) {
      const container = scrollRef.current;
      const thumbnail = thumbnailRefs.current[currentIndex];
      
      if (thumbnail) {
        const containerHeight = container.clientHeight;
        const thumbnailTop = thumbnail.offsetTop;
        const thumbnailHeight = thumbnail.clientHeight;
        const scrollTop = thumbnailTop - (containerHeight / 2) + (thumbnailHeight / 2);
        
        gsap.to(container, {
          scrollTop: Math.max(0, scrollTop),
          duration: 0.6,
          ease: 'power2.out'
        });
      }
    }
  }, [currentIndex]);

  return (
    <div 
      ref={containerRef}
      className="slideshow-nav"
    >
      <div 
        ref={scrollRef}
        className="thumbnail-scroll"
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            ref={el => thumbnailRefs.current[index] = el}
            className={`thumbnail-item ${index === currentIndex ? 'active' : ''}`}
            onClick={() => onImageSelect(index)}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Elegant scroll indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col gap-1">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-0.5 h-2 transition-all duration-400 ${
              index === currentIndex 
                ? 'bg-gallery-text' 
                : Math.abs(index - currentIndex) <= 1 
                  ? 'bg-gallery-text/60' 
                  : 'bg-gallery-text-muted/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};