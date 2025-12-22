'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroCarouselItem {
  id: string;
  image: string;
  slug: string;
  title?: string;
}

interface HeroCarouselProps {
  items: HeroCarouselItem[];
  locationSlug: string;
  loading?: boolean;
}

export default function HeroCarousel({ items, locationSlug, loading }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000); 

    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

  if (loading) {
    return (
      <div className="w-full h-44 md:h-60 rounded-2xl bg-gray-200 animate-pulse" />
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="relative w-full h-40 md:h-60 rounded-2xl overflow-hidden md:shadow-xl group bg-transparent">
      
      {/* Carousel Items */}
      <div className="relative w-full h-full">
        {items.map((item, index) => (
          <Link
            key={item.id}
            href={`/${locationSlug}/${item.slug}`}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={item.image}
                alt={item.title || `Carousel item ${index + 1}`}
                fill
                // CHANGE 2: object-contain on mobile (shows full image), object-cover on desktop (fills box)
                className="object-contain md:object-cover" 
                priority={index === 0}
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              goToPrevious();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white text-gray-800 rounded-full p-1 shadow-lg transition-all backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              goToNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white text-gray-800 rounded-full p-1 shadow-lg transition-all backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {items.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                goToSlide(index);
              }}
              className={`h-1.5 rounded-full transition-all shadow-sm ${
                index === currentIndex
                  ? 'w-5 bg-primary'
                  : 'w-1.5 bg-gray-300 hover:bg-white'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}