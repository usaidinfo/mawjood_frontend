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
    ...galleryImages,
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

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setShowLightbox(true);
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
            className="object-cover cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => openLightbox(0)}
          />
        </div>
      )}

      {count === 2 && (
        <div className="grid grid-cols-2 gap-1 h-[400px]">
          {displayImages.map((img, idx) => (
            <div key={idx} className="relative cursor-pointer hover:opacity-95 transition-opacity">
              <Image
                src={img.url}
                alt={img.alt}
                fill
                className="object-cover"
                onClick={() => openLightbox(idx)}
              />
            </div>
          ))}
        </div>
      )}

      {count === 3 && (
        <div className="grid grid-cols-3 gap-1 h-[400px]">
          <div className="col-span-2 relative cursor-pointer hover:opacity-95 transition-opacity">
            <Image
              src={displayImages[0].url}
              alt={displayImages[0].alt}
              fill
              className="object-cover"
              onClick={() => openLightbox(0)}
            />
          </div>
          <div className="grid grid-rows-2 gap-1">
            {displayImages.slice(1).map((img, idx) => (
              <div key={idx} className="relative cursor-pointer hover:opacity-95 transition-opacity">
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  onClick={() => openLightbox(idx + 1)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODIFIED: 4 Image Layout */}
      {/* Left: Big | Right Top: 2 Small (50/50) | Right Bottom: 1 Wide (100) */}
      {count === 4 && (
        <div className="grid grid-cols-2 gap-1 h-[400px]">
          {/* 1. First Image (Big Left) */}
          <div className="relative cursor-pointer hover:opacity-95 transition-opacity">
            <Image
              src={displayImages[0].url}
              alt={displayImages[0].alt}
              fill
              className="object-cover"
              onClick={() => openLightbox(0)}
            />
          </div>

          {/* Right Column */}
          <div className="grid grid-rows-2 gap-1">
            {/* Top Row: Image 2 & 3 (50% - 50%) */}
            <div className="grid grid-cols-2 gap-1">
              <div className="relative cursor-pointer hover:opacity-95 transition-opacity">
                <Image
                  src={displayImages[1].url}
                  alt={displayImages[1].alt}
                  fill
                  className="object-cover"
                  onClick={() => openLightbox(1)}
                />
              </div>
              <div className="relative cursor-pointer hover:opacity-95 transition-opacity">
                <Image
                  src={displayImages[2].url}
                  alt={displayImages[2].alt}
                  fill
                  className="object-cover"
                  onClick={() => openLightbox(2)}
                />
              </div>
            </div>

            {/* Bottom Row: Image 4 (100%) */}
            <div className="relative cursor-pointer hover:opacity-95 transition-opacity">
              <Image
                src={displayImages[3].url}
                alt={displayImages[3].alt}
                fill
                className="object-cover"
                onClick={() => openLightbox(3)}
              />
            </div>
          </div>
        </div>
      )}

      {count >= 5 && (
        <div className="grid grid-cols-4 gap-1 h-[400px]">
          <div
            className="col-span-2 row-span-2 relative cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => openLightbox(0)}
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
              className="relative cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => openLightbox(idx + 1)}
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

      {/* ---------------- LIGHTBOX ---------------- */}
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
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-3 hover:bg-white/30 transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-3 hover:bg-white/30 transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 bg-black/50 rounded-lg overflow-x-auto max-w-[90vw]">
            {allImages.map((image, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-16 h-16 flex-shrink-0 rounded overflow-hidden transition-transform ${
                  idx === currentIndex ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
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