import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { GalleryImage } from './Gallery';
import { ThumbnailNav } from './ThumbnailNav';

interface SlideshowProps {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onImageChange: (index: number) => void;
}

export const Slideshow: React.FC<SlideshowProps> = ({
  images,
  currentIndex,
  onClose,
  onImageChange,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => {
    if (Math.abs(touchDeltaX.current) > 40) {
      if (touchDeltaX.current > 0) handlePrevious(); else handleNext();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onImageChange(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onImageChange(newIndex);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        handlePrevious();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex]);

  useEffect(() => { setIsLoaded(false); }, [currentIndex]);

  const currentImage = images[currentIndex];

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-sm font-elegant"
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="fixed top-6 left-6 w-12 h-12 rounded-full p-0 bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 backdrop-blur-md hover:bg-black/20 dark:hover:bg-white/20"
        aria-label="Close slideshow"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Image counter */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-60 text-sm text-gallery-text-muted font-light tracking-wide">
        {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
      </div>

      {/* Main image container */}
      <div 
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center px-4 md:px-8"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative max-w-5xl max-h-full">
          <div className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <img
              ref={imageRef}
              src={currentImage.src}
              alt={currentImage.alt}
              className="max-w-[92vw] max-h-[80vh] object-contain rounded-3xl"
              onLoad={() => setIsLoaded(true)}
            />
          </div>

          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gallery-surface rounded-2xl">
              <div className="w-8 h-8 border-2 border-primary/30 rounded-full animate-spin border-t-primary"></div>
            </div>
          )}

          {/* Elegant image info */}
          {isLoaded && (currentImage.title || currentImage.description) && (
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              {currentImage.title && (
                <h3 className="text-xl md:text-3xl font-light tracking-wide text-black dark:text-white">
                  {currentImage.title}
                </h3>
              )}
              {currentImage.description && (
                <p className="text-sm md:text-base text-black/70 dark:text-white/70 italic">
                  {currentImage.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Elegant navigation buttons */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrevious}
        className="fixed left-4 top-1/2 -translate-y-1/2 h-24 w-12 rounded-full p-0 bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 backdrop-blur-md hover:bg-black/20 dark:hover:bg-white/20"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        className="fixed right-4 top-1/2 -translate-y-1/2 h-24 w-12 rounded-full p-0 bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 backdrop-blur-md hover:bg-black/20 dark:hover:bg-white/20"
        aria-label="Next image"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Thumbnail navigation */}
      <div className="fixed right-4 md:right-6 bottom-4 md:bottom-6">
        <ThumbnailNav
          images={images}
          currentIndex={currentIndex}
          onImageSelect={onImageChange}
        />
      </div>

      <div className="fixed left-1/2 -translate-x-1/2 bottom-6 w-[60vw] max-w-2xl h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-black/50 dark:bg-white/60 transition-all duration-300"
          style={{ width: `${((currentIndex+1)/images.length)*100}%` }}
        />
      </div>
    </div>
  );
};