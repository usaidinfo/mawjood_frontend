'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/services/category.service';
import { Region, Country, City } from '@/services/city.service';
import { LocationType } from './AdvertisementForm';
import LocationDropdowns from './LocationDropdowns';

interface CategoryLocationSectionProps {
  categoryId: string;
  onCategoryIdChange: (value: string) => void;
  locationType: LocationType;
  onLocationTypeChange: (value: LocationType) => void;
  selectedCountryId: string;
  onSelectedCountryIdChange: (value: string) => void;
  selectedRegionId: string;
  onSelectedRegionIdChange: (value: string) => void;
  selectedCityId: string;
  onSelectedCityIdChange: (value: string) => void;
  categorySearch: string;
  onCategorySearchChange: (value: string) => void;
  countrySearch: string;
  onCountrySearchChange: (value: string) => void;
  regionSearch: string;
  onRegionSearchChange: (value: string) => void;
  citySearch: string;
  onCitySearchChange: (value: string) => void;
  filteredCategories: Category[];
  filteredCountries: Country[];
  filteredRegions: Region[];
  filteredCities: City[];
  availableRegions: Region[];
  loadingData: boolean;
  submitting: boolean;
  locationError?: string;
}

export default function CategoryLocationSection({
  categoryId,
  onCategoryIdChange,
  locationType,
  onLocationTypeChange,
  selectedCountryId,
  onSelectedCountryIdChange,
  selectedRegionId,
  onSelectedRegionIdChange,
  selectedCityId,
  onSelectedCityIdChange,
  categorySearch,
  onCategorySearchChange,
  countrySearch,
  onCountrySearchChange,
  regionSearch,
  onRegionSearchChange,
  citySearch,
  onCitySearchChange,
  filteredCategories,
  filteredCountries,
  filteredRegions,
  filteredCities,
  availableRegions,
  loadingData,
  submitting,
  locationError,
}: CategoryLocationSectionProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Category & Location
      </h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Select which category this ad should appear in and where it should be displayed.
      </p>

      <div className="mt-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category (Optional)
          </label>
          <Select
            value={categoryId}
            onValueChange={onCategoryIdChange}
            disabled={loadingData || submitting}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category (optional)" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2 border-b sticky top-0 bg-white dark:bg-slate-800 z-10">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => {
                    onCategorySearchChange(e.target.value);
                    e.stopPropagation();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c4233] bg-white dark:bg-slate-700"
                />
              </div>
              <SelectItem value="none">No category (show in all categories)</SelectItem>
              {filteredCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
              {filteredCategories.length === 0 && categorySearch && (
                <div className="px-2 py-1.5 text-sm text-gray-500">No categories found</div>
              )}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            If no category is selected, the ad will appear in all categories
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Display Location
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onLocationTypeChange('global')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                locationType === 'global'
                  ? 'bg-[#1c4233] text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              Global
            </button>
            <button
              type="button"
              onClick={() => onLocationTypeChange('country')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                locationType === 'country'
                  ? 'bg-[#1c4233] text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              Country
            </button>
            <button
              type="button"
              onClick={() => onLocationTypeChange('region')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                locationType === 'region'
                  ? 'bg-[#1c4233] text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              Region/State
            </button>
            <button
              type="button"
              onClick={() => onLocationTypeChange('city')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                locationType === 'city'
                  ? 'bg-[#1c4233] text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              City
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {locationType === 'global' && 'Advertisement will show globally across all locations'}
            {locationType === 'country' && 'Advertisement will show across the entire country'}
            {locationType === 'region' && 'Advertisement will show across the entire region/state'}
            {locationType === 'city' && 'Advertisement will show only in the selected city'}
          </p>
        </div>

        <LocationDropdowns
          locationType={locationType}
          selectedCountryId={selectedCountryId}
          onSelectedCountryIdChange={onSelectedCountryIdChange}
          selectedRegionId={selectedRegionId}
          onSelectedRegionIdChange={onSelectedRegionIdChange}
          selectedCityId={selectedCityId}
          onSelectedCityIdChange={onSelectedCityIdChange}
          countrySearch={countrySearch}
          onCountrySearchChange={onCountrySearchChange}
          regionSearch={regionSearch}
          onRegionSearchChange={onRegionSearchChange}
          citySearch={citySearch}
          onCitySearchChange={onCitySearchChange}
          filteredCountries={filteredCountries}
          filteredRegions={filteredRegions}
          filteredCities={filteredCities}
          availableRegions={availableRegions}
          loadingData={loadingData}
          submitting={submitting}
        />

        {locationError && (
          <p className="text-sm text-red-600">{locationError}</p>
        )}
      </div>
    </div>
  );
}

