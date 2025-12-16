'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { advertisementService } from '@/services/advertisement.service';
import { categoryService, Category } from '@/services/category.service';
import { cityService, Region, Country, City } from '@/services/city.service';
import Image from 'next/image';
import { Loader2, Upload } from 'lucide-react';
import AdTypeSelector from './AdTypeSelector';
import ImageUploadSection from './ImageUploadSection';
import CategoryLocationSection from './CategoryLocationSection';
import BasicFieldsSection from './BasicFieldsSection';

export type AdType = 'CATEGORY' | 'TOP' | 'FOOTER' | 'BUSINESS_LISTING' | 'BLOG_LISTING' | 'HOMEPAGE' | 'HERO_STRIP';
export type LocationType = 'city' | 'region' | 'country' | 'global';

export interface AdvertisementFormData {
  adType: AdType;
  title: string;
  targetUrl: string;
  openInNewTab: boolean;
  categoryId: string;
  locationType: LocationType;
  selectedCityId: string;
  selectedRegionId: string;
  selectedCountryId: string;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  notes: string;
  imageFile: File | null;
  imagePreview: string | null;
  existingImageUrl: string | null;
}

interface AdvertisementFormProps {
  mode: 'create' | 'edit';
  adId?: string;
  initialData?: Partial<AdvertisementFormData>;
  onSubmitSuccess?: () => void;
}

