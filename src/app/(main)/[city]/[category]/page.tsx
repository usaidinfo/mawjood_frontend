'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { categoryService, Category } from '@/services/category.service';
import { businessService, Business } from '@/services/business.service';
import { cityService, City as CityType, Region as RegionType, Country as CountryType } from '@/services/city.service';
import { advertisementService, Advertisement } from '@/services/advertisement.service';
import { useCityStore } from '@/store/cityStore';
import BusinessListCard from '@/components/business/BusinessListCard';
import BusinessCard from '@/components/business/BusinessCard';
import { LayoutGrid, List } from 'lucide-react';
import SidebarAd from '@/components/common/SidebarAd';

type FiltersState = {
  search: string;
  rating: string;
  sortBy: string;
};

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating_high', label: 'Rating: High to Low' },
  { value: 'rating_low', label: 'Rating: Low to High' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'verified', label: 'Verified First' },
  { value: 'not_verified', label: 'Not Verified First' },
  { value: 'name_asc', label: 'Alphabetical (A-Z)' },
  { value: 'name_desc', label: 'Alphabetical (Z-A)' },
];

const formatSlugToName = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export default function CityCategoryPage() {
  const params = useParams<{ city: string; category: string }>();
  const router = useRouter();
  const locationSlug = params.city;
  const categorySlug = params.category;

  const {
    cities,
    regions,
    countries,
    selectedCity,
    selectedLocation,
    fetchCities,
    fetchRegions,
    fetchCountries,
    setSelectedCity,
    setSelectedLocation,
  } = useCityStore();

  const [hydratedCity, setHydratedCity] = useState<CityType | null>(null);
  const [hydratedRegion, setHydratedRegion] = useState<RegionType | null>(null);
  const [hydratedCountry, setHydratedCountry] = useState<CountryType | null>(null);
  const [locationType, setLocationType] = useState<'city' | 'region' | 'country'>('city');
  const [category, setCategory] = useState<Category | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [topAdvertisement, setTopAdvertisement] = useState<Advertisement | null>(null);
  const [footerAdvertisement, setFooterAdvertisement] = useState<Advertisement | null>(null);
  const [topAdLoading, setTopAdLoading] = useState(false);
  const [footerAdLoading, setFooterAdLoading] = useState(false);
  const [locationContext, setLocationContext] = useState<{
    requested: { id: string; type: string; name: string } | null;
    applied: { id: string; type: string; name: string } | null;
    fallbackApplied: boolean;
  } | null>(null);
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    rating: '',
    sortBy: 'popular',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const updateFilters = (updates: Partial<FiltersState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setCurrentPage(1);
  };

  useEffect(() => {
    setSearchTerm(filters.search);
  }, [filters.search]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateFilters({ search: searchTerm.trim() });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    updateFilters({ search: '' });
  };

  useEffect(() => {
    if (!cities.length) {
      fetchCities();
    }
  }, [cities.length, fetchCities]);

  useEffect(() => {
    if (!regions.length) {
      fetchRegions();
    }
  }, [regions.length, fetchRegions]);

  useEffect(() => {
    if (!countries.length) {
      fetchCountries();
    }
  }, [countries.length, fetchCountries]);

  useEffect(() => {
    let cancelled = false;

    const resolveLocation = async () => {
      const normalizedSlug = locationSlug.toLowerCase();

      // Check if selectedLocation from store matches the slug and is a country
      if (selectedLocation?.type === 'country' && selectedLocation.slug.toLowerCase() === normalizedSlug && selectedLocation.id) {
        if (!cancelled) {
          setLocationType('country');
          const country = countries.find((c) => c.id === selectedLocation.id) || null;
          setHydratedCountry(country);
          setHydratedCity(null);
          setHydratedRegion(null);
        }
        return;
      }

      const cityMatch =
        cities.find((city) => city.slug.toLowerCase() === normalizedSlug) || null;

      if (cityMatch) {
        if (!cancelled) {
          setLocationType('city');
          setHydratedCity(cityMatch);
          setHydratedRegion(null);
          if (!selectedCity || selectedCity.id !== cityMatch.id) {
            setSelectedCity(cityMatch);
          }
          setSelectedLocation({
            type: 'city',
            slug: cityMatch.slug,
            name: cityMatch.name,
            id: cityMatch.id,
            regionId: cityMatch.regionId,
          });
        }
        return;
      }

      try {
        const remoteCity = await cityService.fetchCityBySlug(locationSlug);
        if (!cancelled && remoteCity) {
          setLocationType('city');
          setHydratedCity(remoteCity);
          setHydratedRegion(null);
          if (!selectedCity || selectedCity.id !== remoteCity.id) {
            setSelectedCity(remoteCity);
          }
          setSelectedLocation({
            type: 'city',
            slug: remoteCity.slug,
            name: remoteCity.name,
            id: remoteCity.id,
            regionId: remoteCity.regionId,
          });
          return;
        }
      } catch (err) {
        console.warn('City lookup failed, trying region/country', err);
      }

      let regionMatch =
        regions.find((region) => region.slug.toLowerCase() === normalizedSlug) || null;
      if (!regionMatch) {
        try {
          const fetchedRegions = await cityService.fetchRegions();
          regionMatch =
            fetchedRegions.find((region) => region.slug.toLowerCase() === normalizedSlug) || null;
        } catch (err) {
          console.error('Failed to fetch regions:', err);
        }
      }

      if (regionMatch) {
        const fallbackCity =
          cities.find((city) => city.regionId === regionMatch!.id) ||
          regionMatch.cities?.[0] ||
          null;

        if (!cancelled) {
          setLocationType('region');
          setHydratedRegion(regionMatch);
          setHydratedCity(fallbackCity || null);

          if (fallbackCity) {
            if (!selectedCity || selectedCity.id !== fallbackCity.id) {
              setSelectedCity(fallbackCity);
            }
          } else {
            setSelectedCity(null);
          }

          setSelectedLocation({
            type: 'region',
            slug: regionMatch.slug,
            name: regionMatch.name,
            id: regionMatch.id,
          });
        }
        return;
      }

      // Try to match country
      let countryMatch =
        countries.find((country) => country.slug.toLowerCase() === normalizedSlug) || null;
      if (!countryMatch && countries.length === 0) {
        try {
          const fetchedCountries = await cityService.fetchCountries();
          countryMatch =
            fetchedCountries.find((country) => country.slug.toLowerCase() === normalizedSlug) || null;
        } catch (err) {
          console.error('Failed to fetch countries:', err);
        }
      }

      if (countryMatch) {
        if (!cancelled) {
          setLocationType('country');
          setHydratedCountry(countryMatch);
          setHydratedCity(null);
          setHydratedRegion(null);
          setSelectedLocation({
            type: 'country',
            slug: countryMatch.slug,
            name: countryMatch.name,
            id: countryMatch.id,
          });
        }
        return;
      }

      if (!cancelled) {
        setLocationType('city');
        setHydratedCity(null);
        setHydratedRegion(null);
        setHydratedCountry(null);
      }
    };

    resolveLocation();

    return () => {
      cancelled = true;
    };
  }, [
    locationSlug,
    cities,
    regions,
    countries,
    selectedCity,
    selectedLocation,
    setSelectedCity,
    setSelectedLocation,
  ]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoadingCategory(true);
        const response = await categoryService.fetchCategoryBySlug(categorySlug);
        setCategory(response.data);
      } catch (err) {
        console.error('Failed to load category:', err);
        setError(err instanceof Error ? err.message : 'Failed to load category');
      } finally {
        setLoadingCategory(false);
      }
    };

    fetchCategory();
  }, [categorySlug]);

  const effectiveCity = useMemo(() => {
    if (hydratedCity) return hydratedCity;
    if (locationType === 'city' && selectedCity && selectedCity.slug.toLowerCase() === locationSlug.toLowerCase()) {
      return selectedCity;
    }
    if (locationType === 'region' && selectedCity) {
      return selectedCity;
    }
    return null;
  }, [hydratedCity, selectedCity, locationType, locationSlug]);

  const locationName = useMemo(() => {
    if (locationType === 'city') {
      return effectiveCity?.name || formatSlugToName(locationSlug);
    }
    if (locationType === 'region') {
      return hydratedRegion?.name || formatSlugToName(locationSlug);
    }
    if (locationType === 'country') {
      return hydratedCountry?.name || selectedLocation?.name || formatSlugToName(locationSlug);
    }
    return formatSlugToName(locationSlug);
  }, [locationType, effectiveCity, hydratedRegion, hydratedCountry, selectedLocation, locationSlug]);

  const effectiveLocation = useMemo(() => {
    // Check selectedLocation from store first (for country selection)
    if (selectedLocation?.type === 'country' && selectedLocation.id) {
      return { id: selectedLocation.id, type: 'country' as const };
    }
    if (locationType === 'country' && hydratedCountry) {
      return { id: hydratedCountry.id, type: 'country' as const };
    }
    if (locationType === 'city' && effectiveCity) {
      return { id: effectiveCity.id, type: 'city' as const };
    }
    if (locationType === 'region' && hydratedRegion) {
      return { id: hydratedRegion.id, type: 'region' as const };
    }
    return null;
  }, [locationType, effectiveCity, hydratedRegion, hydratedCountry, selectedLocation]);
  const effectiveLocationId = effectiveLocation?.id;
  const effectiveLocationType = effectiveLocation?.type;
  const canonicalPath = `/${locationSlug}/${categorySlug}`;
  
  const getResolvedTargetUrl = (ad: Advertisement) => {
    if (!ad?.targetUrl || ad.targetUrl.trim().length === 0) return null;
    return ad.targetUrl.startsWith('http')
      ? ad.targetUrl
      : `/businesses/${ad.targetUrl.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    if (!category) return;

    const existing = document.querySelector(
      'script[type="application/ld+json"][data-category-page]'
    );
    if (existing) existing.remove();

    if (typeof window === 'undefined') return;

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Best ${category.name} in ${locationName}`,
      description: `Find the best ${category.name.toLowerCase()} businesses in ${locationName}. Browse verified listings, read reviews, and get contact information.`,
      url: `${window.location.origin}${canonicalPath}`,
      ...(category.description && { about: category.description }),
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: totalResults,
        itemListElement: businesses.slice(0, 10).map((business, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'LocalBusiness',
            name: business.name,
            url: `${window.location.origin}/businesses/${business.slug}`,
            ...(business.address && {
              address: {
                '@type': 'PostalAddress',
                streetAddress: business.address,
                addressLocality: locationName,
              },
            }),
            ...(business.phone && { telephone: business.phone }),
            ...(business.email && { email: business.email }),
            ...(business.averageRating && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: business.averageRating,
                reviewCount: business.totalReviews || 0,
              },
            }),
          },
        })),
      },
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-category-page', 'true');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector(
        'script[type="application/ld+json"][data-category-page]'
      );
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [category, locationName, canonicalPath, businesses, totalResults]);

  useEffect(() => {
    if (!category) return;
    if (category.subcategories && category.subcategories.length > 0) return;

    const fetchBusinesses = async () => {
      try {
        setBusinessLoading(true);

        const response = await businessService.searchBusinesses({
          categoryIds: [category.id],
          locationId: effectiveLocationId,
          locationType: effectiveLocationType,
          page: currentPage,
          limit: 20,
          search: filters.search.trim().length ? filters.search.trim() : undefined,
          rating: filters.rating ? Number(filters.rating) : undefined,
          sortBy: filters.sortBy,
        });

        setBusinesses(response.businesses || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalResults(response.pagination?.total || 0);
        setLocationContext(response.locationContext || null);
      } catch (err) {
        console.error('Failed to fetch businesses:', err);
        setBusinesses([]);
        setTotalResults(0);
      } finally {
        setBusinessLoading(false);
      }
    };

    fetchBusinesses();
  }, [category, currentPage, effectiveLocationId, effectiveLocationType, filters]);

  // Fetch TOP advertisement (single banner, no carousel)
  useEffect(() => {
    if (!category) return;

    const loadTopAdvertisement = async () => {
      try {
        setTopAdLoading(true);
        const ad = await advertisementService.getDisplayAdvertisement({
          categoryId: category.id,
          locationId: effectiveLocationId ?? undefined,
          locationType: effectiveLocationType,
          adType: 'TOP',
        });
        setTopAdvertisement(ad);
      } catch (err) {
        console.error('Failed to fetch top advertisement:', err);
        setTopAdvertisement(null);
      } finally {
        setTopAdLoading(false);
      }
    };

    loadTopAdvertisement();
  }, [category, effectiveLocationId, effectiveLocationType]);

  // Fetch FOOTER advertisement for the bottom
  useEffect(() => {
    if (!category) return;

    const loadFooterAdvertisement = async () => {
      try {
        setFooterAdLoading(true);
        const ad = await advertisementService.getDisplayAdvertisement({
          categoryId: category.id,
          locationId: effectiveLocationId ?? undefined,
          locationType: effectiveLocationType,
          adType: 'FOOTER',
        });
        setFooterAdvertisement(ad);
      } catch (err) {
        console.error('Failed to fetch footer advertisement:', err);
        setFooterAdvertisement(null);
      } finally {
        setFooterAdLoading(false);
      }
    };

    loadFooterAdvertisement();
  }, [category, effectiveLocationId, effectiveLocationType]);


  if (loadingCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <Link href="/" className="bg-primary text-white px-6 py-3 rounded-lg">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (category.subcategories && category.subcategories.length > 0) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <nav className="flex mb-6 text-sm">
            <Link href="/" className="text-gray-500 hover:text-primary">
              {locationName}
            </Link>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-800">{category.name}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
            Popular {category.name} in {locationName}
          </h1>
          <p className="text-gray-600 mb-8">
            Explore our curated selection of {category.name.toLowerCase()} services
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
            {category.subcategories.map((sub) => {
              const getSubtitle = () => {
                if (sub.description) return sub.description;
                return `${sub.name} Services`;
              };

              return (
                <Link
                  key={sub.id}
                  href={`/${locationSlug}/${sub.slug}`}
                  className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Circular Icon Container */}
                    <div className="relative mb-4 w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      {sub.icon ? (
                        <Image
                          src={sub.icon}
                          alt={sub.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 md:w-14 md:h-14 object-contain"
                          unoptimized
                        />
                      ) : (
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-200 flex items-center justify-center">
                          <span className="text-2xl md:text-3xl">📁</span>
                        </div>
                      )}
                      {/* Hover overlay effect */}
                      <div className="absolute inset-0 rounded-full bg-blue-200 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    </div>

                    {/* Title */}
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                      {sub.name}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-xs md:text-sm text-gray-500 line-clamp-2 leading-tight">
                      {getSubtitle()}
                    </p>

                    {/* Arrow indicator */}
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
      {/* Top Ad Banner (Single, no carousel) */}
      {topAdLoading && (
        <div className="mb-4">
          <div className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      )}
      {!topAdLoading && topAdvertisement && (
        <div className="mb-4">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <div className="relative h-44 md:h-46 lg:h-46">
              {(() => {
                const ad = topAdvertisement;
                const resolvedUrl = getResolvedTargetUrl(ad);
                return (
                  <>
                    {resolvedUrl ? (
                      <Link 
                        href={resolvedUrl} 
                        target={ad.openInNewTab !== false ? '_blank' : '_self'}
                        rel={ad.openInNewTab !== false ? 'noopener noreferrer' : undefined}
                        className="block w-full h-full"
                      >
                        <Image
                          src={ad.imageUrl}
                          alt={ad.title}
                          fill
                          className="object-contain"
                          priority
                        />
                      </Link>
                    ) : (
                      <Image
                        src={ad.imageUrl}
                        alt={ad.title}
                        fill
                        className="object-contain"
                        priority
                      />
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
        <nav className="flex mb-3 text-sm">
          <Link href="/" className="text-gray-500 hover:text-primary">
            {locationName}
          </Link>
          <span className="mx-1.5">&gt;</span>
          <span className="text-gray-800">{category.name}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-8">
          Popular {category.name} in {locationName}
        </h1>

        <div className="bg-white rounded-xl mb-6 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full md:max-w-md gap-2"
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={`Search within ${category.name.toLowerCase()}`}
                style={{ paddingTop: '0.875rem', paddingBottom: '0.875rem' }}
                className="flex-1 px-4 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-3">
              <select
                value={filters.sortBy}
                onChange={(event) => updateFilters({ sortBy: event.target.value })}
                style={{ paddingTop: '0.875rem', paddingBottom: '0.875rem' }}
                className="px-4 border border-gray-300 rounded-lg text-sm bg-white text-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4 inline mr-1" />
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 inline mr-1" />
                  Grid
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
            {filters.search && (
              <span className="text-xs text-gray-500">
                Filtered by search term “{filters.search}”
              </span>
            )}
          </div>
        </div>

        {businessLoading ? (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <div className={viewMode === 'grid' 
                ? 'grid gap-6 grid-cols-1 sm:grid-cols-2'
                : 'space-y-6'
              }>
                {[...Array(viewMode === 'grid' ? 4 : 5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 animate-pulse h-40" />
                ))}
              </div>
            </div>
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-xl p-6 animate-pulse h-96" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {businesses.length > 0 ? (
                <>
                  {/* Location Context Message */}
                  {locationContext?.fallbackApplied && locationContext.applied && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">Note:</span> No businesses found in {locationContext.requested?.name || 'the selected location'}. 
                        Showing results from <span className="font-semibold">{locationContext.applied.name}</span> ({locationContext.applied.type}).
                      </p>
                    </div>
                  )}
                  
                  {viewMode === 'grid' ? (
                    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
                      {businesses.map((business) => (
                        <BusinessCard key={business.id} business={business} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {businesses.map((business) => (
                        <div key={business.id} className="max-w-4xl">
                          <BusinessListCard business={business} />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl">
                  <h3 className="text-xl font-semibold mb-2">No businesses found</h3>
                  <p className="text-gray-600">Check back later for new listings</p>
                </div>
              )}
            </div>

            {/* Sidebar Ad - Always shown with consistent width (300x350 for vertical/square format) */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="sticky top-18">
                <SidebarAd 
                  queryKey="sidebar-ad-category" 
                  height="h-[350px]" 
                  adType="CATEGORY"
                  categoryId={category?.id}
                />
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Footer Ad */}
      {!footerAdLoading && footerAdvertisement && (
        <div className="max-w-7xl mx-auto my-12 px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <div className="relative h-48 md:h-48 lg:h-52">
              {(() => {
                const ad = footerAdvertisement;
                const resolvedUrl = getResolvedTargetUrl(ad);
                return (
                  <>
                    {resolvedUrl ? (
                      <Link href={resolvedUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                        <Image
                          src={ad.imageUrl}
                          alt={ad.title}
                          fill
                          className="object-contain"
                          priority={false}
                        />
                      </Link>
                    ) : (
                      <Image
                        src={ad.imageUrl}
                        alt={ad.title}
                        fill
                        className="object-contain"
                        priority={false}
                      />
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}   