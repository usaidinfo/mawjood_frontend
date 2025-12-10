'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { touristPlaceService } from '@/services/touristPlace.service';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { buildOgImages, toAbsoluteUrl } from '@/config/seo.config';
import Gallery from '@/components/tourist-places/Gallery';
import CategoryIcons from '@/components/tourist-places/CategoryIcons';
import BestTimeToVisit from '@/components/tourist-places/BestTimeToVisit';
import PlacesToVisit from '@/components/tourist-places/PlacesToVisit';
import AboutCity from '@/components/tourist-places/AboutCity';
import TopBusinesses from '@/components/tourist-places/TopBusinesses';

export default function TouristPlaceDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: place, isLoading, error } = useQuery({
    queryKey: ['tourist-place', slug],
    queryFn: () => touristPlaceService.getBySlug(slug),
    enabled: !!slug,
  });

  const { absolute: ogImage } = useMemo(
    () => {
      const galleryImages = Array.isArray(place?.galleryImages)
        ? place.galleryImages
        : place?.galleryImages
          ? JSON.parse(place.galleryImages as any)
          : [];
      return buildOgImages(galleryImages[0]);
    },
    [place?.galleryImages]
  );

  const description = useMemo(() => {
    if (!place) return '';
    if (place.metaDescription) return place.metaDescription;
    if (place.about) {
      return place.about.length > 160 ? `${place.about.slice(0, 160)}...` : place.about;
    }
    return '';
  }, [place]);

  // SEO: Add structured data
  useEffect(() => {
    if (!place) return;

    const existing = document.querySelector(
      `script[type="application/ld+json"][data-tourist-place-schema="${place.id}"]`
    );
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-tourist-place-schema', place.id);
    script.textContent = JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'TouristDestination',
        name: place.title,
        description: description || place.about || undefined,
        image: place.galleryImages ? (Array.isArray(place.galleryImages) ? place.galleryImages : JSON.parse(place.galleryImages as any)) : undefined,
        address: {
          '@type': 'PostalAddress',
          addressLocality: place.city.name,
          addressRegion: place.city.region?.name,
          addressCountry: place.city.region?.country?.name,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': toAbsoluteUrl(`/tourist-places/${place.slug}`),
        },
      },
      (_, value) => (value === undefined ? undefined : value)
    );

    document.head.appendChild(script);

    return () => {
      const node = document.querySelector(
        `script[type="application/ld+json"][data-tourist-place-schema="${place.id}"]`
      );
      if (node) node.remove();
    };
  }, [place, description]);

  // Update page title and meta tags
  useEffect(() => {
    if (!place) return;

    document.title = place.metaTitle || `${place.title} - Tourist Guide | Mawjood`;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || place.about || '');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description || place.about || '';
      document.head.appendChild(meta);
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', place.metaTitle || place.title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', description || place.about || '');
    }

    const ogImageTag = document.querySelector('meta[property="og:image"]');
    if (ogImageTag) {
      ogImageTag.setAttribute('content', ogImage);
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', toAbsoluteUrl(`/tourist-places/${place.slug}`));
    }
  }, [place, description, ogImage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 sm:h-80 md:h-96 bg-gray-200 rounded"></div>
            <div className="h-8 sm:h-10 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Tourist Place Not Found</h1>
          <p className="text-gray-600 mb-6">The tourist place you're looking for doesn't exist.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const galleryImages = Array.isArray(place.galleryImages)
    ? place.galleryImages
    : place.galleryImages
      ? JSON.parse(place.galleryImages as any)
      : [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Gallery - First */}
        {galleryImages.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <Gallery images={galleryImages} title={place.title} />
          </div>
        )}

        {/* Header - After Gallery */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {place.title}
          </h1>
          {place.subtitle && (
            <p className="text-base sm:text-lg md:text-xl text-gray-600">{place.subtitle}</p>
          )}
        </div>

        {/* Category Icons */}
        <div className="mb-6 sm:mb-8">
          <CategoryIcons citySlug={place.city.slug} />
        </div>

        {/* Best Time to Visit */}
        <div className="mb-6 sm:mb-8">
          <BestTimeToVisit data={place.bestTimeToVisit} />
        </div>

        {/* Places to Visit */}
        {place.attractions && place.attractions.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <PlacesToVisit attractions={place.attractions} />
          </div>
        )}

        {/* About City */}
        <div className="mb-6 sm:mb-8">
          <AboutCity about={place.about} cityName={place.city.name} />
        </div>

        {/* Top Businesses */}
        {place.businessSections && place.businessSections.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <TopBusinesses
              sections={place.businessSections}
              placeSlug={place.slug}
              citySlug={place.city.slug}
              cityName={place.city.name}
            />
          </div>
        )}
      </div>
    </div>
  );
}

