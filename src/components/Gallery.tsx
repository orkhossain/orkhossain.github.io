import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GalleryGrid } from './GalleryGrid';
import { Slideshow } from './Slideshow';
import { LoadingScreen } from './LoadingScreen';
import { Button } from '@/components/ui/button';
import { Play, Grid, Shuffle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  title?: string;
  description?: string;
}


const imageModules = import.meta.glob('/public/gallery/webp/*.webp', { eager: true, import: 'default' });

const GALLERY_IMAGES: GalleryImage[] = Object.entries(imageModules).map(([path, src], index) => {
  const filename = path.split('/').pop() || `image-${index}`;
  return {
    id: String(index + 1),
    src: src as string,
    alt: filename,
    width: 1280,
    height: 720,
    title: filename,
    description: ''
  };
});

interface GalleryProps {
  className?: string;
}

export const Gallery: React.FC<GalleryProps> = ({ className = '' }) => {
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'slideshow'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsSlideshow(true);
    setViewMode('slideshow');
  };

  const handleCloseSlideshow = () => {
    setIsSlideshow(false);
    setViewMode('grid');
  };

  const startSlideshow = () => {
    setCurrentImageIndex(0);
    setIsSlideshow(true);
    setViewMode('slideshow');
  };

  const shuffleSlideshow = () => {
    const randomIndex = Math.floor(Math.random() * GALLERY_IMAGES.length);
    setCurrentImageIndex(randomIndex);
    setIsSlideshow(true);
    setViewMode('slideshow');
  };

  // Preload images and track progress
  useEffect(() => {
    const preloadImages = async () => {
      const totalImages = GALLERY_IMAGES.length;
      let loaded = 0;

      const loadPromises = GALLERY_IMAGES.map((image) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            loaded++;
            const progress = (loaded / totalImages) * 100;
            setLoadingProgress(progress);
            setImagesLoaded(loaded);
            resolve();
          };
          img.onerror = () => {
            loaded++;
            const progress = (loaded / totalImages) * 100;
            setLoadingProgress(progress);
            setImagesLoaded(loaded);
            resolve();
          };
          img.src = image.src;
        });
      });

      await Promise.all(loadPromises);

      // Add a small delay for smooth transition
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    preloadImages();
  }, []);

  // Entrance animation for gallery
  useEffect(() => {
    if (!isLoading && galleryRef.current) {
      gsap.fromTo(galleryRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power1.out" }
      );
    }
  }, [isLoading]);

  return (
    <>
      <LoadingScreen
        isLoading={isLoading}
        progress={loadingProgress}
        onComplete={() => setIsLoading(false)}
      />

      <div
        ref={galleryRef}
        className={`min-h-screen bg-gallery-bg font-elegant ${className}`}
        style={{ opacity: isLoading ? 0 : 1 }}
      >
        {/* Enhanced Floating Controls */}
        {!isSlideshow && !isLoading && (
          <div className="fixed top-8 right-8 z-50 flex flex-col gap-3">
            <Button
              onClick={startSlideshow}
              className="rounded-full w-14 h-14 p-0 bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 shadow-lg hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300 hover:scale-110"
              aria-label="Start slideshow"
              onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.1, duration: 0.2 })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}
            >
              <Play className="h-5 w-5" />
            </Button>

            <Button
              onClick={shuffleSlideshow}
              className="rounded-full w-14 h-14 p-0 bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 shadow-lg hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300"
              aria-label="Random slideshow"
              onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.1, duration: 0.2 })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}
            >
              <Shuffle className="h-5 w-5" />
            </Button>

            {/* Stats Badge */}
            <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 text-xs text-white/70 text-center">
              {GALLERY_IMAGES.length} photos
            </div>
          </div>
        )}

        {/* Main Content - Full Screen */}
        <main className="min-h-screen">
          {isSlideshow ? (
            <Slideshow
              images={GALLERY_IMAGES}
              currentIndex={currentImageIndex}
              onClose={handleCloseSlideshow}
              onImageChange={setCurrentImageIndex}
            />
          ) : (
            <GalleryGrid
              images={GALLERY_IMAGES}
              onImageClick={handleImageClick}
            />
          )}
        </main>
      </div>
    </>
  );
};