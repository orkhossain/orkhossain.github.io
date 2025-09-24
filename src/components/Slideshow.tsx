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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const AUTO_PLAY_INTERVAL = 4000; // ms
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const prevImageRef = useRef<HTMLImageElement>(null);
  const transitionTl = useRef<gsap.core.Timeline | null>(null);

  const [prevIndex, setPrevIndex] = useState(currentIndex);
  const [dir, setDir] = useState<1 | -1>(1);

  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  const bottomNavRef = useRef<HTMLDivElement>(null);

  const seekBarRef = useRef<HTMLDivElement>(null);
  const isSeekingRef = useRef(false);

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
    // Just close, no hash logic
    setTimeout(() => onClose(), 100);
  };

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDir(-1);
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    setPrevIndex(currentIndex);
    onImageChange(newIndex);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDir(1);
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    setPrevIndex(currentIndex);
    onImageChange(newIndex);
    setTimeout(() => setIsTransitioning(false), 500);
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
      if (!isTransitioning) {
        handleNext();
      }
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(id);
  }, [autoPlay, isTransitioning, currentIndex]);

  useEffect(() => {
    const onVis = () => setAutoPlay(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    setIsLoaded(false);

    if (!imageRef.current || !prevImageRef.current) return;

    // Kill any previous animation to avoid race conditions / flicker
    if (transitionTl.current) {
      transitionTl.current.kill();
      transitionTl.current = null;
    }

    const incoming = imageRef.current;
    const outgoing = prevImageRef.current;

    const fromX = dir === 1 ? 120 : -120;
    const toX = dir === 1 ? -120 : 120;

    gsap.set([incoming, outgoing], { force3D: true, visibility: 'visible' });

    // Prepare layers (no rotateY to avoid backface glitches)
    gsap.set(incoming, { x: fromX, opacity: 0 });
    gsap.set(outgoing, { x: 0, opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    transitionTl.current = tl;

    tl.to(outgoing, { x: toX, opacity: 0, duration: 0.32, ease: 'power2.in' })
      .to(incoming, { x: 0, opacity: 1, duration: 0.42 }, '<')
      .add(() => {
        // Hide and reset the outgoing layer to prevent shadow trails
        gsap.set(outgoing, { visibility: 'hidden', x: 0, opacity: 0, clearProps: 'transform' });
        // Ensure incoming is fully visible and no residual transform
        gsap.set(incoming, { visibility: 'visible', opacity: 1, clearProps: 'transform' });
        transitionTl.current = null;
      });
  }, [currentIndex, dir]);

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

  const currentImage = images[currentIndex];

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-gallery-bg backdrop-blur-sm font-elegant overflow-hidden overscroll-none"
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCloseSlideshow}
        className="fixed top-6 left-6 w-12 h-12 z-[70] pointer-events-auto bg-white/15 dark:bg-black/25 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:bg-white/25 dark:hover:bg-black/35 text-white dark:text-white transition-colors duration-300 rounded-full"
        aria-label="Close slideshow"
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Image counter */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-60 text-sm text-gallery-text-muted font-light tracking-wide">
        {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
      </div>

      {/* Main image container */}
      <div 
        ref={containerRef}
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
              {/* Previous image layer */}
              <img
                loading="lazy"
                // decoding="async"
                // sizes="(max-width: 768px) 90vw, 70vw"
                ref={prevImageRef}
                src={images[prevIndex]?.src.includes('/thumb/') ? images[prevIndex].src.replace('/thumb/', '/webp/') : images[prevIndex]?.src}
                alt={images[prevIndex]?.alt || ''}
                className="absolute inset-0 w-full h-full object-contain object-center select-none pointer-events-none transform-gpu shadow-none mix-blend-normal"
                // style={{ backfaceVisibility: 'hidden', willChange: 'transform, opacity' }}
                draggable={false}
              />
              {/* Current image layer */}
              <img
                ref={imageRef}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                sizes="(max-width: 768px) 90vw, 70vw"
                width={currentImage.width}
                height={currentImage.height}
                src={currentImage.src.includes('/thumb/') ? currentImage.src.replace('/thumb/', '/webp/') : currentImage.src}
                alt={currentImage.alt}
                className={`absolute inset-0 w-full h-full object-contain object-center bg-transparent select-none pointer-events-none transform-gpu shadow-none mix-blend-normal transition-opacity duration-700 ease-out`}
                style={{ backfaceVisibility: 'hidden', willChange: 'transform, opacity' }}
                onLoad={() => {
                  setIsLoaded(true);
                }}
                draggable={false}
              />
            </div>
          </div>

          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gallery-surface rounded-2xl">
              <div className="w-8 h-8 border-2 border-primary/30 rounded-full animate-spin border-t-primary"></div>
            </div>
          )}

        </div>
      </div>

      {/* Elegant navigation buttons */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrevious}
        disabled={isTransitioning}
        className="fixed left-3 md:left-6 bottom-24 md:bottom-auto md:top-1/2 md:-translate-y-1/2 w-12 h-12 md:w-16 md:h-16 z-[80] flex items-center justify-center pointer-events-auto bg-transparent text-white hover:!bg-transparent active:!bg-transparent focus:!bg-transparent focus-visible:ring-0 hover:!text-white active:!text-white transition-none disabled:opacity-40 disabled:pointer-events-none"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-10 w-10" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        disabled={isTransitioning}
        className="fixed right-3 md:right-28 bottom-24 md:bottom-auto md:top-1/2 md:-translate-y-1/2 w-12 h-12 md:w-16 md:h-16 z-[80] flex items-center justify-center pointer-events-auto bg-transparent text-white hover:!bg-transparent active:!bg-transparent focus:!bg-transparent focus-visible:ring-0 hover:!text-white active:!text-white transition-none disabled:opacity-40 disabled:pointer-events-none"
        aria-label="Next image"
      >
        <ChevronRight className="h-10 w-10" />
      </Button>

      {/* Thumbnail navigation - Sticked to right (md+) */}
      <div className="fixed right-0 top-0 bottom-0 w-16 md:w-20 flex items-center justify-center bg-gallery-bg z-[40] md:flex hidden">
        <ThumbnailNav
          images={images.map(img => ({
            ...img,
            src: img.src.replace('/webp/', '/thumb/')
          }))}
          currentIndex={currentIndex}
          onImageSelect={onImageChange}
        />
      </div>


      <div
        ref={seekBarRef}
        className="absolute left-1/2 -translate-x-1/2 bottom-20 md:bottom-4 z-[65] w-[70vw] max-w-2xl h-3 bg-white/15 dark:bg-white/15 rounded-full overflow-hidden cursor-pointer touch-pan-x border border-white/20 backdrop-blur-sm"
        onPointerDown={handleSeekPointerDown}
        onPointerMove={handleSeekPointerMove}
        onPointerUp={handleSeekPointerUp}
      >
        <div
          className="h-full bg-black/60 dark:bg-white/70 rounded-full transition-all duration-200"
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
  );
};