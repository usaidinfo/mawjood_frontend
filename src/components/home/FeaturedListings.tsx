'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Phone, MapPin, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { businessService, Business } from '@/services/business.service';
import { useCityStore } from '@/store/cityStore';
import { useFavorites } from '@/hooks/useFavorites';

export default function FeaturedListings() {
    const { selectedCity, selectedLocation } = useCityStore();
    const { isFavorite, toggleFavorite, isLoading: favLoading } = useFavorites();
    
    // Track the current PAGE (Slide), not the item index
    const [currentSlide, setCurrentSlide] = useState(0);
    
    // Responsive businesses per page
    const [businessesPerPage, setBusinessesPerPage] = useState(1);
    
    // Update visible count based on screen size
    useEffect(() => {
        const updateBusinessesPerPage = () => {
            if (window.innerWidth >= 1024) {
                setBusinessesPerPage(4); // Desktop: 4 businesses
            } else if (window.innerWidth >= 768) {
                setBusinessesPerPage(2); // Tablet: 2 businesses
            } else {
                setBusinessesPerPage(1); // Mobile: 1 business
            }
        };
        
        updateBusinessesPerPage();
        window.addEventListener('resize', updateBusinessesPerPage);
        return () => window.removeEventListener('resize', updateBusinessesPerPage);
    }, []);

    // Fetch featured businesses using React Query
    const { data, isLoading, error } = useQuery({
        queryKey: ['featured-businesses', selectedLocation?.id, selectedLocation?.type, selectedCity?.id],
        queryFn: () => businessService.getFeaturedBusinesses({
            limit: 8,
            locationId: selectedLocation?.id ?? selectedCity?.id,
            locationType: selectedLocation?.type ?? 'city',
        }),
    });

    const businesses = data?.businesses ?? [];
    const fallbackContext = data?.locationContext;

    // Calculate total pages based on array length and businesses per page
    const totalPages = businesses.length > 0 ? Math.ceil(businesses.length / businessesPerPage) : 0;

    // Move forward by one PAGE (looping back to 0)
    const nextSlide = () => {
        if (totalPages > 0) {
            setCurrentSlide((prev) => (prev + 1) % totalPages);
        }
    };

    // Move backward by one PAGE (looping to end)
    const prevSlide = () => {
        if (totalPages > 0) {
            setCurrentSlide((prev) => (prev - 1 + totalPages) % totalPages);
        }
    };

    // Get the businesses to display for the current slide
    const getVisibleBusinesses = () => {
        if (!businesses.length) return [];
        
        const visibleBusinesses = [];
        // The starting index for the current page
        const startIndex = currentSlide * businessesPerPage;

        for (let i = 0; i < businessesPerPage; i++) {
            // Use modulo to wrap around to the beginning if we run out of items
            const index = (startIndex + i) % businesses.length;
            visibleBusinesses.push(businesses[index]);
        }
        return visibleBusinesses;
    };

    const getPriceLevel = (rating: number) => {
        if (rating >= 4.5) return '$$$';
        if (rating >= 3.5) return '$$';
        return '$';
    };

    if (isLoading) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Loading Featured Listings...</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow-md h-96 animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error || businesses.length === 0) {
        return null;
    }

    const renderBusinessCard = (business: Business, index: number) => {
        // Check if business has active subscription (top placement)
        const hasActiveSubscription = business.promotedUntil && new Date(business.promotedUntil) > new Date();
        const descriptionText = business.description
        ? business.description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
        : '';
        return (
        <div
            key={`${business.id}-${index}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full"
        >
            <div className="relative h-48 group">
                <Link href={`/businesses/${business.slug}`}>
                    <Image
                        src={business.coverImage || business.logo || '/placeholder-business.jpg'}
                        alt={business.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        priority={businesses.indexOf(business) === 0}
                        fetchPriority={businesses.indexOf(business) === 0 ? 'high' : 'auto'}
                        loading={businesses.indexOf(business) === 0 ? 'eager' : 'lazy'}
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

                {/* {business.user && (
                    <div className="absolute bottom-3 left-3">
                        <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                            {business.user.avatar ? (
                                <Image
                                    src={business.user.avatar}
                                    alt={`${business.user.firstName} ${business.user.lastName}`}
                                    width={48}
                                    height={48}
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary text-white font-semibold">
                                    {business.user.firstName?.[0]}{business.user.lastName?.[0]}
                                </div>
                            )}
                        </div>
                    </div>
                )} */}
            </div>

            <div className="p-4">
                <Link href={`/businesses/${business.slug}`}>
                    <h3 className="font-semibold text-md text-gray-900 mb-1 hover:text-primary transition-colors flex items-center gap-2 flex-wrap">
                    {business.name.charAt(0).toUpperCase() + business.name.slice(1)}
                        {business.isVerified && (
                            <svg
                                className="w-5 h-5 text-green-500"
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

                {descriptionText && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2 h-8">
                        {descriptionText}
                    </p>
                )}
                {!descriptionText && (
                    <div className="h-10 mb-3"></div>
                )}

                <div className="space-y-2 mb-3">
                    {business.phone && (
                        <a
                            href={`tel:${business.phone}`}
                            className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Phone className="w-4 h-4" />
                            <span className="truncate">{business.phone}</span>
                        </a>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{business.city.name}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <Link 
                      href={`/${selectedLocation?.slug || selectedCity?.slug || 'riyadh'}/${business.category.slug}`}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                        <div className="relative">
                            🏷️
                        </div>
                        <span className="text-sm font-medium text-gray-700 truncate">
                            {business.category.name}
                        </span>
                    </Link>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {business.totalReviews > 0 && business.averageRating > 0 ? (
                            <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                <span>{business.averageRating.toFixed(1)}</span>
                                <Star className="w-3 h-3 fill-white" />
                                <span className="ml-1 whitespace-nowrap">
                                    {business.totalReviews} {business.totalReviews === 1 ? 'Review' : 'Reviews'}
                                </span>
                            </div>
                        ) : (
                            <span className="text-xs text-gray-600 whitespace-nowrap">
                                {business.totalReviews === 1 ? '1 Review' : `${business.totalReviews || 0} Reviews`}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
        );
    };

    return (
        <section className="py-8 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
                        Trending & Popular
                    </h2>
                    <p className="text-gray-600 text-base md:text-lg">
                        Explore Hot & Popular Business Listings
                    </p>
                    {fallbackContext?.fallbackApplied && fallbackContext?.applied && (
                        <p className="text-sm text-gray-500 mt-2">
                            Showing top listings from {fallbackContext.applied.name}.
                        </p>
                    )}
                </div>

                {/* Carousel Container */}
                <div className="relative mb-10">
                    <div className="overflow-hidden">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {businesses.length > 0 ? (
                                getVisibleBusinesses().map((business, idx) => renderBusinessCard(business, idx))
                            ) : (
                                <div className="col-span-full w-full text-center text-gray-500 py-10">
                                    No businesses available at the moment.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    {businesses.length > 0 && totalPages > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-0 sm:-left-4 md:-left-12 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 text-gray-800 rounded-full p-2 sm:p-3 shadow-lg transition-colors z-10 flex items-center justify-center border border-gray-100"
                                aria-label="Previous businesses"
                            >
                                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-0 sm:-right-4 md:-right-12 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 text-gray-800 rounded-full p-2 sm:p-3 shadow-lg transition-colors z-10 flex items-center justify-center border border-gray-100"
                                aria-label="Next businesses"
                            >
                                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </>
                    )}
                </div>

                {/* Pagination Dots */}
                {businesses.length > 0 && totalPages > 1 && (
                    <div className="flex justify-center gap-2 mb-8">
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    index === currentSlide
                                        ? 'bg-primary w-8'
                                        : 'bg-gray-300 hover:bg-gray-400 w-2'
                                }`}
                                aria-label={`Go to page ${index + 1}`}
                            />
                        ))}
                    </div>
                )}

                <div className="text-center mt-12">
                    <Link
                        href={`/businesses/in/${selectedLocation?.slug || selectedCity?.slug || 'riyadh'}`}
                        className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                    >
                        View All Listings
                    </Link>
                </div>
            </div>
        </section>
    );
}