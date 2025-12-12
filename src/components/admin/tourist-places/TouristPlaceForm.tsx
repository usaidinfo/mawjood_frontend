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
      // Set cityId immediately from touristPlace.city.id
      const placeCityId = touristPlace.city?.id;
      if (placeCityId) {
        setCityId(placeCityId);
      }
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
      setGalleryImages(images.map((url: string) => ({ url })));

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
        
        // Ensure cityId is set if we have touristPlace with city
        if (touristPlace) {
          const placeCityId = touristPlace.city?.id;
          if (placeCityId) {
            // Verify city exists in loaded cities, if not, keep the cityId anyway (will use selectedCityName)
            const cityExists = citiesData.find(c => c.id === placeCityId);
            if (cityExists) {
              setCityId(placeCityId);
            } else if (!cityId) {
              // If cityId is not set yet, set it even if city not found in list
              setCityId(placeCityId);
            }
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

    // Validate required fields with specific messages
    const missingFields: string[] = [];
    if (!title || title.trim() === '') missingFields.push('Title');
    if (!slug || slug.trim() === '') missingFields.push('Slug');
    if (!cityId || cityId.trim() === '') missingFields.push('City');

    if (missingFields.length > 0) {
      toast.error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate attractions if any are added
    const invalidAttractions: string[] = [];
    attractions.forEach((attraction, index) => {
      if (!attraction.name || attraction.name.trim() === '') {
        invalidAttractions.push(`Attraction ${index + 1} - Name is required`);
      }
    });

    if (invalidAttractions.length > 0) {
      toast.error(`Please fix the following:\n${invalidAttractions.join('\n')}`);
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
    
    if (existingImageUrls.length > 0) {
      formData.append('galleryImages', JSON.stringify(existingImageUrls));
    }
    
    newImageFiles.forEach((file) => {
      formData.append('galleryImages', file);
    });
    
    const attractionsWithImages = attractions.map((a, i) => {
      const { imageFile, imagePreview, ...attractionData } = a;
      return {
        ...attractionData,
        image: imageFile ? '' : a.image, 
        order: i,
      };
    });
    
    attractions.forEach((attraction, index) => {
      if (attraction.imageFile) {
        formData.append('attractionImages', attraction.imageFile);
      }
    });
    
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
        selectedCityName={touristPlace?.city?.name}
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
