import React, { useEffect, useRef, useState } from 'react';
import gsap from "gsap";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { GalleryImage } from './Gallery';
import { ThumbnailNav } from './ThumbnailNav';
import { ParticleBackground } from './ParticleBackground';
import { SlideshowLoader } from './SlideshowLoader';

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
  const [autoPlay, setAutoPlay] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const AUTO_PLAY_INTERVAL = 4000; // ms

  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  const bottomNavRef = useRef<HTMLDivElement>(null);

  const seekBarRef = useRef<HTMLDivElement>(null);
  const isSeekingRef = useRef(false);

  const currentImageRef = useRef<HTMLImageElement>(null);
  const slideshowRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const leftNavRef = useRef<HTMLButtonElement>(null);
  const rightNavRef = useRef<HTMLButtonElement>(null);

  const seekToClientX = (clientX: number) => {
    if (!seekBarRef.current || images.length === 0) return;
    const rect = seekBarRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const ratio = x / rect.width;
    const newIndex = Math.min(images.length - 1, Math.max(0, Math.round(ratio * (images.length - 1))));
    onImageChange(newIndex);
  };

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setAutoPlay(false);
  };
  const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => {
    if (Math.abs(touchDeltaX.current) > 40) {
      if (touchDeltaX.current > 0) handlePrevious(); else handleNext();
    }
    setTimeout(() => setAutoPlay(true), 800);
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  const handleSeekPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    isSeekingRef.current = true;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    seekToClientX(e.clientX);
  };
  const handleSeekPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!isSeekingRef.current) return;
    seekToClientX(e.clientX);
  };
  const handleSeekPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    isSeekingRef.current = false;
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
  };

  const handleCloseSlideshow = () => {
    // Just close immediately
    onClose();
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
    if ((e as any).repeat) return;
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
    if (!autoPlay) return;
    const id = setInterval(() => {
      handleNext();
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(id);
  }, [autoPlay, currentIndex]);

  useEffect(() => {
    const onVis = () => setAutoPlay(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    // Preload current image via <link rel="preload"> for faster fetch
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = images[currentIndex]?.src;
    document.head.appendChild(link);

    // Preload neighbors using Image()
    const nextIdx = (currentIndex + 1) % images.length;
    const prevIdx = (currentIndex - 1 + images.length) % images.length;
    const nextImg = new Image();
    const prevImg = new Image();
    nextImg.decoding = 'async';
    prevImg.decoding = 'async';
    nextImg.loading = 'eager';
    prevImg.loading = 'eager';
    nextImg.src = images[nextIdx]?.src || '';
    prevImg.src = images[prevIdx]?.src || '';

    return () => {
      // Cleanup the preload link
      if (link && link.parentNode) link.parentNode.removeChild(link);
    };
  }, [currentIndex, images]);

  useEffect(() => {
    if (bottomNavRef.current) {
      const activeThumb = bottomNavRef.current.querySelector('.border-primary') as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [currentIndex]);

  // Track if this is the first render to avoid double flash
  const isFirstRender = useRef(true);

  // Smooth fade transition when switching images
  useEffect(() => {
    if (!currentImageRef.current || images.length === 0) return;

    const currentEl = currentImageRef.current;
    const currentImage = images[currentIndex];

    // For first render, just set the image without animation
    if (isFirstRender.current) {
      currentEl.src = currentImage?.src || "";
      currentEl.alt = currentImage?.alt || "";
      currentEl.style.opacity = "1";
      currentEl.style.transform = "scale(1)";
      isFirstRender.current = false;

      // Update progress bar for first render
      if (progressFillRef.current) {
        progressFillRef.current.style.width = `${((currentIndex + 1) / images.length) * 100}%`;
      }
      return;
    }

    // Preload the new image first
    const newImg = new Image();
    newImg.onload = () => {
      // Cool fade out with subtle scale down
      gsap.to(currentEl, {
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          // Change the image source (image is already loaded)
          currentEl.src = currentImage?.src || "";
          currentEl.alt = currentImage?.alt || "";

          // Cool fade in with scale up and bounce
          gsap.fromTo(currentEl,
            {
              opacity: 0,
              scale: 1.05
            },
            {
              opacity: 1,
              scale: 1,
              duration: 0.5,
              ease: "back.out(1.2)"
            }
          );
        }
      });
    };

    // Start preloading
    newImg.src = currentImage?.src || "";

    // Smooth progress bar animation
    if (progressFillRef.current) {
      gsap.to(progressFillRef.current, {
        width: `${((currentIndex + 1) / images.length) * 100}%`,
        duration: 0.6,
        ease: "power2.out"
      });
    }

    // Subtle counter bounce animation
    if (counterRef.current) {
      gsap.to(counterRef.current, {
        scale: 1.1,
        duration: 0.15,
        ease: "power2.out",
        yoyo: true,
        repeat: 1
      });
    }
  }, [currentIndex, images]);

  // Simple show slideshow after loading
  useEffect(() => {
    if (!slideshowRef.current || isLoading) return;

    // Just show everything immediately
    if (slideshowRef.current) {
      slideshowRef.current.style.opacity = '1';
    }
  }, [isLoading]);

  // Removed magnetic cursor effect

  const currentImage = images[currentIndex];

  // Debug effect to log image data
  useEffect(() => {
    console.log('Slideshow Debug:', {
      currentIndex,
      currentImage,
      imagesLength: images.length,
      isLoading,
      currentImageSrc: currentImageRef.current?.src
    });
  }, [currentIndex, currentImage, images.length, isLoading]);

  return (
    <>
      {/* Japanese-themed Loading Screen */}
      <SlideshowLoader
        isLoading={isLoading}
        onComplete={() => setIsLoading(false)}
      />

      <div
        ref={slideshowRef}
        className="fixed inset-0 z-50 bg-gallery-bg backdrop-blur-sm font-elegant overflow-hidden overscroll-none"
        style={{ opacity: isLoading ? 0 : 1, overflowY: 'hidden' }}
      >
        {/* Particle Background */}
        <ParticleBackground isActive={isLoading} />

        {/* Close button */}
        <Button
          ref={closeButtonRef}
          variant="ghost"
          size="icon"
          onClick={handleCloseSlideshow}
          className="fixed top-6 left-6 w-12 h-12 z-[70] pointer-events-auto bg-white/15 dark:bg-black/25 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:bg-white/25 dark:hover:bg-black/35 text-white dark:text-white transition-colors duration-300 rounded-full"
          aria-label="Close slideshow"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Image counter */}
        <div
          ref={counterRef}
          className="absolute top-8 left-1/2 -translate-x-1/2 z-60 text-sm text-gallery-text-muted font-light tracking-wide"
        >
          {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </div>

        {/* Main image container */}
        <div
          className="absolute inset-0 flex items-center justify-center px-4 md:px-8 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setAutoPlay(false)}
          onMouseLeave={() => setAutoPlay(true)}
        >
          <div className="relative w-[90vw] max-h-full mx-auto flex justify-center">
            <div className="relative overflow-hidden rounded-3xl isolate">
              <div className="relative w-full h-[80vh] flex items-center justify-center">
                <img
                  ref={currentImageRef}
                  loading="lazy"
                  src=""
                  alt=""
                  className="w-full h-full object-contain object-center"
                  draggable={false}
                  style={{ opacity: 0 }}
                  />
              </div>
            </div>
          </div>
        </div>

        {/* Elegant navigation buttons */}
        <Button
          ref={leftNavRef}
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          className="fixed left-3 md:left-6 bottom-24 md:bottom-auto md:top-1/2 md:-translate-y-1/2 w-12 h-12 md:w-16 md:h-16 z-[80] flex items-center justify-center pointer-events-auto bg-transparent text-white hover:!bg-transparent active:!bg-transparent focus:!bg-transparent focus-visible:ring-0 hover:!text-white active:!text-white transition-none"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-10 w-10" />
        </Button>

        <Button
          ref={rightNavRef}
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="fixed right-3 md:right-28 bottom-24 md:bottom-auto md:top-1/2 md:-translate-y-1/2 w-12 h-12 md:w-16 md:h-16 z-[80] flex items-center justify-center pointer-events-auto bg-transparent text-white hover:!bg-transparent active:!bg-transparent focus:!bg-transparent focus-visible:ring-0 hover:!text-white active:!text-white transition-none"
          aria-label="Next image"
        >
          <ChevronRight className="h-10 w-10" />
        </Button>

        {/* Thumbnail navigation - Right side on desktop, bottom on mobile */}
        <div className="fixed right-0 top-0 bottom-0 w-16 md:w-20 hidden md:flex items-center justify-center bg-gallery-bg z-[40]" ref={bottomNavRef}>
          <ThumbnailNav
            images={images.map(img => ({
              ...img,
              src: img.src.replace('/webp/', '/thumb/')
            }))}
            currentIndex={currentIndex}
            onImageSelect={onImageChange}
          />
        </div>

        {/* Mobile thumbnail navigation - Bottom horizontal strip */}
        <div className="fixed bottom-0 left-0 right-0 h-16 flex md:hidden items-center justify-center bg-gallery-bg/80 backdrop-blur-sm z-[40]">
          <ThumbnailNav
            images={images.map(img => ({
              ...img,
              src: img.src.replace('/webp/', '/thumb/')
            }))}
            currentIndex={currentIndex}
            onImageSelect={onImageChange}
            isMobile={true}
          />
        </div>

        <div
          ref={progressBarRef}
          className="absolute left-1/2 -translate-x-1/2 bottom-20 md:bottom-4 z-[65] w-[70vw] max-w-2xl h-3 bg-white/15 dark:bg-white/15 rounded-full overflow-hidden cursor-pointer touch-pan-x border border-white/20 backdrop-blur-sm"
          onPointerDown={handleSeekPointerDown}
          onPointerMove={handleSeekPointerMove}
          onPointerUp={handleSeekPointerUp}
        >
          <div
            ref={progressFillRef}
            className="h-full bg-black/60 dark:bg-white/70 rounded-full"
            style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
          />
        </div>

        <style>{`
        /* Custom horizontal scroller styling for the mobile thumbnail strip */
        [data-thumb-scroll] { 
          scrollbar-width: thin; /* Firefox */
          scrollbar-color: rgba(255,255,255,0.35) transparent; /* Firefox */
        }
        [data-thumb-scroll]::-webkit-scrollbar {
          height: 6px; /* Horizontal scrollbar height */
        }
        [data-thumb-scroll]::-webkit-scrollbar-track {
          background: transparent;
        }
        [data-thumb-scroll]::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.35);
          border-radius: 9999px; /* pill */
        }
        [data-thumb-scroll]:hover::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.55);
        }
        @media (prefers-color-scheme: light) {
          [data-thumb-scroll] { scrollbar-color: rgba(0,0,0,0.35) transparent; }
          [data-thumb-scroll]::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.35); }
          [data-thumb-scroll]:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.55); }
        }
      `}</style>
      </div>
    </>
  );
};