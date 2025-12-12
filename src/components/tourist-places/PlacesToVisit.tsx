'use client';

import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { TouristPlaceAttraction } from '@/services/touristPlace.service';

interface PlacesToVisitProps {
  attractions: TouristPlaceAttraction[];
}

export default function PlacesToVisit({ attractions }: PlacesToVisitProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({});

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
  }, [attractions]);

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

  const toggleDescription = (attractionId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [attractionId]: !prev[attractionId]
    }));
  };

  const shouldTruncate = (description: string | null | undefined) => {
    if (!description) return false;
    return description.length > 100;
  };

  if (!attractions || attractions.length === 0) return null;

  return (
    <section className="mb-6 sm:mb-8">
      <div className="mb-3 sm:mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            Places To Visit
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm">
            Top Attractions That Cannot Be Missed
          </p>
        </div>
      </div>

      <div className="relative group">
        {canScrollLeft && (
          <div className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={scrollLeft}
              className="bg-white border border-gray-200 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all"
            >
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-gray-800 rotate-180" />
            </button>
          </div>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {attractions.map((attraction) => {
            const isExpanded = expandedDescriptions[attraction.id];
            const needsTruncation = shouldTruncate(attraction.description);
            const showDescription = attraction.description ? (
              isExpanded 
                ? attraction.description 
                : (needsTruncation ? attraction.description.substring(0, 100) + '...' : attraction.description)
            ) : null;

            return (
              <div
                key={attraction.id}
                className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="relative h-[160px] sm:h-[180px] md:h-[200px] bg-gray-100">
                  <Image
                    src={attraction.image}
                    alt={attraction.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {attraction.rating && (
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-green-500 text-white px-2 py-1 rounded text-xs sm:text-sm font-semibold">
                      {attraction.rating} ★
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1">
                    {attraction.name}
                  </h3>
                  {showDescription && (
                    <div className="mb-2 sm:mb-3">
                      <p className="text-xs sm:text-sm text-gray-600">
                        {showDescription}
                      </p>
                      {needsTruncation && (
                        <button
                          onClick={() => toggleDescription(attraction.id)}
                          className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium mt-1"
                        >
                          {isExpanded ? 'Read less' : 'Read more...'}
                        </button>
                      )}
                    </div>
                  )}
                  {(attraction.openTime || attraction.closeTime) && (
                    <p className="text-xs text-gray-500">
                      {attraction.openTime && `Opens: ${attraction.openTime}`}
                      {attraction.openTime && attraction.closeTime && ' • '}
                      {attraction.closeTime && `Closes: ${attraction.closeTime}`}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {canScrollRight && (
          <div className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={scrollRight}
              className="bg-white border border-gray-200 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all"
            >
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-gray-800" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

