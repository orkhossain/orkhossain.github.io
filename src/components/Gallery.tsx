import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GalleryGrid } from './GalleryGrid';
import { LoadingScreen } from './LoadingScreen';
import { Button } from '@/components/ui/button';
import { Play, Shuffle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

gsap.registerPlugin(ScrollTrigger);

const Slideshow = lazy(async () => {
  const module = await import('./Slideshow');
  return { default: module.Slideshow };
});

export interface GalleryImage {
  id: string;
  src: string;
  thumbSrc: string;
  alt: string;
  width: number;
  height: number;
  title?: string;
  description?: string;
}

const IMAGE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  Image5: { width: 4000, height: 5000 },
  Image28: { width: 3376, height: 6000 },
  Image29: { width: 1554, height: 1554 },
};

const DEFAULT_DIMENSIONS = { width: 6000, height: 3376 };
const IMAGE_FILENAMES = [
  'Image1',
  'Image2',
  'Image3',
  'Image4',
  'Image5',
  'Image6',
  'Image7',
  'Image8',
  'Image9',
  'Image10',
  'Image11',
  'Image12',
  'Image13',
  'Image15',
  'Image16',
  'Image17',
  'Image18',
  'Image19',
  'Image20',
  'Image21',
  'Image22',
  'Image23',
  'Image24',
  'Image25',
  'Image26',
  'Image27',
  'Image28',
  'Image29',
] as const;

const getImageDimensions = (filename: string) => {
  return IMAGE_DIMENSIONS[filename] || DEFAULT_DIMENSIONS;
};

const BASE_GALLERY_IMAGES: GalleryImage[] = IMAGE_FILENAMES.map((filename, index) => {
  const dimensions = getImageDimensions(filename);

  return {
    id: String(index + 1),
    src: `/gallery/webp/${filename}.webp`,
    thumbSrc: `/gallery/thumb/${filename}.webp`,
    alt: `${filename}.webp`,
    width: dimensions.width,
    height: dimensions.height,
    title: filename,
    description: '',
  };
});

const shuffleImages = (images: GalleryImage[]) => {
  const shuffled = [...images];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

interface GalleryProps {
  className?: string;
}

export const Gallery: React.FC<GalleryProps> = ({ className = '' }) => {
  const isMobile = useIsMobile();
  const [galleryImages] = useState(() => shuffleImages(BASE_GALLERY_IMAGES));
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'slideshow'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
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
    const randomIndex = Math.floor(Math.random() * galleryImages.length);
    setCurrentImageIndex(randomIndex);
    setIsSlideshow(true);
    setViewMode('slideshow');
  };

  // Preload only the first visible thumbnails and the first full image.
  useEffect(() => {
    let isCancelled = false;
    const criticalImages = [
      ...galleryImages.slice(0, 8).map((image) => image.thumbSrc),
      galleryImages[0]?.src,
    ].filter(Boolean) as string[];

    const totalImages = criticalImages.length;
    let loaded = 0;

    const markLoaded = () => {
      loaded += 1;
      if (!isCancelled) {
        setLoadingProgress((loaded / totalImages) * 100);
      }
    };

    const preloadImage = (src: string, fetchPriority: 'high' | 'low') =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.fetchPriority = fetchPriority;
        img.onload = () => {
          markLoaded();
          resolve();
        };
        img.onerror = () => {
          markLoaded();
          resolve();
        };
        img.src = src;
      });

    Promise.all(
      criticalImages.map((src, index) => preloadImage(src, index < 4 ? 'high' : 'low'))
    ).then(() => {
      if (isCancelled) return;
      window.setTimeout(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }, 180);
    });

    return () => {
      isCancelled = true;
    };
  }, [galleryImages]);

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

      {!isSlideshow && !isLoading && (
        <div className={`floating-controls fixed bottom-4 left-4 z-[9999] flex justify-end md:bottom-6 md:right-1 ${
          isMobile ? 'gap-3' : 'gap-4'
        }`}>
          <Button
            onClick={startSlideshow}
            className="relative h-12 w-12 rounded-full border border-white/40 bg-white/25 p-0 text-black shadow-2xl backdrop-blur-xl transition-all duration-300 hover:bg-white/35 dark:border-white/20 dark:bg-black/30 dark:text-white dark:hover:bg-black/40 md:h-14 md:w-14"
            aria-label="Start slideshow"
            onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.1, duration: 0.2, ease: 'power2.out' })}
            onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2, ease: 'power2.out' })}
          >
            <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
          </Button>

          <Button
            onClick={shuffleSlideshow}
            className="relative h-12 w-12 rounded-full border border-white/40 bg-white/25 p-0 text-black shadow-2xl backdrop-blur-xl transition-all duration-300 hover:bg-white/35 dark:border-white/20 dark:bg-black/30 dark:text-white dark:hover:bg-black/40 md:h-14 md:w-14"
            aria-label="Random slideshow"
            onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.1, duration: 0.2, ease: 'power2.out' })}
            onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2, ease: 'power2.out' })}
          >
            <Shuffle className="h-5 w-5" />
          </Button>

          <div className="flex items-center rounded-full border border-white/30 bg-white/20 px-3 py-1.5 text-center text-xs font-medium text-black/80 shadow-lg backdrop-blur-xl dark:border-white/15 dark:bg-black/25 dark:text-white/80 max-w-[5rem]">
            {galleryImages.length} photos
          </div>
        </div>
      )}

      <div
        ref={galleryRef}
        className={`min-h-screen bg-gallery-bg font-elegant ${className}`}
        style={{ opacity: isLoading ? 0 : 1 }}
      >
        {/* Main Content - Full Screen */}
        <main className="min-h-screen">
          {isSlideshow ? (
            <Suspense fallback={null}>
              <Slideshow
                images={galleryImages}
                currentIndex={currentImageIndex}
                onClose={handleCloseSlideshow}
                onImageChange={setCurrentImageIndex}
              />
            </Suspense>
          ) : (
            <GalleryGrid
              images={galleryImages}
              onImageClick={handleImageClick}
            />
          )}
        </main>
      </div>
    </>
  );
};
