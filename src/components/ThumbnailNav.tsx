import React, { useEffect, useRef, useState } from 'react';
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
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  const updateFromClientY = (clientY: number) => {
    const track = trackRef.current;
    if (!track || images.length === 0) return;
    const rect = track.getBoundingClientRect();
    const y = clamp(clientY - rect.top, 0, rect.height);
    const ratio = rect.height > 0 ? y / rect.height : 0;
    const idx = Math.round(ratio * (images.length - 1));
    setDragIndex(idx);
    onImageSelect(idx);
    // Move handle
    if (handleRef.current) {
      handleRef.current.style.top = `${(idx / (images.length - 1 || 1)) * 100}%`;
    }
  };

  // useEffect(() => {
  //   // Elegant entrance animation
  //   if (containerRef.current) {
  //     gsap.fromTo(
  //       containerRef.current,
  //       { x: 60, opacity: 0 },
  //       { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.4 }
  //     );
  //   }
  // }, []);

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

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (isDraggingRef.current) updateFromClientY(e.clientY); };
    const onUp = () => { isDraggingRef.current = false; setDragIndex(null); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-end overflow-hidden relative"
    >
      <div
        ref={scrollRef}
        className="h-[80vh] overflow-y-auto no-scrollbar flex flex-col items-end justify-center ml-auto"
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            ref={el => (thumbnailRefs.current[index] = el)}
            className={`relative w-10 h-10 md:w-12 md:h-12 rounded-md overflow-hidden cursor-pointer transition-all duration-200 ${
              index === currentIndex 
                ? 'opacity-100' 
                : 'opacity-20 hover:opacity-100 '
            }`}
            onClick={() => onImageSelect(index)}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover object-center aspect-square"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};