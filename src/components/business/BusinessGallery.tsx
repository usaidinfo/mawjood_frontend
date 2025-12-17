'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageObject {
  url: string;
  alt?: string;
}

interface Business {
  name: string;
  logo?: string;
  logoAlt?: string;
  coverImage?: string;
  coverImageAlt?: string;
  images?: Array<ImageObject | string | null> | null;
}

interface Props {
  business: Business;
}

export default function BusinessGallery({ business }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  const galleryImages = Array.isArray(business.images)
    ? business.images
        .map((img) => {
          if (!img) return null;
          if (typeof img === 'string') return { url: img, alt: business.name };
          if (typeof img === 'object' && img.url)
            return { url: img.url, alt: img.alt || business.name };
          return null;
        })
        .filter((img): img is { url: string; alt: string } => Boolean(img))
    : [];

  const allImages = [
    business.coverImage
      ? { url: business.coverImage, alt: business.coverImageAlt || `${business.name} cover` }
      : null,
    business.logo
      ? { url: business.logo, alt: business.logoAlt || `${business.name} logo` }
      : null,
    ...galleryImages
  ].filter(Boolean) as { url: string; alt: string }[];

  const displayImages = allImages.slice(0, 5);
  const remainingCount = Math.max(0, allImages.length - 5);

  const nextImage = () => setCurrentIndex((p) => (p + 1) % allImages.length);
  const prevImage = () => setCurrentIndex((p) => (p - 1 + allImages.length) % allImages.length);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setShowLightbox(false);
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  };

  if (allImages.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
        <p className="text-gray-600">No images available</p>
      </div>
    );
  }

  const count = displayImages.length;

  return (
    <>
      {/* ---------------- GRID ---------------- */}

      {count === 1 && (
        <div className="w-full h-[400px] relative">
          <Image
            src={displayImages[0].url}
            alt={displayImages[0].alt}
            fill
            className="object-cover cursor-pointer"
            onClick={() => {
              setCurrentIndex(0);
              setShowLightbox(true);
            }}
          />
        </div>
      )}

      {count === 2 && (
        <div className="grid grid-cols-2 gap-1 h-[400px]">
          {displayImages.map((img, idx) => (
            <div key={idx} className="relative cursor-pointer">
              <Image
                src={img.url}
                alt={img.alt}
                fill
                className="object-cover"
                onClick={() => {
                  setCurrentIndex(idx);
                  setShowLightbox(true);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {count === 3 && (
        <div className="grid grid-cols-3 gap-1 h-[400px]">
          <div className="col-span-2 relative cursor-pointer">
            <Image
              src={displayImages[0].url}
              alt={displayImages[0].alt}
              fill
              className="object-cover"
              onClick={() => {
                setCurrentIndex(0);
                setShowLightbox(true);
              }}
            />
          </div>
          <div className="grid grid-rows-2 gap-1">
            {displayImages.slice(1).map((img, idx) => (
              <div key={idx} className="relative cursor-pointer">
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  onClick={() => {
                    setCurrentIndex(idx + 1);
                    setShowLightbox(true);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {count === 4 && (
        <div className="grid grid-cols-2 grid-rows-2 gap-1 h-[400px]">
          {displayImages.map((img, idx) => (
            <div key={idx} className="relative cursor-pointer">
              <Image
                src={img.url}
                alt={img.alt}
                fill
                className="object-cover"
                onClick={() => {
                  setCurrentIndex(idx);
                  setShowLightbox(true);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {count >= 5 && (
        <div className="grid grid-cols-4 gap-1 h-[400px]">
          <div
            className="col-span-2 row-span-2 relative cursor-pointer"
            onClick={() => {
              setCurrentIndex(0);
              setShowLightbox(true);
            }}
          >
            <Image
              src={displayImages[0].url}
              alt={displayImages[0].alt}
              fill
              className="object-cover"
              priority
            />
          </div>

          {displayImages.slice(1, 5).map((img, idx) => (
            <div
              key={idx}
              className="relative cursor-pointer"
              onClick={() => {
                setCurrentIndex(idx + 1);
                setShowLightbox(true);
              }}
            >
              <Image src={img.url} alt={img.alt} fill className="object-cover" />

              {idx === 3 && remainingCount > 0 && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">+{remainingCount}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ---------------- LIGHTBOX (UNCHANGED) ---------------- */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onKeyDown={(e: any) => handleKeyDown(e)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="absolute top-4 left-4 text-white bg-black/50 px-4 py-2 rounded-full">
            {currentIndex + 1} / {allImages.length}
          </div>

          <div className="relative w-full h-full max-w-7xl max-h-[85vh] mx-4">
            <Image
              src={allImages[currentIndex].url}
              alt={allImages[currentIndex].alt}
              fill
              className="object-contain"
              priority
            />
          </div>

          {allImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-3"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-3"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 bg-black/50 rounded-lg overflow-x-auto">
            {allImages.map((image, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-16 h-16 rounded overflow-hidden ${
                  idx === currentIndex ? 'ring-2 ring-white scale-110' : 'opacity-60'
                }`}
              >
                <Image src={image.url} alt={image.alt} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
