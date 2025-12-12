'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface GalleryProps {
  images: string[];
  title: string;
}

export default function Gallery({ images, title }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!images || images.length === 0) return null;

  const displayedImages = images.slice(0, 5);
  const remainingCount = images.length - 5;

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, images.length]);

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 h-[250px] sm:h-[300px] md:h-[400px]">
          {/* Main large image */}
          <div 
            className="col-span-2 row-span-2 relative cursor-pointer group"
            onClick={() => setIsModalOpen(true)}
          >
            <Image
              src={images[selectedIndex] || images[0]}
              alt={title}
              fill
              className="object-cover rounded-lg"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
          </div>

          {/* Small images grid - show 4 more */}
          {displayedImages.slice(1, 5).map((img, idx) => {
            // Last image (5th) should show "+X More" if there are more images
            const isLast = idx === 3 && remainingCount > 0;
            return (
              <div
                key={idx}
                className="relative cursor-pointer group"
                onClick={() => {
                  setSelectedIndex(images.indexOf(img));
                  setIsModalOpen(true);
                }}
              >
                <Image
                  src={img}
                  alt={`${title} ${idx + 2}`}
                  fill
                  className="object-cover rounded-lg"
                  unoptimized
                />
                {isLast ? (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm sm:text-base md:text-lg">
                      +{remainingCount} More
                    </span>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            onClick={() => setIsModalOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative max-w-6xl w-full h-full flex items-center">
            <button
              className="absolute left-4 text-white hover:text-gray-300 z-10"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
            >
              <ChevronLeft className="w-12 h-12" />
            </button>
            <div className="relative w-full h-[80vh]">
              <Image
                src={images[selectedIndex]}
                alt={title}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <button
              className="absolute right-4 text-white hover:text-gray-300 z-10"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
            >
              <ChevronRight className="w-12 h-12" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

