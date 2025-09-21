import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { GalleryImage } from './Gallery';
import { ThumbnailNav } from './ThumbnailNav';
import { useHash } from 'react-use';

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
  const [hash, setHash] = useHash();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const prevImageRef = useRef<HTMLImageElement>(null);

  const [prevIndex, setPrevIndex] = useState(currentIndex);
  const [dir, setDir] = useState<1 | -1>(1);

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

  const handleCloseSlideshow = () => {
    // Clear hash first, then close
    setHash('');
    // Small delay to allow hash to clear
    setTimeout(() => onClose(), 100);
  };

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDir(-1);
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onImageChange(newIndex);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDir(1);
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onImageChange(newIndex);
    setTimeout(() => setIsTransitioning(false), 500);
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
        handleCloseSlideshow();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex]);

  useEffect(() => { 
    setIsLoaded(false);
    
    // Enhanced image transition animation
    if (imageRef.current) {
      const tl = gsap.timeline();
      
      // Slide out current image with enhanced effects
      tl.to(imageRef.current, {
        x: dir === 1 ? -150 : 150,
        opacity: 0,
        scale: 0.95,
        rotationY: dir === 1 ? -10 : 10,
        duration: 0.4,
        ease: 'power2.in'
      })
      // Reset position for new image
      .set(imageRef.current, {
        x: dir === 1 ? 150 : -150,
        rotationY: dir === 1 ? 10 : -10,
        scale: 1.05
      })
      // Slide in new image with enhanced effects
      .to(imageRef.current, {
        x: 0,
        opacity: 1,
        scale: 1,
        rotationY: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  }, [currentIndex, dir]);

  useEffect(() => {
    setHash(`#slide-${currentIndex + 1}`);
  }, [currentIndex, setHash]);

  useEffect(() => {
    if (hash.startsWith('#slide-')) {
      const idx = parseInt(hash.replace('#slide-', '')) - 1;
      if (!isNaN(idx) && idx >= 0 && idx < images.length) {
        const forward = (idx > currentIndex) || (currentIndex === images.length - 1 && idx === 0);
        setDir(forward ? 1 : -1);
        onImageChange(idx);
      }
    }
  }, [hash]);

  useEffect(() => {
    setPrevIndex(currentIndex);
  }, [currentIndex]);

  const currentImage = images[currentIndex];

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-gallery-bg backdrop-blur-sm font-elegant"
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCloseSlideshow}
        className="fixed top-6 left-6 w-12 h-12 bg-gallery-surface/50 hover:bg-gallery-surface/70 backdrop-blur-md rounded-full z-60 text-gallery-text hover:text-gallery-text border border-gallery-text/20"
        aria-label="Close slideshow"
      >
        <X className="h-5 w-5" />
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
          <div className="relative overflow-hidden rounded-3xl">
            <img
              ref={imageRef}
              src={currentImage.src}
              alt={currentImage.alt}
              className={`max-w-[92vw] max-h-[80vh] object-contain object-center rounded-3xl transition-all duration-500 ease-out ${
                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              onLoad={() => {
                setIsLoaded(true);
                if (imageRef.current) {
                  gsap.fromTo(imageRef.current, 
                    { 
                      scale: 1.05,
                      opacity: 0.8
                    },
                    {
                      scale: 1,
                      opacity: 1,
                      duration: 0.6,
                      ease: 'power2.out'
                    }
                  );
                }
              }}
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
        className="fixed left-6 top-1/2 -translate-y-1/2 w-16 h-16 text-black dark:text-white transition-transform"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        className="fixed right-6 top-1/2 -translate-y-1/2 w-16 h-16 text-black dark:text-white hover:scale-110 transition-transform"
        aria-label="Next image"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Thumbnail navigation - Sticked to right */}
      <div className="fixed right-0 top-0 bottom-0 w-16 md:w-20 flex items-center justify-center bg-gallery-bg border-l border-gallery-text/10">
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