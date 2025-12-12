'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Search, X } from 'lucide-react';
import { City } from '@/services/city.service';

interface BasicInfoSectionProps {
  title: string;
  slug: string;
  subtitle: string;
  cityId: string;
  isActive: boolean;
  cities: City[];
  selectedCityName?: string; // Fallback city name from touristPlace
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onActiveChange: (checked: boolean) => void;
  isEditMode?: boolean;
}

export function BasicInfoSection({
  title,
  slug,
  subtitle,
  cityId,
  isActive,
  cities,
  selectedCityName,
  onTitleChange,
  onSlugChange,
  onSubtitleChange,
  onCityChange,
  onActiveChange,
  isEditMode = false,
}: BasicInfoSectionProps) {
  const [citySearch, setCitySearch] = useState('');

  const selectedCity = useMemo(() => {
    const found = cities.find(city => city.id === cityId);
    // If city not found in list but we have cityId and cityName, create a temporary city object
    if (!found && cityId && selectedCityName) {
      return { id: cityId, name: selectedCityName } as City;
    }
    return found;
  }, [cities, cityId, selectedCityName]);

  // Always include selected city in filtered list, even if it doesn't match search
  const filteredCities = useMemo(() => {
    const filtered = cities.filter(city =>
      city.name.toLowerCase().includes(citySearch.toLowerCase())
    );
    
    // If we have a selected city and it's not in the filtered list, add it at the top
    if (selectedCity && cityId && !filtered.find(c => c.id === cityId)) {
      return [selectedCity, ...filtered];
    }
    
    return filtered;
  }, [cities, citySearch, selectedCity, cityId]);

  return (
    <div className="bg-white p-6 rounded-lg border space-y-4">
      <h2 className="text-xl font-semibold">Basic Information</h2>
      
      {/* Title and Slug in one line */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            required
            disabled={isEditMode}
          />
        </div>
      </div>

      {/* Subtitle - small */}
      <div>
        <Label htmlFor="subtitle" className="text-sm text-gray-600">Subtitle</Label>
        <Input
          id="subtitle"
          value={subtitle}
          onChange={(e) => onSubtitleChange(e.target.value)}
          placeholder="Welcome to the Capital City of India"
          className="text-sm"
        />
      </div>

      {/* City and Active in one line */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Select 
            value={cityId || undefined} 
            onValueChange={(value) => {
              onCityChange(value);
              setCitySearch(''); 
            }}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={selectedCity ? selectedCity.name : "Search and select a city"} />
            </SelectTrigger>
            <SelectContent>
              {/* Search Input */}
              <div className="sticky top-0 z-10 bg-white border-b p-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search cities..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="pl-8 pr-8 h-8 text-sm"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                  {citySearch && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCitySearch('');
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Filtered Cities List */}
              <div className="max-h-[200px] overflow-y-auto">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))
                ) : cityId && selectedCityName ? (
                  // Show selected city even if not in filtered list
                  <SelectItem key={cityId} value={cityId}>
                    {selectedCityName}
                  </SelectItem>
                ) : (
                  <div className="px-2 py-6 text-center text-sm text-gray-500">
                    {citySearch ? `No cities found matching "${citySearch}"` : 'No cities available'}
                  </div>
                )}
              </div>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pt-8">
          <Switch id="isActive" checked={isActive} onCheckedChange={onActiveChange} />
          <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
        </div>
      </div>
    </div>
  );
}

