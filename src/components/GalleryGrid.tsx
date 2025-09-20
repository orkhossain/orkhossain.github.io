import React, { useRef } from 'react';
import { GalleryImage } from './Gallery';

interface GalleryGridProps {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({ images, onImageClick }) => {
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <div className="p-1">
      <div 
        className="max-w mx-auto columns-2 md:columns-3 lg:columns-5 gap-2 [column-fill:_balance]"
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            ref={el => itemsRef.current[index] = el}
            className="gallery-card cursor-pointer group break-inside-avoid mb-2"
            onClick={() => onImageClick(index)}
          >
            <div className="relative w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
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
      <div className="h-32 flex items-center justify-center mt-16">
        <div className="w-1 h-1 bg-gallery-text-muted rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};