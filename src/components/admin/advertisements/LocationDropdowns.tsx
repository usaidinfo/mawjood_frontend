'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Region, Country, City } from '@/services/city.service';
import { LocationType } from './AdvertisementForm';

interface LocationDropdownsProps {
  locationType: LocationType;
  selectedCountryId: string;
  onSelectedCountryIdChange: (value: string) => void;
  selectedRegionId: string;
  onSelectedRegionIdChange: (value: string) => void;
  selectedCityId: string;
  onSelectedCityIdChange: (value: string) => void;
  countrySearch: string;
  onCountrySearchChange: (value: string) => void;
  regionSearch: string;
  onRegionSearchChange: (value: string) => void;
  citySearch: string;
  onCitySearchChange: (value: string) => void;
  filteredCountries: Country[];
  filteredRegions: Region[];
  filteredCities: City[];
  availableRegions: Region[];
  loadingData: boolean;
  submitting: boolean;
}

export default function LocationDropdowns({
  locationType,
  selectedCountryId,
  onSelectedCountryIdChange,
  selectedRegionId,
  onSelectedRegionIdChange,
  selectedCityId,
  onSelectedCityIdChange,
  countrySearch,
  onCountrySearchChange,
  regionSearch,
  onRegionSearchChange,
  citySearch,
  onCitySearchChange,
  filteredCountries,
  filteredRegions,
  filteredCities,
  availableRegions,
  loadingData,
  submitting,
}: LocationDropdownsProps) {
  const handleCountryChange = (value: string) => {
    onSelectedCountryIdChange(value);
    onSelectedRegionIdChange('');
    onSelectedCityIdChange('');
    onCountrySearchChange('');
  };

  const handleRegionChange = (value: string) => {
    onSelectedRegionIdChange(value);
    onSelectedCityIdChange('');
    onRegionSearchChange('');
  };

  const handleCityChange = (value: string) => {
    onSelectedCityIdChange(value);
    onCitySearchChange('');
  };

  if (locationType === 'country') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Country <span className="text-red-500">*</span>
        </label>
        <Select
          value={selectedCountryId}
          onValueChange={handleCountryChange}
          disabled={loadingData || submitting}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
          <SelectContent>
            <div className="p-2 border-b sticky top-0 bg-white dark:bg-slate-800 z-10">
              <input
                type="text"
                placeholder="Search countries..."
                value={countrySearch}
                onChange={(e) => {
                  onCountrySearchChange(e.target.value);
                  e.stopPropagation();
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c4233] bg-white dark:bg-slate-700"
              />
            </div>
            {filteredCountries.map((country) => (
              <SelectItem key={country.id} value={country.id}>
                {country.name}
              </SelectItem>
            ))}
            {filteredCountries.length === 0 && countrySearch && (
              <div className="px-2 py-1.5 text-sm text-gray-500">No countries found</div>
            )}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (locationType === 'region') {
    return (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Country <span className="text-red-500">*</span>
          </label>
          <Select
            value={selectedCountryId}
            onValueChange={handleCountryChange}
            disabled={loadingData || submitting}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a country first" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2 border-b sticky top-0 bg-white dark:bg-slate-800 z-10">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={countrySearch}
                  onChange={(e) => {
                    onCountrySearchChange(e.target.value);
                    e.stopPropagation();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c4233] bg-white dark:bg-slate-700"
                />
              </div>
              {filteredCountries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
              {filteredCountries.length === 0 && countrySearch && (
                <div className="px-2 py-1.5 text-sm text-gray-500">No countries found</div>
              )}
            </SelectContent>
          </Select>
        </div>
        {selectedCountryId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Region/State <span className="text-red-500">*</span>
            </label>
            <Select
              value={selectedRegionId}
              onValueChange={handleRegionChange}
              disabled={loadingData || submitting || !selectedCountryId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a region/state" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2 border-b sticky top-0 bg-white dark:bg-slate-800 z-10">
                  <input
                    type="text"
                    placeholder="Search regions..."
                    value={regionSearch}
                    onChange={(e) => {
                      onRegionSearchChange(e.target.value);
                      e.stopPropagation();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c4233] bg-white dark:bg-slate-700"
                  />
                </div>
                {filteredRegions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
                {filteredRegions.length === 0 && regionSearch && (
                  <div className="px-2 py-1.5 text-sm text-gray-500">No regions found</div>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
      </>
    );
  }

  if (locationType === 'city') {
    return (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Country <span className="text-red-500">*</span>
          </label>
          <Select
            value={selectedCountryId}
            onValueChange={handleCountryChange}
            disabled={loadingData || submitting}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a country first" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2 border-b sticky top-0 bg-white dark:bg-slate-800 z-10">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={countrySearch}
                  onChange={(e) => {
                    onCountrySearchChange(e.target.value);
                    e.stopPropagation();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c4233] bg-white dark:bg-slate-700"
                />
              </div>
              {filteredCountries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
              {filteredCountries.length === 0 && countrySearch && (
                <div className="px-2 py-1.5 text-sm text-gray-500">No countries found</div>
              )}
            </SelectContent>
          </Select>
        </div>
        {selectedCountryId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Region/State <span className="text-red-500">*</span>
            </label>
            <Select
              value={selectedRegionId}
              onValueChange={handleRegionChange}
              disabled={loadingData || submitting || !selectedCountryId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a region/state" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2 border-b sticky top-0 bg-white dark:bg-slate-800 z-10">
                  <input
                    type="text"
                    placeholder="Search regions..."
                    value={regionSearch}
                    onChange={(e) => {
                      onRegionSearchChange(e.target.value);
                      e.stopPropagation();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c4233] bg-white dark:bg-slate-700"
                  />
                </div>
                {filteredRegions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
                {filteredRegions.length === 0 && regionSearch && (
                  <div className="px-2 py-1.5 text-sm text-gray-500">No regions found</div>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
        {selectedRegionId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <Select
              value={selectedCityId}
              onValueChange={handleCityChange}
              disabled={loadingData || submitting || !selectedRegionId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2 border-b sticky top-0 bg-white dark:bg-slate-800 z-10">
                  <input
                    type="text"
                    placeholder="Search cities..."
                    value={citySearch}
                    onChange={(e) => {
                      onCitySearchChange(e.target.value);
                      e.stopPropagation();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c4233] bg-white dark:bg-slate-700"
                  />
                </div>
                {filteredCities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
                {filteredCities.length === 0 && citySearch && (
                  <div className="px-2 py-1.5 text-sm text-gray-500">No cities found</div>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
      </>
    );
  }

  return null;
}

