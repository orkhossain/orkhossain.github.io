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
    // Enhanced preloading strategy
    const preloadLinks: HTMLLinkElement[] = [];

    // Preload current image with highest priority
    const currentLink = document.createElement('link');
    currentLink.rel = 'preload';
    currentLink.as = 'image';
    currentLink.href = images[currentIndex]?.src;
    currentLink.fetchPriority = 'high';
    document.head.appendChild(currentLink);
    preloadLinks.push(currentLink);

    // Preload next 3 and previous 3 images for smoother navigation
    const preloadRange = 3;
    for (let i = 1; i <= preloadRange; i++) {
      const nextIdx = (currentIndex + i) % images.length;
      const prevIdx = (currentIndex - i + images.length) % images.length;

      // Preload next images
      if (images[nextIdx]) {
        const nextLink = document.createElement('link');
        nextLink.rel = 'preload';
        nextLink.as = 'image';
        nextLink.href = images[nextIdx].src;
        nextLink.fetchPriority = i === 1 ? 'high' : 'low';
        document.head.appendChild(nextLink);
        preloadLinks.push(nextLink);
      }

      // Preload previous images
      if (images[prevIdx] && prevIdx !== nextIdx) {
        const prevLink = document.createElement('link');
        prevLink.rel = 'preload';
        prevLink.as = 'image';
        prevLink.href = images[prevIdx].src;
        prevLink.fetchPriority = i === 1 ? 'high' : 'low';
        document.head.appendChild(prevLink);
        preloadLinks.push(prevLink);
      }
    }

    return () => {
      // Cleanup all preload links
      preloadLinks.forEach(link => {
        if (link && link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
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
    newImg.decoding = 'async';
    newImg.fetchPriority = 'high';

    newImg.onload = () => {
      // Smooth fade out with subtle scale and rotation
      gsap.to(currentEl, {
        opacity: 0,
        scale: 0.92,
        rotationY: 5,
        filter: 'blur(2px)',
        duration: 0.4,
        ease: "power2.inOut",
        force3D: true, // Hardware acceleration
        onComplete: () => {
          // Change the image source (image is already loaded)
          currentEl.src = currentImage?.src || "";
          currentEl.alt = currentImage?.alt || "";

          // Enhanced fade in with elastic bounce and rotation
          gsap.fromTo(currentEl,
            {
              opacity: 0,
              scale: 1.08,
              rotationY: -5,
              filter: 'blur(2px)'
            },
            {
              opacity: 1,
              scale: 1,
              rotationY: 0,
              filter: 'blur(0px)',
              duration: 0.8,
              ease: "elastic.out(1, 0.6)",
              force3D: true
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
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  src=""
                  alt=""
                  className="w-full h-full object-contain object-center will-change-transform"
                  draggable={false}
                  style={{
                    opacity: 0,
                    imageRendering: 'auto',
                    transform: 'translateZ(0)' // Force hardware acceleration
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed position navigation buttons */}
        <Button
          ref={leftNavRef}
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          className="fixed left-6 top-1/2 -translate-y-1/2 w-16 h-16 z-[80] flex items-center justify-center pointer-events-auto bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 text-white hover:bg-white/20 dark:hover:bg-black/30 hover:scale-110 transition-all duration-300 rounded-full shadow-lg"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>

        <Button
          ref={rightNavRef}
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="fixed right-6 top-1/2 -translate-y-1/2 w-16 h-16 z-[80] flex items-center justify-center pointer-events-auto bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 text-white hover:bg-white/20 dark:hover:bg-black/30 hover:scale-110 transition-all duration-300 rounded-full shadow-lg md:right-28"
          aria-label="Next image"
        >
          <ChevronRight className="h-8 w-8" />
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
        /* Performance optimizations and custom styling */
        .slideshow-container {
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        
        .slideshow-image {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          image-rendering: optimize-quality;
        }
        
        /* Custom horizontal scroller styling for the mobile thumbnail strip */
        [data-thumb-scroll] { 
          scrollbar-width: thin; /* Firefox */
          scrollbar-color: rgba(255,255,255,0.35) transparent; /* Firefox */
          will-change: scroll-position;
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