export default function AdvertisementForm({ mode, adId, initialData, onSubmitSuccess }: AdvertisementFormProps) {
  const router = useRouter();

  const [adType, setAdType] = useState<AdType>(initialData?.adType || 'TOP');
  const [title, setTitle] = useState(initialData?.title || '');
  const [targetUrl, setTargetUrl] = useState(initialData?.targetUrl || '');
  const [openInNewTab, setOpenInNewTab] = useState(initialData?.openInNewTab ?? true);
  const [categoryId, setCategoryId] = useState<string>(initialData?.categoryId || 'none');
  const [locationType, setLocationType] = useState<LocationType>(initialData?.locationType || 'global');
  const [selectedCityId, setSelectedCityId] = useState<string>(initialData?.selectedCityId || '');
  const [selectedRegionId, setSelectedRegionId] = useState<string>(initialData?.selectedRegionId || '');
  const [selectedCountryId, setSelectedCountryId] = useState<string>(initialData?.selectedCountryId || '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [startsAt, setStartsAt] = useState<Date | null>(initialData?.startsAt || null);
  const [endsAt, setEndsAt] = useState<Date | null>(initialData?.endsAt || null);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imagePreview || null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(initialData?.existingImageUrl || null);

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && mode === 'edit') {
      if (initialData.adType) setAdType(initialData.adType);
      if (initialData.title !== undefined) setTitle(initialData.title);
      if (initialData.targetUrl !== undefined) setTargetUrl(initialData.targetUrl);
      if (initialData.openInNewTab !== undefined) setOpenInNewTab(initialData.openInNewTab);
      if (initialData.categoryId !== undefined) setCategoryId(initialData.categoryId);
      if (initialData.locationType) setLocationType(initialData.locationType);
      if (initialData.selectedCityId !== undefined) setSelectedCityId(initialData.selectedCityId);
      if (initialData.selectedRegionId !== undefined) setSelectedRegionId(initialData.selectedRegionId);
      if (initialData.selectedCountryId !== undefined) setSelectedCountryId(initialData.selectedCountryId);
      if (initialData.isActive !== undefined) setIsActive(initialData.isActive);
      if (initialData.startsAt !== undefined) setStartsAt(initialData.startsAt);
      if (initialData.endsAt !== undefined) setEndsAt(initialData.endsAt);
      if (initialData.notes !== undefined) setNotes(initialData.notes);
      if (initialData.existingImageUrl !== undefined) setExistingImageUrl(initialData.existingImageUrl);
    }
  }, [initialData, mode]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Search states for dropdowns
  const [categorySearch, setCategorySearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [regionSearch, setRegionSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  // Data for dropdowns
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [availableRegions, setAvailableRegions] = useState<Region[]>([]);
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Filter options based on search
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    const searchLower = categorySearch.toLowerCase();
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchLower) ||
      cat.slug.toLowerCase().includes(searchLower)
    );
  }, [categories, categorySearch]);
  
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    const searchLower = countrySearch.toLowerCase();
    return countries.filter(country => 
      country.name.toLowerCase().includes(searchLower) ||
      country.slug.toLowerCase().includes(searchLower)
    );
  }, [countries, countrySearch]);
  
  const filteredRegions = useMemo(() => {
    if (!regionSearch) return availableRegions;
    const searchLower = regionSearch.toLowerCase();
    return availableRegions.filter(region => 
      region.name.toLowerCase().includes(searchLower) ||
      region.slug.toLowerCase().includes(searchLower)
    );
  }, [availableRegions, regionSearch]);
  
  const filteredCities = useMemo(() => {
    if (!citySearch) return availableCities;
    const searchLower = citySearch.toLowerCase();
    return availableCities.filter(city => 
      city.name.toLowerCase().includes(searchLower) ||
      city.slug.toLowerCase().includes(searchLower)
    );
  }, [availableCities, citySearch]);

  // Fetch categories and countries
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [categoriesData, countriesData] = await Promise.all([
          categoryService.fetchCategories(1, 1000).then((res) => {
            const allCategories: Category[] = [];
            res.data.categories.forEach((cat: Category) => {
              allCategories.push(cat);
              if (cat.subcategories) {
                allCategories.push(...cat.subcategories);
              }
            });
            return allCategories;
          }),
          cityService.fetchCountries(),
        ]);
        setCategories(categoriesData);
        setCountries(countriesData);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Fetch regions when country is selected
  useEffect(() => {
    if (selectedCountryId && (locationType === 'country' || locationType === 'region' || locationType === 'city')) {
      const country = countries.find((c) => c.id === selectedCountryId);
      if (country?.regions) {
        setAvailableRegions(country.regions);
      } else {
        cityService.fetchRegions(selectedCountryId).then(setAvailableRegions).catch(() => setAvailableRegions([]));
      }
    } else {
      setAvailableRegions([]);
    }
  }, [selectedCountryId, countries, locationType]);

  // Fetch cities when region is selected
  useEffect(() => {
    if (selectedRegionId && locationType === 'city') {
      const region = availableRegions.find((r) => r.id === selectedRegionId);
      if (region?.cities) {
        setAvailableCities(region.cities);
      } else {
        cityService.fetchCities().then((allCities) => {
          const filtered = allCities.filter((city) => city.regionId === selectedRegionId);
          setAvailableCities(filtered);
        }).catch(() => setAvailableCities([]));
      }
    } else {
      setAvailableCities([]);
    }
  }, [selectedRegionId, availableRegions, locationType]);

  // Reset location fields when location type changes
  useEffect(() => {
    if (locationType === 'global') {
      setSelectedCityId('');
      setSelectedRegionId('');
      setSelectedCountryId('');
    } else if (locationType === 'country') {
      setSelectedCityId('');
      setSelectedRegionId('');
    } else if (locationType === 'region') {
      setSelectedCityId('');
    }
  }, [locationType]);

  // Clear category and location when switching to ad types that don't need them
  useEffect(() => {
    if (adType === 'HOMEPAGE' || adType === 'BUSINESS_LISTING' || adType === 'BLOG_LISTING' || adType === 'HERO_STRIP') {
      setCategoryId('none');
      setLocationType('global');
      setSelectedCityId('');
      setSelectedRegionId('');
      setSelectedCountryId('');
    }
  }, [adType]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (mode === 'create' && !imageFile) {
      newErrors.image = 'Advertisement image is required';
    }
    if (!targetUrl.trim()) newErrors.targetUrl = 'Redirect URL is required';
    
    // Only validate location for CATEGORY, TOP, and FOOTER ad types
    // HOMEPAGE, BUSINESS_LISTING, BLOG_LISTING, and HERO_STRIP don't need location targeting
    if (adType === 'CATEGORY' || adType === 'TOP' || adType === 'FOOTER') {
      if (locationType === 'city' && !selectedCityId) {
        newErrors.location = 'Please select a city';
      } else if (locationType === 'region' && !selectedRegionId) {
        newErrors.location = 'Please select a region';
      } else if (locationType === 'country' && !selectedCountryId) {
        newErrors.location = 'Please select a country';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('targetUrl', targetUrl.trim());
      formData.append('openInNewTab', String(openInNewTab));
      formData.append('adType', adType);
      formData.append('isActive', String(isActive));
      
      if (startsAt) {
        formData.append('startsAt', startsAt.toISOString());
      }
      if (endsAt) {
        formData.append('endsAt', endsAt.toISOString());
      }
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }
      
      // Only add category and location for CATEGORY, TOP, and FOOTER ad types
      // HOMEPAGE, BUSINESS_LISTING, BLOG_LISTING, and HERO_STRIP don't need targeting
      if (adType === 'CATEGORY' || adType === 'TOP' || adType === 'FOOTER') {
        if (categoryId && categoryId !== 'none') {
          formData.append('categoryId', categoryId);
        }
        
        // Add location based on selected location type
        if (locationType === 'city' && selectedCityId) {
          formData.append('cityId', selectedCityId);
        } else if (locationType === 'region' && selectedRegionId) {
          formData.append('regionId', selectedRegionId);
        } else if (locationType === 'country' && selectedCountryId) {
          formData.append('countryId', selectedCountryId);
        }
        // If global, don't add any location fields
      }
      
      // Only append image if a new one was selected (or required for create)
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (mode === 'create') {
        await advertisementService.createAdvertisement(formData);
        toast.success('Advertisement created successfully');
        if (onSubmitSuccess) {
          onSubmitSuccess();
        } else {
          router.push('/admin');
        }
      } else if (adId) {
        await advertisementService.updateAdvertisement(adId, formData);
        toast.success('Advertisement updated successfully');
        if (onSubmitSuccess) {
          onSubmitSuccess();
        } else {
          router.push('/admin/advertisements/list');
        }
      }
    } catch (error: any) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} advertisement:`, error);
      toast.error(error?.message || `Failed to ${mode === 'create' ? 'create' : 'update'} advertisement`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-10">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-10">
          <AdTypeSelector adType={adType} onAdTypeChange={setAdType} />

          <ImageUploadSection
            adType={adType}
            imagePreview={imagePreview}
            existingImageUrl={existingImageUrl}
            onImageChange={handleImageChange}
            submitting={submitting}
            error={errors.image}
            mode={mode}
          />

          {/* Only show Category & Location for CATEGORY, TOP, and FOOTER ad types */}
          {(adType === 'CATEGORY' || adType === 'TOP' || adType === 'FOOTER') && (
            <CategoryLocationSection
              categoryId={categoryId}
              onCategoryIdChange={(value) => {
                setCategoryId(value);
                setCategorySearch('');
              }}
              locationType={locationType}
              onLocationTypeChange={setLocationType}
              selectedCountryId={selectedCountryId}
              onSelectedCountryIdChange={(value) => {
                setSelectedCountryId(value);
                setSelectedRegionId('');
                setSelectedCityId('');
                setCountrySearch('');
              }}
              selectedRegionId={selectedRegionId}
              onSelectedRegionIdChange={(value) => {
                setSelectedRegionId(value);
                setSelectedCityId('');
                setRegionSearch('');
              }}
              selectedCityId={selectedCityId}
              onSelectedCityIdChange={(value) => {
                setSelectedCityId(value);
                setCitySearch('');
              }}
              categorySearch={categorySearch}
              onCategorySearchChange={setCategorySearch}
              countrySearch={countrySearch}
              onCountrySearchChange={setCountrySearch}
              regionSearch={regionSearch}
              onRegionSearchChange={setRegionSearch}
              citySearch={citySearch}
              onCitySearchChange={setCitySearch}
              filteredCategories={filteredCategories}
              filteredCountries={filteredCountries}
              filteredRegions={filteredRegions}
              filteredCities={filteredCities}
              availableRegions={availableRegions}
              loadingData={loadingData}
              submitting={submitting}
              locationError={errors.location}
            />
          )}
        </div>

        {/* Right Column - 1/3 width */}
        <BasicFieldsSection
          title={title}
          onTitleChange={setTitle}
          targetUrl={targetUrl}
          onTargetUrlChange={setTargetUrl}
          openInNewTab={openInNewTab}
          onOpenInNewTabChange={setOpenInNewTab}
          isActive={isActive}
          onIsActiveChange={setIsActive}
          startsAt={startsAt}
          onStartsAtChange={setStartsAt}
          endsAt={endsAt}
          onEndsAtChange={setEndsAt}
          notes={notes}
          onNotesChange={setNotes}
          submitting={submitting}
          errors={errors}
        />
      </div>

      {/* Submit Button */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
        {mode === 'edit' && (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/advertisements/list')}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={submitting}
          className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-semibold rounded-md text-white bg-[#1c4233] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1c4233] transition-colors"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            mode === 'create' ? 'Create Advertisement' : 'Update Advertisement'
          )}
        </Button>
      </div>
    </form>
  );
}

