import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
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

  useEffect(() => {
    // Entrance animation
    if (containerRef.current && overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      );

      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.9, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.1 }
      );
    }
  }, []);

  useEffect(() => {
    // Image transition animation
    if (imageRef.current) {
      setIsLoaded(false);
      
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, scale: 1.05 },
        { 
          opacity: 1, 
          scale: 1, 
          duration: 0.5, 
          ease: 'power2.out',
          onComplete: () => setIsLoaded(true)
        }
      );
    }
  }, [currentIndex]);

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

  const currentImage = images[currentIndex];

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-gallery-bg font-elegant"
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="floating-button top-8 left-8 w-12 h-12 rounded-full p-0"
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
        className="absolute inset-0 flex items-center justify-center p-6"
      >
        <div className="relative max-w-5xl max-h-full">
          <img
            ref={imageRef}
            src={currentImage.src}
            alt={currentImage.alt}
            className="max-w-full max-h-full object-contain rounded-2xl shadow-gallery"
            onLoad={() => setIsLoaded(true)}
          />

          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gallery-surface rounded-2xl">
              <div className="w-8 h-8 border-2 border-primary/30 rounded-full animate-spin border-t-primary"></div>
            </div>
          )}

          {/* Elegant image info */}
          {isLoaded && (currentImage.title || currentImage.description) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gallery-bg/80 to-transparent p-12">
              {currentImage.title && (
                <h3 className="text-3xl font-light text-gallery-text mb-3 tracking-wide">
                  {currentImage.title}
                </h3>
              )}
              {currentImage.description && (
                <p className="text-gallery-text-muted italic text-lg font-light">
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
        className="floating-button left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full p-0"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        className="floating-button right-28 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full p-0"
        aria-label="Next image"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Thumbnail navigation */}
      <ThumbnailNav
        images={images}
        currentIndex={currentIndex}
        onImageSelect={onImageChange}
      />
    </div>
  );
};