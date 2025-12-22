import { useState, useEffect, useRef } from 'react';
import { City as CityType } from '@/services/city.service';
import { cityService } from '@/services/city.service';
import { useCityStore } from '@/store/cityStore';

interface UseGeolocationProps {
  cities: CityType[];
  selectedCity: CityType | null;
  selectedLocation: any;
  setSelectedCity: (city: CityType | null) => void;
  isUserSelectionLocked: boolean;
}

export function useGeolocation({
  cities,
  selectedCity,
  selectedLocation,
  setSelectedCity,
  isUserSelectionLocked,
}: UseGeolocationProps) {
  const [geoLoading, setGeoLoading] = useState(false);
  const hasAttempted = useRef(false);
  const { setRequestingLocation, regions, countries, fetchRegions, fetchCountries, setSelectedLocation } = useCityStore();

  useEffect(() => {
    // Don't run if user manually selected a location
    if (isUserSelectionLocked) {
      return;
    }

    // Don't run on server or if no cities
    if (typeof window === 'undefined' || !cities.length) {
      return;
    }

    // Don't run if already attempted
    if (hasAttempted.current) {
      return;
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.log('[useGeolocation] Geolocation not supported');
      return;
    }

    const trySelectDefault = () => {
      const riyadh = cities.find((city) =>
        city.name.toLowerCase().includes('riyadh') || city.name.toLowerCase().includes('الرياض')
      );
      if (riyadh) {
        setSelectedCity(riyadh);
        setSelectedLocation({
          type: 'city',
          slug: riyadh.slug,
          name: riyadh.name,
          id: riyadh.id,
          regionId: riyadh.regionId,
        });
        return;
      }
      if (cities[0]) {
        setSelectedCity(cities[0]);
        setSelectedLocation({
          type: 'city',
          slug: cities[0].slug,
          name: cities[0].name,
          id: cities[0].id,
          regionId: cities[0].regionId,
        });
      }
    };

    const normalizeName = (name: string) => name.toLowerCase().trim().replace(/\s+/g, ' ');

    const matchCity = async (cityName: string): Promise<CityType | null> => {
      if (!cityName) return null;
      const normalized = normalizeName(cityName);

      // Exact match
      let match = cities.find(
        (city) => normalizeName(city.name) === normalized || normalizeName(city.slug) === normalized
      );

      // Partial match
      if (!match) {
        match = cities.find(
          (city) => normalizeName(city.name).includes(normalized) || normalized.includes(normalizeName(city.name))
        );
      }

      // Unified search fallback
      if (!match) {
        try {
          const result = await cityService.unifiedSearch(cityName);
          if (result.cities.length > 0) {
            match = result.cities[0];
          } else if (result.regions.length > 0) {
            match = cities.find((city) => city.region?.id === result.regions[0].id) || undefined;
          }
        } catch (error) {
          console.error('Unified location search error:', error);
        }
      }

      return match || null;
    };

    const matchRegion = async (regionName: string) => {
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
          const result = await cityService.unifiedSearch(regionName);
          if (result.regions.length > 0) {
            match = result.regions[0];
          }
        } catch (err) {
          console.warn('Region search failed:', err);
        }
      }

      return match || null;
    };

    const matchCountry = (countryName: string) => {
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

    const reverseGeocode = async (latitude: number, longitude: number): Promise<any> => {
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        if (response.ok) {
          const data = await response.json();
          return {
            city: data.city || data.locality,
            region: data.principalSubdivision,
            country: data.countryName,
          };
        }
      } catch (error) {
        console.warn('BigDataCloud API failed:', error);
      }

      // Fallback to IP geolocation
      try {
        const ipResponse = await fetch('https://ipapi.co/json/');
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          return {
            city: ipData.city,
            region: ipData.region,
            country: ipData.country_name,
          };
        }
      } catch (error) {
        console.warn('IP geolocation fallback failed:', error);
      }

      return null;
    };

    const detectAndSetLocation = async () => {
      hasAttempted.current = true;
      setGeoLoading(true);
      setRequestingLocation(true);

      // Ensure we have regions and countries loaded
      if (regions.length === 0) await fetchRegions();
      if (countries.length === 0) await fetchCountries();

      console.log('[useGeolocation] Requesting geolocation permission...');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            console.log('[useGeolocation] Permission granted! Getting location...');
            const { latitude, longitude } = position.coords;
            
            // Get location details
            const geoData = await reverseGeocode(latitude, longitude);
            
            if (!geoData) {
              console.warn('[useGeolocation] Could not get location data');
              trySelectDefault();
              setGeoLoading(false);
              setRequestingLocation(false);
              return;
            }

            console.log('[useGeolocation] Location data:', geoData);

            // Try to match city first
            if (geoData.city) {
              const matchedCity = await matchCity(geoData.city);
              if (matchedCity) {
                console.log('[useGeolocation] ✓ Matched city:', matchedCity.name);
                setSelectedCity(matchedCity);
                setSelectedLocation({
                  type: 'city',
                  slug: matchedCity.slug,
                  name: matchedCity.name,
                  id: matchedCity.id,
                  regionId: matchedCity.regionId,
                });
                setGeoLoading(false);
                setRequestingLocation(false);
                return;
              }
            }

            // Try to match region
            if (geoData.region) {
              const matchedRegion = await matchRegion(geoData.region);
              if (matchedRegion) {
                console.log('[useGeolocation] ✓ Matched region:', matchedRegion.name);
                
                // Also try to set a city from this region
                const cityInRegion = cities.find((city) => city.regionId === matchedRegion.id);
                if (cityInRegion) {
                  setSelectedCity(cityInRegion);
                }
                
                setSelectedLocation({
                  type: 'region',
                  slug: matchedRegion.slug,
                  name: matchedRegion.name,
                  id: matchedRegion.id,
                });
                setGeoLoading(false);
                setRequestingLocation(false);
                return;
              }
            }

            // Try to match country
            if (geoData.country) {
              const matchedCountry = matchCountry(geoData.country);
              if (matchedCountry) {
                console.log('[useGeolocation] ✓ Matched country:', matchedCountry.name);
                
                // Try to set a city from this country
                const cityInCountry = cities.find((city) => 
                  city.region?.country?.id === matchedCountry.id
                );
                if (cityInCountry) {
                  setSelectedCity(cityInCountry);
                }
                
                setSelectedLocation({
                  type: 'country',
                  slug: matchedCountry.slug,
                  name: matchedCountry.name,
                  id: matchedCountry.id,
                });
                setGeoLoading(false);
                setRequestingLocation(false);
                return;
              }
            }

            // No match found, use default
            console.warn('[useGeolocation] No match found, using default');
            trySelectDefault();
            setGeoLoading(false);
            setRequestingLocation(false);
          } catch (error) {
            console.error('[useGeolocation] Error processing location:', error);
            trySelectDefault();
            setGeoLoading(false);
            setRequestingLocation(false);
          }
        },
        (error) => {
          console.warn('[useGeolocation] Permission denied or error:', error);
          // Permission denied or error - use default
          trySelectDefault();
          setGeoLoading(false);
          setRequestingLocation(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 0, // Always get fresh location
        }
      );
    };

    // Start detection after a short delay to ensure page is loaded
    const timer = setTimeout(() => {
      detectAndSetLocation();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [cities, isUserSelectionLocked, regions, countries, fetchRegions, fetchCountries, setSelectedCity, setSelectedLocation, setRequestingLocation]);

  return { geoLoading };
}