'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { advertisementService, Advertisement } from '@/services/advertisement.service';
import { useCityStore } from '@/store/cityStore';

export default function HeroStripAd() {
  const { selectedLocation, selectedCity } = useCityStore();

  // Fetch hero strip ad
  const { data: ad, isLoading } = useQuery<Advertisement | null>({
    queryKey: ['advertisements', 'HERO_STRIP', selectedLocation?.id, selectedCity?.id],
    queryFn: async (): Promise<Advertisement | null> => {
      try {
        const locationId = selectedLocation?.id || selectedCity?.id;
        const locationType = selectedLocation?.type || 'city';
        
        const advertisement = await advertisementService.getDisplayAdvertisement({
          locationId,
          locationType: locationType as 'city' | 'region' | 'country',
          adType: 'HERO_STRIP' as const,
        });
        return advertisement;
      } catch (error) {
        console.error('Error fetching hero strip advertisement:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  if (!ad) {
    return null;
  }

  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="max-w-full mx-auto">
        <Link
          href={ad.targetUrl || '#'}
          target={ad.openInNewTab !== false ? '_blank' : '_self'}
          rel={ad.openInNewTab !== false ? 'noopener noreferrer' : undefined}
          className="block w-full h-16 md:h-12 relative overflow-hidden hover:opacity-90 transition-opacity"
        >
          <Image
            src={ad.imageUrl}
            alt={ad.title || 'Advertisement'}
            fill
            className="object-cover"
            priority
          />
        </Link>
      </div>
    </div>
  );
}

