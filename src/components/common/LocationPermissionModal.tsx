'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCityStore } from '@/store/cityStore';
import { cityService, City, Region, Country } from '@/services/city.service';
import { MapPin, Loader2, CheckCircle2 } from 'lucide-react';

interface GeolocationResponse {
  latitude: number;
  longitude: number;
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
  countryCode?: string;
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
    isRequestingLocation,
    setRequestingLocation,
  } = useCityStore();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'fetching' | 'matching' | 'success' | 'error'>('idle');

  // Show modal when location is being requested
  useEffect(() => {
    if (isRequestingLocation && !selectedLocation) {
      console.log('[LocationModal] Opening modal - requesting location');
      setOpen(true);
      setStatus('idle');
      setError(null);
    } else if (!isRequestingLocation && open) {
      console.log('[LocationModal] Closing modal - request completed');
      // Delay closing to show success message
      if (status === 'success') {
        setTimeout(() => setOpen(false), 1500);
      } else {
        setOpen(false);
      }
    }
  }, [isRequestingLocation, selectedLocation, open, status]);

  // Fetch data on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const initializeData = async () => {
      if (cities.length === 0) await fetchCities();
      if (regions.length === 0) await fetchRegions();
      if (countries.length === 0) await fetchCountries();
    };

    initializeData();
  }, []);

  const normalizeName = (name: string): string => {
    return name.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  const matchCity = async (cityName: string): Promise<City | null> => {
    if (!cityName) return null;
    const normalized = normalizeName(cityName);

    let match = cities.find(
      (city) => normalizeName(city.name) === normalized || normalizeName(city.slug) === normalized
    );

    if (!match) {
      match = cities.find(
        (city) => normalizeName(city.name).includes(normalized) || normalized.includes(normalizeName(city.name))
      );
    }

    if (!match) {
      try {
        const searchResult = await cityService.unifiedSearch(cityName);
        if (searchResult.cities.length > 0) {
          match = searchResult.cities[0];
        }
      } catch (err) {
        console.warn('City search failed:', err);
      }
    }

    return match || null;
  };

  const matchRegion = async (regionName: string): Promise<Region | null> => {
    if (!regionName) return null;
    const normalized = normalizeName(regionName);

    let match = regions.find(
      (region) => normalizeName(region.name) === normalized || normalizeName(region.slug) === normalized
    );

    if (!match) {
      match = regions.find(
        (region) => normalizeName(region.name).includes(normalized) || normalized.includes(normalizeName(region.name))
      );
    }

    if (!match) {
      try {
        const searchResult = await cityService.unifiedSearch(regionName);
        if (searchResult.regions.length > 0) {
          match = searchResult.regions[0];
        }
      } catch (err) {
        console.warn('Region search failed:', err);
      }
    }

    return match || null;
  };

  const matchCountry = (countryName: string): Country | null => {
    if (!countryName) return null;
    const normalized = normalizeName(countryName);

    let match = countries.find(
      (country) => normalizeName(country.name) === normalized || normalizeName(country.slug) === normalized
    );

    if (!match) {
      match = countries.find(
        (country) => normalizeName(country.name).includes(normalized) || normalized.includes(normalizeName(country.name))
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

    return await response.json();
  };

  const handleAllowLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setStatus('error');
      setRequestingLocation(false);
      return;
    }

    setLoading(true);
    setError(null);
    setStatus('requesting');

    // Ensure data is loaded
    if (cities.length === 0) await fetchCities();
    if (regions.length === 0) await fetchRegions();
    if (countries.length === 0) await fetchCountries();

    try {
      console.log('[LocationModal] Requesting geolocation permission...');
      
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

      console.log('[LocationModal] Permission granted, fetching location data...');
      setStatus('fetching');

      const { latitude, longitude } = position.coords;
      const geoData = await reverseGeocode(latitude, longitude);

      console.log('[LocationModal] Location data received:', geoData);
      setStatus('matching');

      // Try to match city first
      const cityName = geoData.city || geoData.locality;
      if (cityName) {
        const matchedCity = await matchCity(cityName);
        if (matchedCity) {
          console.log('[LocationModal] Matched city:', matchedCity.name);
          setSelectedCity(matchedCity);
          setSelectedLocation({
            type: 'city',
            slug: matchedCity.slug,
            name: matchedCity.name,
            id: matchedCity.id,
            regionId: matchedCity.regionId,
          });
          setStatus('success');
          setRequestingLocation(false);
          setTimeout(() => {
            setOpen(false);
            setLoading(false);
          }, 1500);
          return;
        }
      }

      // Try to match region
      const regionName = geoData.principalSubdivision;
      if (regionName) {
        const matchedRegion = await matchRegion(regionName);
        if (matchedRegion) {
          console.log('[LocationModal] Matched region:', matchedRegion.name);
          setSelectedLocation({
            type: 'region',
            slug: matchedRegion.slug,
            name: matchedRegion.name,
            id: matchedRegion.id,
          });
          setStatus('success');
          setRequestingLocation(false);
          setTimeout(() => {
            setOpen(false);
            setLoading(false);
          }, 1500);
          return;
        }
      }

      // Try to match country
      const countryName = geoData.countryName;
      if (countryName) {
        const matchedCountry = matchCountry(countryName);
        if (matchedCountry) {
          console.log('[LocationModal] Matched country:', matchedCountry.name);
          setSelectedLocation({
            type: 'country',
            slug: matchedCountry.slug,
            name: matchedCountry.name,
            id: matchedCountry.id,
          });
          setStatus('success');
          setRequestingLocation(false);
          setTimeout(() => {
            setOpen(false);
            setLoading(false);
          }, 1500);
          return;
        }
      }

      // No match found
      setError('Could not find your location in our database. Please select manually.');
      setStatus('error');
      setRequestingLocation(false);
      setLoading(false);
    } catch (err: any) {
      console.error('[LocationModal] Location error:', err);
      
      if (err.code === 1) {
        setError('Location permission denied. Please select your location manually or enable location access in your browser settings.');
      } else if (err.code === 2) {
        setError('Location unavailable. Please try again or select manually.');
      } else if (err.code === 3) {
        setError('Location request timed out. Please try again or select manually.');
      } else {
        setError(err.message || 'Failed to get your location. Please select manually.');
      }
      
      setStatus('error');
      setRequestingLocation(false);
      setLoading(false);
    }
  };

  const handleSkip = () => {
    console.log('[LocationModal] User skipped location permission');
    setRequestingLocation(false);
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
        return 'Location detected successfully!';
      case 'error':
        return error || 'An error occurred';
      default:
        return 'We need your location to show you relevant businesses nearby.';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10">
            {status === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <MapPin className="w-6 h-6 text-primary" />
            )}
          </div>
          <DialogTitle className="text-center">
            {status === 'success' ? 'Location Set!' : 'Enable Location Services'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {getStatusMessage()}
          </DialogDescription>
        </DialogHeader>

        {error && status === 'error' && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
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
                    {status === 'requesting' && 'Waiting for permission...'}
                    {status === 'fetching' && 'Getting location...'}
                    {status === 'matching' && 'Finding location...'}
                    {!status || status === 'idle' && 'Processing...'}
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