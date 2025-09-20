import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GalleryGrid } from './GalleryGrid';
import { Slideshow } from './Slideshow';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

import gallery1 from '@/assets/gallery-1.jpg';
import gallery2 from '@/assets/gallery-2.jpg';
import gallery3 from '@/assets/gallery-3.jpg';
import gallery4 from '@/assets/gallery-4.jpg';
import gallery5 from '@/assets/gallery-5.jpg';
import gallery6 from '@/assets/gallery-6.jpg';

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

const GALLERY_IMAGES: GalleryImage[] = [
  { id: '1', src: gallery1, alt: 'Abstract geometric composition', width: 1280, height: 720, title: 'Digital Flow', description: 'Modern abstract composition' },
  { id: '2', src: gallery2, alt: 'Misty mountains at sunrise', width: 1024, height: 1280, title: 'Mountain Serenity', description: 'Ethereal landscape' },
  { id: '3', src: gallery3, alt: 'Macro dewdrops on leaf', width: 960, height: 1280, title: 'Nature\'s Detail', description: 'Intimate nature study' },
  { id: '4', src: gallery4, alt: 'Modern architectural lines', width: 960, height: 1280, title: 'Urban Geometry', description: 'Architectural form' },
  { id: '5', src: gallery5, alt: 'Ocean waves long exposure', width: 1280, height: 720, title: 'Eternal Waves', description: 'Timeless seascape' },
  { id: '6', src: gallery6, alt: 'Golden hour forest', width: 1024, height: 1280, title: 'Forest Light', description: 'Natural illumination' },
];

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
          className="floating-button top-8 right-8 rounded-full w-14 h-14 p-0"
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