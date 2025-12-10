'use client';

import { useQuery } from '@tanstack/react-query';
import { useCityStore } from '@/store/cityStore';
import { categoryService } from '@/services/category.service';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface TrendingCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  businessCount?: number;
}

export default function TrendingSearches() {
  const { selectedCity } = useCityStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['trending-categories', selectedCity?.id],
    queryFn: async () => {
      const response = await categoryService.fetchCategories(1, 50);
      const categories = response.data.categories
        .filter((cat) => (cat._count?.businesses || 0) > 0)
        .sort((a, b) => (b._count?.businesses || 0) - (a._count?.businesses || 0))
        .slice(0, 8); 
      
      return categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon || undefined,
        image: cat.image || undefined,
        businessCount: cat._count?.businesses || 0,
      }));
    },
    enabled: true,
  });

  const trendingCategories: TrendingCategory[] = data || [];

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
      setCanScrollLeft(scrollLeft > 0);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [trendingCategories]);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (isLoading) return <div className="h-64 animate-pulse bg-gray-50 rounded-lg" />;
  if (trendingCategories.length === 0) return null;

  const locationSlug = selectedCity?.slug || 'riyadh';

  return (
    <section className="py-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">
                Trending Searches Near You
              </h2>
              <span className="bg-[#D92626] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] uppercase tracking-wide">
                NEW
              </span>
            </div>
            <p className="text-gray-500 text-[14px]">
              Stay updated with the latest local trends.
            </p>
          </div>

          {/* Carousel Section */}
          <div className="relative group">
            
            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {trendingCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/${locationSlug}/${category.slug}`}
                  className="flex-shrink-0 w-[280px] group/card transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex h-[100px] bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                    
                    {/* Image Side (Left) */}
                    <div className="w-[110px] h-full relative bg-gray-100 shrink-0">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : category.icon ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 p-4">
                          <Image
                            src={category.icon}
                            alt={category.name}
                            width={40}
                            height={40}
                            className="object-contain opacity-80"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300 font-bold text-3xl">
                          {category.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Content Side (Right) */}
                    <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
                      <h3 className="font-bold text-gray-900 text-[15px] truncate mb-1 leading-tight">
                        {category.name}
                      </h3>
                      <div className="flex items-center text-[#0076D7] text-[14px] font-medium group-hover/card:underline">
                        Explore <ChevronRight className="w-4 h-4 ml-0.5 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Right Navigation Arrow (Only visible if scrollable) */}
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