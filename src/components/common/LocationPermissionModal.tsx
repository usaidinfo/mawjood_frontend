'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCityStore } from '@/store/cityStore';
import { cityService, City, Region, Country } from '@/services/city.service';
import { MapPin, Loader2 } from 'lucide-react';

interface GeolocationResponse {
  latitude: number;
  longitude: number;
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
  countryCode?: string;
  localityInfo?: {
    administrative?: Array<{
      name: string;
      adminLevel?: number;
      order?: number;
    }>;
  };
}

export default function LocationPermissionModal() {
  const {
    selectedLocation,
    cities,
    regions,
    countries,
    setSelectedCity,
    setSelectedLocation,
    fetchCities,
    fetchRegions,
    fetchCountries,
  } = useCityStore();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'fetching' | 'matching' | 'success' | 'error'>('idle');
  const [hasChecked, setHasChecked] = useState(false);

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('[LocationModal] Component mounted');
    return () => {
      console.log('[LocationModal] Component unmounted');
    };
  }, []);

  // Fetch cities, regions, and countries on mount if not already loaded
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const initializeData = async () => {
      if (cities.length === 0) {
        await fetchCities();
      }
      if (regions.length === 0) {
        await fetchRegions();
      }
      if (countries.length === 0) {
        await fetchCountries();
      }
    };

    initializeData();
  }, []);

  // Check if we should show the modal (only if location hasn't been selected)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasChecked) return; // Only check once

    // Check for test mode in URL (for debugging)
    const urlParams = new URLSearchParams(window.location.search);
    const forceShow = urlParams.get('showLocationModal') === 'true';

    // Check localStorage directly to see if location was persisted
    const checkPersistedLocation = () => {
      try {
        const stored = localStorage.getItem('city-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed?.state?.selectedLocation;
        }
      } catch (e) {
        console.warn('[LocationModal] Error reading localStorage:', e);
      }
      return null;
    };

    // Wait for store to hydrate (check multiple times)
    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = setInterval(() => {
      attempts++;
      const persistedLocation = checkPersistedLocation();
      
      console.log('[LocationModal] Checking conditions (attempt', attempts, '):', {
        selectedLocation,
        persistedLocation,
        citiesCount: cities.length,
        hasChecked,
        forceShow,
      });
      
      // Show modal if:
      // 1. Force show is enabled, OR
      // 2. No location is selected in store AND no location in localStorage
      const shouldShow = forceShow || (!selectedLocation && !persistedLocation);
      
      if (shouldShow || attempts >= maxAttempts) {
        clearInterval(checkInterval);
        
        if (shouldShow) {
          console.log('[LocationModal] Opening modal');
          setOpen(true);
        } else {
          console.log('[LocationModal] Not showing - location already selected');
        }
        setHasChecked(true);
      }
    }, 200); // Check every 200ms

    // Cleanup
    return () => {
      clearInterval(checkInterval);
    };
  }, [selectedLocation, hasChecked, cities.length]);

  const normalizeName = (name: string): string => {
    return name.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  const matchCity = async (cityName: string): Promise<City | null> => {
    if (!cityName) return null;
    const normalized = normalizeName(cityName);

    // Try exact match first
    let match = cities.find(
      (city) => normalizeName(city.name) === normalized || normalizeName(city.slug) === normalized
    );

    // Try partial match
    if (!match) {
      match = cities.find(
        (city) =>
          normalizeName(city.name).includes(normalized) || normalized.includes(normalizeName(city.name))
      );
    }

    // Try unified search as fallback
    if (!match) {
      try {
        const searchResult = await cityService.unifiedSearch(cityName);
        if (searchResult.cities.length > 0) {
          match = searchResult.cities[0];
        }
      } catch (err) {
        console.warn('Unified search failed:', err);
      }
    }

    return match || null;
  };

  const matchRegion = async (regionName: string): Promise<Region | null> => {
    if (!regionName) return null;
    const normalized = normalizeName(regionName);

    // Try exact match first
    let match = regions.find(
      (region) => normalizeName(region.name) === normalized || normalizeName(region.slug) === normalized
    );

    // Try partial match
    if (!match) {
      match = regions.find(
        (region) =>
          normalizeName(region.name).includes(normalized) || normalized.includes(normalizeName(region.name))
      );
    }

    // Try unified search as fallback
    if (!match) {
      try {
        const searchResult = await cityService.unifiedSearch(regionName);
        if (searchResult.regions.length > 0) {
          match = searchResult.regions[0];
        }
      } catch (err) {
        console.warn('Unified search failed:', err);
      }
    }

    return match || null;
  };

  const matchCountry = (countryName: string): Country | null => {
    if (!countryName) return null;
    const normalized = normalizeName(countryName);

    // Try exact match first
    let match = countries.find(
      (country) => normalizeName(country.name) === normalized || normalizeName(country.slug) === normalized
    );

    // Try partial match
    if (!match) {
      match = countries.find(
        (country) =>
          normalizeName(country.name).includes(normalized) || normalized.includes(normalizeName(country.name))
      );
    }

    return match || null;
  };

  const reverseGeocode = async (latitude: number, longitude: number): Promise<GeolocationResponse> => {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }

    const data = await response.json();
    return data;
  };

  const handleAllowLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setStatus('error');
      return;
    }

    // Ensure we have cities, regions, and countries loaded before matching
    if (cities.length === 0) {
      console.log('[LocationModal] Fetching cities...');
      await fetchCities();
    }
    if (regions.length === 0) {
      console.log('[LocationModal] Fetching regions...');
      await fetchRegions();
    }
    if (countries.length === 0) {
      console.log('[LocationModal] Fetching countries...');
      await fetchCountries();
    }

    setLoading(true);
    setError(null);
    setStatus('requesting');

    try {
      // Request location permission
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 0,
          }
        );
      });

      setStatus('fetching');
      const { latitude, longitude } = position.coords;

      // Reverse geocode to get location details
      const geoData = await reverseGeocode(latitude, longitude);

      setStatus('matching');

      // Try to match city first
      const cityName = geoData.city || geoData.locality;
      if (cityName) {
        const matchedCity = await matchCity(cityName);
        if (matchedCity) {
          setSelectedCity(matchedCity);
          setSelectedLocation({
            type: 'city',
            slug: matchedCity.slug,
            name: matchedCity.name,
            id: matchedCity.id,
            regionId: matchedCity.regionId,
          });
          setStatus('success');
          setTimeout(() => setOpen(false), 1500);
          return;
        }
      }

      // Try to match region/state
      const regionName = geoData.principalSubdivision;
      if (regionName) {
        const matchedRegion = await matchRegion(regionName);
        if (matchedRegion) {
          setSelectedLocation({
            type: 'region',
            slug: matchedRegion.slug,
            name: matchedRegion.name,
            id: matchedRegion.id,
          });
          setStatus('success');
          setTimeout(() => setOpen(false), 1500);
          return;
        }
      }

      // Try to match country
      const countryName = geoData.countryName;
      if (countryName) {
        const matchedCountry = matchCountry(countryName);
        if (matchedCountry) {
          setSelectedLocation({
            type: 'country',
            slug: matchedCountry.slug,
            name: matchedCountry.name,
            id: matchedCountry.id,
          });
          setStatus('success');
          setTimeout(() => setOpen(false), 1500);
          return;
        }
      }

      // If no match found, set error
      setError('Could not find your location in our database. Please select manually.');
      setStatus('error');
    } catch (err: any) {
      console.error('Location error:', err);
      if (err.code === 1) {
        setError('Location permission denied. Please allow location access or select manually.');
      } else if (err.code === 2) {
        setError('Location unavailable. Please try again or select manually.');
      } else if (err.code === 3) {
        setError('Location request timed out. Please try again or select manually.');
      } else {
        setError(err.message || 'Failed to get your location. Please select manually.');
      }
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setOpen(false);
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'requesting':
        return 'Requesting location permission...';
      case 'fetching':
        return 'Getting your location...';
      case 'matching':
        return 'Finding your location in our database...';
      case 'success':
        return 'Location set successfully!';
      case 'error':
        return error || 'An error occurred';
      default:
        return 'We need your location to show you relevant businesses nearby.';
    }
  };

  // Debug: Log when open state changes
  useEffect(() => {
    console.log('[LocationModal] Open state changed:', open);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      console.log('[LocationModal] Dialog onOpenChange called:', newOpen);
      setOpen(newOpen);
    }}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Enable Location Services</DialogTitle>
          <DialogDescription className="text-center">
            {getStatusMessage()}
          </DialogDescription>
        </DialogHeader>

        {status === 'success' && (
          <div className="flex items-center justify-center py-4">
            <div className="text-green-600 text-sm font-medium">✓ Location set successfully!</div>
          </div>
        )}

        {error && status === 'error' && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 mt-4">
          {status !== 'success' && (
            <>
              <Button
                onClick={handleAllowLocation}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Allow Location Access
                  </>
                )}
              </Button>
              <Button
                onClick={handleSkip}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                Skip for Now
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

