'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { advertisementService, Advertisement } from '@/services/advertisement.service';
import { useCityStore } from '@/store/cityStore';

export default function HeeroStripAd() {
  const { selectedLocation, selectedCity } = useCityStore();

  const { data: ad, isLoading } = useQuery<Advertisement | null>({
    queryKey: ['advertisements', 'HERO_STRIP', selectedLocation?.id, selectedCity?.id],
    queryFn: async (): Promise<Advertisement | null> => {
      try {
        const locationId = selectedLocation?.id || selectedCity?.id;
        const locationType = selectedLocation?.type || 'city';

        return await advertisementService.getDisplayAdvertisement({
          locationId,
          locationType: locationType as 'city' | 'region' | 'country',
          adType: 'HERO_STRIP',
        });
      } catch (error) {
        console.error('Hero strip ad fetch failed', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (!ad || isLoading) return null;

  return (
    <div className="w-full mb-2">
      <div className="max-w-full mx-auto">
        <Link
          href={ad.targetUrl || '#'}
          target={ad.openInNewTab !== false ? '_blank' : '_self'}
          rel={ad.openInNewTab !== false ? 'noopener noreferrer' : undefined}
          className="relative block w-full h-18 md:h-48 overflow-hidden rounded-lg group transition-all"
        >
          <Image
            src={ad.imageUrl}
            alt={ad.title || 'Advertisement'}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-101"
            priority
          />

          {/* Soft hover polish */}
          <div className="absolute inset-0 bg-black/0 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
