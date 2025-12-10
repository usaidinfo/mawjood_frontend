'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TouristPlace } from '@/services/touristPlace.service';
import { cityService, City } from '@/services/city.service';
import { categoryService } from '@/services/category.service';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { BasicInfoSection } from './form-sections/BasicInfoSection';
import { GallerySection } from './form-sections/GallerySection';
import { AboutSection } from './form-sections/AboutSection';
import { BestTimeToVisitSection } from './form-sections/BestTimeToVisitSection';
import { AttractionsSection } from './form-sections/AttractionsSection';
import { BusinessSectionsSection } from './form-sections/BusinessSectionsSection';
import { SEOSection } from './form-sections/SEOSection';

interface TouristPlaceFormProps {
  touristPlace?: TouristPlace | null;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
}

export function TouristPlaceForm({ touristPlace, onSubmit, isSubmitting }: TouristPlaceFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [cityId, setCityId] = useState('');
  const [about, setAbout] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [galleryImages, setGalleryImages] = useState<Array<{ url?: string; file?: File; preview?: string }>>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [attractions, setAttractions] = useState<Array<{
    name: string;
    image: string;
    imageFile?: File;
    imagePreview?: string;
    rating: number;
    description: string;
    openTime: string;
    closeTime: string;
    order: number;
  }>>([]);
  const [businessSections, setBusinessSections] = useState<any[]>([]);
  const [bestTimeToVisit, setBestTimeToVisit] = useState<{
    winter: { label: string; months: string; season: string; points: string[] };
    summer: { label: string; months: string; season: string; points: string[] };
    monsoon: { label: string; months: string; season: string; points: string[] };
  }>({
    winter: {
      label: 'Winter Season (Oct to Mar)',
      months: 'Oct to Mar',
      season: 'Peak Season',
      points: [] as string[],
    },
    summer: {
      label: 'Summer Season (Apr to Jun)',
      months: 'Apr to Jun',
      season: 'Moderate Season',
      points: [] as string[],
    },
    monsoon: {
      label: 'Monsoon Season (Jul to Sept)',
      months: 'Jul to Sept',
      season: 'Off Season',
      points: [] as string[],
    },
  });

  useEffect(() => {
    if (touristPlace) {
      setTitle(touristPlace.title || '');
      setSlug(touristPlace.slug || '');
      setSubtitle(touristPlace.subtitle || '');
      // Ensure cityId is set properly
      if (touristPlace.city?.id) {
        setCityId(touristPlace.city.id);
      }
      // Set about - handle both string and HTML
      const aboutValue = touristPlace.about || '';
      setAbout(aboutValue);
      setMetaTitle(touristPlace.metaTitle || '');
      setMetaDescription(touristPlace.metaDescription || '');
      setIsActive(touristPlace.isActive ?? true);

      const images = Array.isArray(touristPlace.galleryImages)
        ? touristPlace.galleryImages
        : touristPlace.galleryImages
          ? JSON.parse(touristPlace.galleryImages as any)
          : [];
      // Convert existing URLs to gallery image format
      setGalleryImages(images.map((url: string) => ({ url })));

      // Handle attractions - ensure they're in the right format
      const attractionsData = touristPlace.attractions || [];
      setAttractions(attractionsData.map((a: any) => ({
        name: a.name || '',
        image: a.image || '',
        imageFile: undefined,
        imagePreview: undefined,
        rating: a.rating || 0,
        description: a.description || '',
        openTime: a.openTime || '',
        closeTime: a.closeTime || '',
        order: a.order || 0,
      })));
      
      // Handle business sections - ensure categoryIds is an array
      const sectionsData = touristPlace.businessSections || [];
      setBusinessSections(sectionsData.map((s: any) => ({
        title: s.title || '',
        categoryIds: Array.isArray(s.categoryIds) ? s.categoryIds : (typeof s.categoryIds === 'string' ? JSON.parse(s.categoryIds) : []),
        order: s.order || 0,
      })));

      if (touristPlace.bestTimeToVisit) {
        setBestTimeToVisit({
          winter:
            touristPlace.bestTimeToVisit.winter || bestTimeToVisit.winter,
          summer:
            touristPlace.bestTimeToVisit.summer || bestTimeToVisit.summer,
          monsoon:
            touristPlace.bestTimeToVisit.monsoon || bestTimeToVisit.monsoon,
        });
      }
    }
  }, [touristPlace]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [citiesData, categoriesData] = await Promise.all([
          cityService.fetchCities(),
          categoryService.fetchCategories(1, 100),
        ]);
        setCities(citiesData);
        setCategories(categoriesData.data.categories || []);
        
        // If editing and cityId is set but not in cities yet, wait for cities to load
        if (touristPlace && touristPlace.city?.id && citiesData.length > 0) {
          const cityExists = citiesData.find(c => c.id === touristPlace.city.id);
          if (cityExists && !cityId) {
            setCityId(touristPlace.city.id);
          }
        }
      } catch (error: any) {
        toast.error('Failed to load data');
      }
    };
    fetchData();
  }, [touristPlace]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!touristPlace) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !slug || !cityId) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Separate existing URLs from new files
    const existingImageUrls = galleryImages
      .filter(img => img.url && !img.file)
      .map(img => img.url!);
    
    const newImageFiles = galleryImages
      .filter(img => img.file)
      .map(img => img.file!);

    // Create FormData for file upload
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', title);
    formData.append('slug', slug);
    if (subtitle) formData.append('subtitle', subtitle);
    formData.append('cityId', cityId);
    if (about) formData.append('about', about);
    if (metaTitle) formData.append('metaTitle', metaTitle);
    if (metaDescription) formData.append('metaDescription', metaDescription);
    formData.append('isActive', isActive.toString());
    
    // Add existing gallery images as JSON (URLs)
    if (existingImageUrls.length > 0) {
      formData.append('galleryImages', JSON.stringify(existingImageUrls));
    }
    
    // Add new image files
    newImageFiles.forEach((file) => {
      formData.append('galleryImages', file);
    });
    
    // Handle attraction images - separate existing URLs from new files
    const attractionsWithImages = attractions.map((a, i) => {
      const { imageFile, imagePreview, ...attractionData } = a;
      return {
        ...attractionData,
        image: imageFile ? '' : a.image, // If file exists, image will be uploaded separately
        order: i,
      };
    });
    
    // Add attraction image files
    attractions.forEach((attraction, index) => {
      if (attraction.imageFile) {
        formData.append('attractionImages', attraction.imageFile);
      }
    });
    
    // Add JSON fields
    formData.append('bestTimeToVisit', JSON.stringify(bestTimeToVisit));
    formData.append('attractions', JSON.stringify(attractionsWithImages));
    formData.append('businessSections', JSON.stringify(businessSections.map((s, i) => ({
      ...s,
      categoryIds: JSON.stringify(s.categoryIds),
      order: i,
    }))));

    await onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {touristPlace ? 'Edit Tourist Place' : 'Create New Tourist Place'}
          </h1>
          <p className="text-gray-600 mt-1">
            {touristPlace 
              ? 'Update the details below to modify the tourist place guide'
              : 'Fill in the details below to create a new tourist place guide'
            }
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <BasicInfoSection
        title={title}
        slug={slug}
        subtitle={subtitle}
        cityId={cityId}
        isActive={isActive}
        cities={cities}
        onTitleChange={handleTitleChange}
        onSlugChange={setSlug}
        onSubtitleChange={setSubtitle}
        onCityChange={setCityId}
        onActiveChange={setIsActive}
        isEditMode={!!touristPlace}
      />

      <GallerySection images={galleryImages} onImagesChange={setGalleryImages} />

      <AboutSection about={about} onAboutChange={setAbout} />

      <BestTimeToVisitSection
        bestTimeToVisit={bestTimeToVisit}
        onBestTimeToVisitChange={setBestTimeToVisit}
      />

      <AttractionsSection
        attractions={attractions}
        onAttractionsChange={setAttractions}
      />

      <BusinessSectionsSection
        businessSections={businessSections}
        categories={categories}
        onBusinessSectionsChange={setBusinessSections}
      />

      <SEOSection
        metaTitle={metaTitle}
        metaDescription={metaDescription}
        onMetaTitleChange={setMetaTitle}
        onMetaDescriptionChange={setMetaDescription}
      />

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Tourist Place'}
          </Button>
        </div>
      </form>
    </div>
  );
}
