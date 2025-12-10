'use client';

import { useQuery } from '@tanstack/react-query';
import { touristPlaceService } from '@/services/touristPlace.service';
import { categoryService } from '@/services/category.service';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Heart, Phone, MapPin, Star } from 'lucide-react';
import { useRef, useState, useEffect, useMemo } from 'react';
import { TouristPlaceBusinessSection } from '@/services/touristPlace.service';
import { useFavorites } from '@/hooks/useFavorites';

interface TopBusinessesProps {
  sections: TouristPlaceBusinessSection[];
  placeSlug: string;
  citySlug: string;
  cityName: string;
}

export default function TopBusinesses({ sections, placeSlug, citySlug, cityName }: TopBusinessesProps) {
  if (!sections || sections.length === 0) return null;

  // Fetch categories once for all sections
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories-for-sections'],
    queryFn: async () => {
      const response = await categoryService.fetchCategories(1, 100);
      return response.data.categories;
    },
  });

  // Fetch businesses for the first section only (we'll reuse the data)
  // This reduces queries significantly - instead of N queries (one per category), we make 1 query per section
  const firstSection = sections[0];
  const { data: firstSectionBusinesses } = useQuery({
    queryKey: ['tourist-place-businesses-section', placeSlug, firstSection?.id],
    queryFn: () => touristPlaceService.getBusinesses(placeSlug, firstSection.id, { limit: 100 }),
    enabled: !!placeSlug && !!firstSection?.id,
  });

  const businessesBySection = useMemo(() => {
    const map: { [key: string]: any } = {};
    sections.forEach((section) => {
      map[section.id] = firstSectionBusinesses;
    });
    return map;
  }, [sections, firstSectionBusinesses]);

  const expandedSections: Array<{
    id: string;
    categoryId: string;
    categoryName: string;
    sectionId: string;
  }> = [];

  if (categoriesData) {
    sections.forEach((section) => {
      if (section.categoryIds && Array.isArray(section.categoryIds)) {
        section.categoryIds.forEach((categoryId: string) => {
          const category = categoriesData.find((cat: any) => cat.id === categoryId);
          if (category) {
            expandedSections.push({
              id: `${section.id}-${categoryId}`,
              categoryId,
              categoryName: category.name,
              sectionId: section.id,
            });
          }
        });
      }
    });
  }

  if (categoriesLoading) {
    return (
      <div className="space-y-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-64 animate-pulse bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (expandedSections.length === 0) return null;

  return (
    <div className="space-y-8">
      {expandedSections.map((expandedSection) => (
        <BusinessSection
          key={expandedSection.id}
          sectionId={expandedSection.sectionId}
          categoryId={expandedSection.categoryId}
          categoryName={expandedSection.categoryName}
          placeSlug={placeSlug}
          citySlug={citySlug}
          cityName={cityName}
          allBusinessesData={businessesBySection[expandedSection.sectionId]}
        />
      ))}
    </div>
  );
}

function BusinessSection({
  sectionId,
  categoryId,
  categoryName,
  placeSlug,
  citySlug,
  cityName,
  allBusinessesData,
}: {
  sectionId: string;
  categoryId: string;
  categoryName: string;
  placeSlug: string;
  citySlug: string;
  cityName: string;
  allBusinessesData?: any;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const { isFavorite, toggleFavorite, isLoading: favLoading } = useFavorites();

  const sectionTitle = `Top ${categoryName} in ${cityName}`;

  // Filter businesses by category from the already-fetched data
  const data = useMemo(() => {
    if (!allBusinessesData?.businesses) return null;
    const filtered = allBusinessesData.businesses.filter((b: any) => b.category?.id === categoryId);
    return {
      ...allBusinessesData,
      businesses: filtered.slice(0, 10),
    };
  }, [allBusinessesData, categoryId]);

  const isLoading = !allBusinessesData;

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
  }, [data]);

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

  if (isLoading) {
    return (
      <section className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{sectionTitle}</h2>
        <div className="h-48 sm:h-64 animate-pulse bg-gray-100 rounded-lg" />
      </section>
    );
  }

  if (!data || !data.businesses || data.businesses.length === 0) return null;

  const descriptionText = (text: string) => {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  };

  return (
    <section className="mb-6 sm:mb-8">
      <div className="mb-3 sm:mb-4 flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{sectionTitle}</h2>
      </div>

      <div className="relative group">
        {canScrollLeft && (
          <div className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={scrollLeft}
              className="bg-white border border-gray-200 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all"
            >
              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-gray-800" />
            </button>
          </div>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {data.businesses.map((business: any) => (
            <div
              key={business.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex-shrink-0 w-[260px] sm:w-[280px] md:w-72 snap-start"
            >
              <div className="relative h-40 sm:h-44 md:h-48 group">
                <Link href={`/businesses/${business.slug}`}>
                  <Image
                    src={business.coverImage || business.logo || '/placeholder-business.jpg'}
                    alt={business.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    unoptimized
                  />
                </Link>

                <button
                  onClick={() => toggleFavorite(business.id)}
                  disabled={favLoading}
                  className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
                  aria-label="Add to favorites"
                >
                  {favLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <Heart
                      className={`w-5 h-5 ${isFavorite(business.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-600'
                        }`}
                    />
                  )}
                </button>
              </div>

              <div className="p-3 sm:p-4">
                <Link href={`/businesses/${business.slug}`}>
                  <h3 className="font-semibold text-sm sm:text-md text-gray-900 mb-1 hover:text-primary transition-colors flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="truncate">{business.name.charAt(0).toUpperCase() + business.name.slice(1)}</span>
                    {business.isVerified && (
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </h3>
                </Link>

                {business.description && (
                  <p className="text-xs text-gray-600 mb-2 sm:mb-3 line-clamp-2 min-h-[2.5rem] sm:min-h-[2rem]">
                    {descriptionText(business.description)}
                  </p>
                )}
                {!business.description && (
                  <div className="h-8 sm:h-10 mb-2 sm:mb-3"></div>
                )}

                <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3">
                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{business.phone}</span>
                    </a>
                  )}
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{business.city?.name || cityName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-200">
                  <Link 
                    href={`/${citySlug}/${business.category?.slug}`}
                    className="flex items-center gap-1 hover:text-primary transition-colors min-w-0"
                  >
                    <div className="relative text-sm sm:text-base">
                      🏷️
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                      {business.category?.name}
                    </span>
                  </Link>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {business.totalReviews > 0 && business.averageRating > 0 ? (
                      <div className="flex items-center gap-0.5 sm:gap-1 bg-green-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold">
                        <span>{business.averageRating.toFixed(1)}</span>
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" />
                        <span className="ml-0.5 sm:ml-1 whitespace-nowrap hidden sm:inline">
                          {business.totalReviews} {business.totalReviews === 1 ? 'Review' : 'Reviews'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] sm:text-xs text-gray-600 whitespace-nowrap">
                        {business.totalReviews === 1 ? '1 Review' : `${business.totalReviews || 0} Reviews`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
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

