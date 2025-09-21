import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GalleryGrid } from './GalleryGrid';
import { Slideshow } from './Slideshow';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

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


const imageModules = import.meta.glob('/public/gallery/images/*.webp', { eager: true, import: 'default' });

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

  return (
    <div className={`min-h-screen bg-gallery-bg font-elegant ${className}`}>
      {/* Floating Slideshow Button */}
      {!isSlideshow && (
        <Button
          onClick={startSlideshow}
          className="floating-button top-8 right-8 rounded-full w-14 h-14 p-0 bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 shadow-lg hover:bg-white/30 dark:hover:bg-black/30 transition-colors"
          aria-label="Start slideshow"
        >
          <Play className="h-5 w-5" />
        </Button>
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
  );
};