'use client';

import { useState } from 'react';
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
  onTitleChange,
  onSlugChange,
  onSubtitleChange,
  onCityChange,
  onActiveChange,
  isEditMode = false,
}: BasicInfoSectionProps) {
  const [citySearch, setCitySearch] = useState('');

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const selectedCity = cities.find(city => city.id === cityId);

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
            value={cityId} 
            onValueChange={(value) => {
              onCityChange(value);
              setCitySearch(''); // Clear search when city is selected
            }}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Search and select a city">
                {selectedCity ? selectedCity.name : 'Search and select a city'}
              </SelectValue>
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
                ) : (
                  <div className="px-2 py-6 text-center text-sm text-gray-500">
                    No cities found matching "{citySearch}"
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

