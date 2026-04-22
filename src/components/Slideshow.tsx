import React, { useCallback, useEffect, useRef, useState } from 'react';
import gsap from "gsap";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Expand, Minimize, X } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(images.length > 0);
  const [isImmersive, setIsImmersive] = useState(false);
  const AUTO_PLAY_INTERVAL = 4000; // ms
  const LOADER_MIN_DURATION = 450;

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
  const loaderStartTimeRef = useRef<number>(0);

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

  const handleCloseSlideshow = useCallback(() => {
    onClose();
  }, [onClose]);

  const toggleImmersiveMode = useCallback(() => {
    setIsImmersive((current) => !current);
  }, []);

  const handlePrevious = useCallback(() => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onImageChange(newIndex);
  }, [currentIndex, images.length, onImageChange]);

  const handleNext = useCallback(() => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onImageChange(newIndex);
  }, [currentIndex, images.length, onImageChange]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.repeat) return;
    switch (e.key) {
      case 'ArrowLeft':
        handlePrevious();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case 'Escape':
        if (isImmersive) {
          setIsImmersive(false);
        } else {
          handleCloseSlideshow();
        }
        break;
    }
  }, [handleCloseSlideshow, handleNext, handlePrevious, isImmersive]);

  useEffect(() => {
    loaderStartTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!isLoading || images.length === 0) return;

    const initialImage = images[currentIndex];
    if (!initialImage) return;

    let cancelled = false;
    const image = new Image();
    image.decoding = 'async';
    image.fetchPriority = 'high';

    const finishLoading = () => {
      const elapsed = Date.now() - loaderStartTimeRef.current;
      const remaining = Math.max(0, LOADER_MIN_DURATION - elapsed);

      window.setTimeout(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      }, remaining);
    };

    image.onload = finishLoading;
    image.onerror = finishLoading;
    image.src = initialImage.src;

    if (image.complete && image.naturalWidth > 0) {
      finishLoading();
    }

    return () => {
      cancelled = true;
    };
  }, [currentIndex, images, isLoading]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => {
      handleNext();
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(id);
  }, [autoPlay, handleNext]);

  useEffect(() => {
    const onVis = () => setAutoPlay(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    const preloadRange = 2;
    const preloaders: HTMLImageElement[] = [];

    for (let i = 0; i <= preloadRange; i += 1) {
      const nextImage = images[(currentIndex + i) % images.length];
      const previousImage = images[(currentIndex - i + images.length) % images.length];

      [nextImage, previousImage].forEach((image, imageIndex) => {
        if (!image) return;
        const preloader = new Image();
        preloader.decoding = 'async';
        preloader.fetchPriority = i === 0 || (i === 1 && imageIndex === 0) ? 'high' : 'low';
        preloader.src = image.src;
        preloaders.push(preloader);
      });
    }
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

  return (
    <>
      {/* Japanese-themed Loading Screen */}
      <SlideshowLoader isLoading={isLoading} />

      <div
        ref={slideshowRef}
        className="fixed inset-0 z-50 bg-gallery-bg backdrop-blur-sm font-elegant overflow-hidden overscroll-none"
        style={{ opacity: isLoading ? 0 : 1, overflowY: 'hidden' }}
      >
        {/* Particle Background */}
        <ParticleBackground isActive={isLoading} />

        {!isImmersive && (
          <>
            <Button
              ref={closeButtonRef}
              variant="ghost"
              size="icon"
              onClick={handleCloseSlideshow}
              className="fixed left-4 top-4 z-[70] h-11 w-11 rounded-full border border-white/30 bg-white/15 text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-colors duration-300 hover:bg-white/25 dark:border-white/10 dark:bg-black/25 dark:text-white dark:hover:bg-black/35 md:left-6 md:top-6 md:h-12 md:w-12"
              aria-label="Close slideshow"
            >
              <X className="w-5 h-5" />
            </Button>

            <div
              ref={counterRef}
              className="absolute left-1/2 top-5 z-60 -translate-x-1/2 text-xs font-light tracking-[0.24em] text-gallery-text-muted md:top-8 md:text-sm md:tracking-wide"
            >
              {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </div>
          </>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleImmersiveMode}
          className="fixed right-4 top-4 z-[70] h-11 w-11 rounded-full border border-white/30 bg-white/15 text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-colors duration-300 hover:bg-white/25 dark:border-white/10 dark:bg-black/25 dark:text-white dark:hover:bg-black/35 md:right-6 md:top-6 md:h-12 md:w-12"
          aria-label={isImmersive ? 'Show slideshow controls' : 'Hide slideshow controls'}
        >
          {isImmersive ? <Minimize className="w-5 h-5" /> : <Expand className="w-5 h-5" />}
        </Button>

        {/* Main image container */}
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden px-0 pb-0 pt-0 md:px-8 md:pb-10 md:pt-10"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setAutoPlay(false)}
          onMouseLeave={() => setAutoPlay(true)}
        >
          <div className="relative mx-auto flex h-screen w-screen max-h-full justify-center md:h-auto md:w-[90vw]">
            <div className="relative isolate overflow-hidden rounded-none md:rounded-3xl">
              <div className="relative flex h-screen w-screen items-center justify-center md:h-[80vh] md:w-full">
                <img
                  ref={currentImageRef}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  src=""
                  alt=""
                  className="h-full w-full object-contain object-center will-change-transform"
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

        {!isImmersive && (
          <>
            <Button
              ref={leftNavRef}
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="fixed left-3 top-1/2 z-[80] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/20 dark:border-white/10 dark:bg-black/20 dark:hover:bg-black/30 md:left-6 md:h-16 md:w-16 md:hover:scale-110"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
            </Button>

            <Button
              ref={rightNavRef}
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="fixed right-3 top-1/2 z-[80] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/20 dark:border-white/10 dark:bg-black/20 dark:hover:bg-black/30 md:right-28 md:h-16 md:w-16 md:hover:scale-110"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
            </Button>

            <div className="fixed bottom-0 right-0 top-0 z-[40] hidden w-16 items-center justify-center bg-gallery-bg md:flex md:w-20" ref={bottomNavRef}>
              <ThumbnailNav
                images={images.map(img => ({ ...img, src: img.thumbSrc }))}
                currentIndex={currentIndex}
                onImageSelect={onImageChange}
              />
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-[40] flex h-24 items-center justify-center border-t border-white/10 bg-gallery-bg/85 backdrop-blur-md md:hidden">
              <ThumbnailNav
                images={images.map(img => ({ ...img, src: img.thumbSrc }))}
                currentIndex={currentIndex}
                onImageSelect={onImageChange}
                isMobile={true}
              />
            </div>

            <div
              ref={progressBarRef}
              className="absolute bottom-6 left-1/2 z-[65] hidden h-2 w-[min(82vw,42rem)] -translate-x-1/2 cursor-pointer touch-pan-x overflow-hidden rounded-full border border-white/20 bg-white/15 backdrop-blur-sm md:bottom-4 md:block md:h-3 md:w-[70vw] md:max-w-2xl dark:bg-white/15"
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
          </>
        )}

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
