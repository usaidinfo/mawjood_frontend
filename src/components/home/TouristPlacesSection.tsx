'use client';

import { useQuery } from '@tanstack/react-query';
import { touristPlaceService, TouristPlace } from '@/services/touristPlace.service';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

export default function TouristPlacesSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const { data: touristPlaces, isLoading } = useQuery({
    queryKey: ['tourist-places', 'all'],
    queryFn: async () => {
      const places = await touristPlaceService.getAll({
        limit: 10,
        page: 1,
      });
      return places.slice(0, 6); // Show top 6
    },
    enabled: true,
  });

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
      setCanScrollLeft(scrollLeft > 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [touristPlaces]);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  if (isLoading) return <div className="h-64 animate-pulse bg-gray-50 rounded-lg" />;
  if (!touristPlaces || touristPlaces.length === 0) return null;

  return (
    <section className="py-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">
              Explore Top Tourist Places
              </h2>

            </div>
          </div>

          {/* Carousel Section */}
          <div className="relative group">
            
            {/* Left Navigation Arrow */}
            {canScrollLeft && (
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 z-10">
                <button
                  onClick={scrollLeft}
                  className="bg-white border border-gray-200 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all focus:outline-none"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>
              </div>
            )}

            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {touristPlaces.map((place: TouristPlace) => {
                const galleryImages = Array.isArray(place.galleryImages) 
                  ? place.galleryImages 
                  : place.galleryImages 
                    ? JSON.parse(place.galleryImages as any) 
                    : [];
                const mainImage = galleryImages[0] || '/placeholder-image.jpg';

                return (
                  <Link
                    key={place.id}
                    href={`/tourist-places/${place.slug}`}
                    className="flex-shrink-0 w-[280px] group/card transition-transform hover:-translate-y-0.5"
                  >
                    <div className="flex h-[100px] bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                      
                      {/* Image Side (Left) */}
                      <div className="w-[110px] h-full relative bg-gray-100 shrink-0">
                        <Image
                          src={mainImage}
                          alt={place.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                      {/* Content Side (Right) */}
                      <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
                        <h3 className="font-bold text-gray-900 text-[15px] truncate mb-1 leading-tight">
                          {place.city.name}
                        </h3>
                        <div className="flex items-center text-[#0076D7] text-[14px] font-medium group-hover/card:underline">
                          Explore <ChevronRight className="w-4 h-4 ml-0.5 stroke-[2.5]" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Right Navigation Arrow */}
            {canScrollRight && (
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                <button
                  onClick={scrollRight}
                  className="bg-white border border-gray-200 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all focus:outline-none"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-6 h-6 text-gray-800" />
                </button>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </section>
  );
}

