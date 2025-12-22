'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCityStore } from '@/store/cityStore';

export default function BusinessesPage() {
  const router = useRouter();
  const { selectedCity, selectedLocation, cities, fetchCities } = useCityStore();

  useEffect(() => {
    // Redirect to location-based URL if location is selected
    const redirectToLocationUrl = async () => {
      if (!cities.length) {
        await fetchCities();
      }

      const location = selectedLocation || selectedCity;
      if (location?.slug) {
        router.replace(`/businesses/in/${location.slug}`);
        return;
      }

      // If no location selected, use default (Riyadh) or first city
      const defaultCity = cities.find(c => c.name.toLowerCase().includes('riyadh')) || cities[0];
      if (defaultCity?.slug) {
        router.replace(`/businesses/in/${defaultCity.slug}`);
      }
    };

    redirectToLocationUrl();
  }, [selectedCity, selectedLocation, cities, router, fetchCities]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}