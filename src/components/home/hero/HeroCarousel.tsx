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
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

  if (loading) {
    return (
      <div className="w-full h-64 md:h-80 rounded-2xl bg-gray-200 animate-pulse" />
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
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

  const currentItem = items[currentIndex];

  return (
    <div className="relative w-full h-50 md:h-60 rounded-2xl overflow-hidden shadow-xl group">
      {/* Carousel Items with transitions */}
      <div className="relative w-full h-full">
        {items.map((item, index) => (
          <Link
            key={item.id}
            href={`/${locationSlug}/${item.slug}`}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="relative w-full h-full">
              <Image
                src={item.image}
                alt={item.title || `Carousel item ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Navigation Arrows - Always visible */}
      {items.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              goToPrevious();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-transparent hover:bg-white text-gray-800 rounded-full p-1 shadow-lg transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              goToNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-transparent hover:bg-white text-gray-800 rounded-full p-1 shadow-lg transition-all"
            aria-label="Next slide"
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
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-white/70 hover:bg-white'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

