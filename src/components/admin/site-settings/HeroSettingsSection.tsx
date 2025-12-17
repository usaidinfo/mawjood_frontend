'use client';

import { HeroCardSettings, HeroSettings, HeroCarouselItem } from '@/services/settings.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { toast } from 'sonner';
import { categoryService, Category } from '@/services/category.service';

interface HeroSettingsSectionProps {
  value: HeroSettings;
  onChange: (value: HeroSettings) => void;
  onSave: (value: HeroSettings) => Promise<void>;
  isSaving: boolean;
}

const createEmptyCard = (): HeroCardSettings => ({
  id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  title: '',
  buttonText: '',
  image: '',
  slug: '',
});

const createEmptyCarouselItem = (): HeroCarouselItem => ({
  id: `carousel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  image: '',
  slug: '',
  title: '',
});

export function HeroSettingsSection({ value, onChange, onSave, isSaving }: HeroSettingsSectionProps) {
  const hero: HeroSettings = value ?? { title: '', subtitle: '', cards: [], carousel: [] };
  const cards = hero.cards ?? [];
  const carouselItems = hero.carousel ?? [];
  const [imagePreviews, setImagePreviews] = useState<Record<number, string>>({});
  const [carouselImagePreviews, setCarouselImagePreviews] = useState<Record<number, string>>({});
  const [uploadingCarouselImages, setUploadingCarouselImages] = useState<Record<number, boolean>>({});
  const [uploadingCardImages, setUploadingCardImages] = useState<Record<number, boolean>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await categoryService.fetchCategories(1, 1000);
        const allCategories: Category[] = [];
        response.data.categories.forEach((cat: Category) => {
          allCategories.push(cat);
          if (cat.subcategories) {
            allCategories.push(...cat.subcategories);
          }
        });
        setCategories(allCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const updateHeroField = (field: keyof HeroSettings, newValue: HeroSettings[typeof field]) => {
    onChange({ ...hero, [field]: newValue });
  };

  const updateCardField = (
    index: number,
    field: keyof HeroCardSettings,
    newValue: HeroCardSettings[typeof field]
  ) => {
    const nextCards = [...cards];
    nextCards[index] = { ...nextCards[index], [field]: newValue };
    onChange({ ...hero, cards: nextCards });
  };

  const addCard = () => {
    if (cards.length >= 4) {
      toast.error('Maximum 4 hero cards allowed');
      return;
    }
    onChange({ ...hero, cards: [...cards, createEmptyCard()] });
  };

  const removeCard = (index: number) => {
    const nextCards = cards.filter((_, idx) => idx !== index);
    onChange({ ...hero, cards: nextCards });
    const newPreviews = { ...imagePreviews };
    delete newPreviews[index];
    setImagePreviews(newPreviews);
  };

  const handleImageChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCardImages(prev => ({ ...prev, [index]: true }));

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axiosInstance.post(
        API_ENDPOINTS.UPLOAD.IMAGE,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      const imageUrl = response.data?.data?.imageUrl;
      if (!imageUrl) {
        throw new Error('Image URL missing from upload response');
      }

      updateCardField(index, 'image', imageUrl);
      setImagePreviews(prev => ({ ...prev, [index]: imageUrl }));
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast.error(error?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingCardImages(prev => ({ ...prev, [index]: false }));
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[index];
      return newPreviews;
    });
    updateCardField(index, 'image', '');
  };

  // Carousel management functions
  const updateCarouselItem = (
    index: number,
    field: keyof HeroCarouselItem,
    newValue: HeroCarouselItem[typeof field]
  ) => {
    const nextItems = [...carouselItems];
    nextItems[index] = { ...nextItems[index], [field]: newValue };
    onChange({ ...hero, carousel: nextItems });
  };

  const addCarouselItem = () => {
    onChange({ ...hero, carousel: [...carouselItems, createEmptyCarouselItem()] });
  };

  const removeCarouselItem = (index: number) => {
    const nextItems = carouselItems.filter((_, idx) => idx !== index);
    onChange({ ...hero, carousel: nextItems });
    const newPreviews = { ...carouselImagePreviews };
    delete newPreviews[index];
    setCarouselImagePreviews(newPreviews);
  };

  const handleCarouselImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCarouselImages(prev => ({ ...prev, [index]: true }));

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axiosInstance.post(
        API_ENDPOINTS.UPLOAD.IMAGE,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      const imageUrl = response.data?.data?.imageUrl;
      if (!imageUrl) {
        throw new Error('Image URL missing from upload response');
      }

      updateCarouselItem(index, 'image', imageUrl);
      setCarouselImagePreviews(prev => ({ ...prev, [index]: imageUrl }));
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast.error(error?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingCarouselImages(prev => ({ ...prev, [index]: false }));
    }
  };

  const removeCarouselImage = (index: number) => {
    setCarouselImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[index];
      return newPreviews;
    });
    updateCarouselItem(index, 'image', '');
  };

  const handleSave = async () => {
    await onSave({ ...hero, cards, carousel: carouselItems });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Home Hero Section</CardTitle>
          <CardDescription>
            Configure the main hero heading, messaging, and highlight cards shown on the homepage.
          </CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Hero Section'}
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Hero Title</label>
            <Input
              value={hero.title ?? ''}
              onChange={(event) => updateHeroField('title', event.target.value)}
              placeholder="Discover & Connect Locally"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Hero Subtitle</label>
            <Input
              value={hero.subtitle ?? ''}
              onChange={(event) => updateHeroField('subtitle', event.target.value)}
              placeholder="Find trusted businesses, services, and experiences across Saudi Arabia."
            />
          </div>
        </div>

        {/* Hero Carousel Section */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Hero Carousel</h3>
              <p className="text-sm text-gray-500">
                Add promotional images that appear above the hero title. Images will link to category pages.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={addCarouselItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Carousel Item
            </Button>
          </div>

          {carouselItems.length === 0 && (
            <p className="text-sm text-gray-500 mb-4">
              No carousel items configured yet. Add images to create a promotional carousel.
            </p>
          )}

          <Accordion type="multiple" className="w-full">
            {carouselItems.map((item, index) => (
              <AccordionItem key={item.id ?? index} value={`carousel-${index}`} className="border border-gray-200 rounded-lg mb-4 px-4 bg-white">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="text-left">
                      <h4 className="text-base font-semibold">Carousel Item {index + 1}</h4>
                      <p className="text-xs text-gray-500">
                        {item.title || item.slug || 'Configure carousel image and link'}
                      </p>
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeCarouselItem(index);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          e.preventDefault();
                          removeCarouselItem(index);
                        }
                      }}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-3 md:grid-cols-2 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Title (Optional)</label>
                      <Input
                        value={item.title ?? ''}
                        onChange={(event) => updateCarouselItem(index, 'title', event.target.value)}
                        placeholder="Hotels & Travel"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Category *</label>
                      <Select
                        value={item.slug ?? ''}
                        onValueChange={(value) => updateCarouselItem(index, 'slug', value)}
                        disabled={loadingCategories}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingCategories ? (
                            <div className="px-2 py-1.5 text-sm text-gray-500">Loading categories...</div>
                          ) : categories.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-gray-500">No categories available</div>
                          ) : (
                            categories.map((category) => (
                              <SelectItem key={category.id} value={category.slug}>
                                {category.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        The category page this carousel item will link to
                      </p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Carousel Image *</label>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Ideal size: 1500x552
                        </span>
                      </div>
                      
                      {(carouselImagePreviews[index] || item.image) && (
                        <div className="relative w-full aspect-[1500/552] rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-300 mb-2 shadow-sm">
                          <Image
                            src={carouselImagePreviews[index] || item.image || ''}
                            alt="Carousel preview"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 1500px"
                          />
                          <button
                            type="button"
                            onClick={() => removeCarouselImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <label
                        htmlFor={`carousel-image-${index}`}
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1c4233] transition-colors bg-gray-50"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploadingCarouselImages[index] ? (
                            <Loader2 className="w-8 h-8 text-gray-400 mb-2 animate-spin" />
                          ) : (
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          )}
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">
                              {uploadingCarouselImages[index] ? 'Uploading...' : 'Click to upload'}
                            </span> carousel image
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 15MB</p>
                        </div>
                        <input
                          id={`carousel-image-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCarouselImageUpload(index, e)}
                          className="hidden"
                          disabled={uploadingCarouselImages[index]}
                        />
                      </label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Hero Cards</h3>
            <p className="text-xs text-gray-500 mt-1">
              Maximum 4 cards allowed ({cards.length}/4)
            </p>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={addCard}
            disabled={cards.length >= 4}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
        </div>

        {cards.length === 0 && (
          <p className="text-sm text-gray-500">
            No cards configured yet. Add highlight cards to showcase key categories.
          </p>
        )}

        <Accordion type="multiple" className="w-full">
          {cards.map((card, index) => (
            <AccordionItem key={card.id ?? index} value={`card-${index}`} className="border border-gray-200 rounded-lg mb-4 px-4 bg-white">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="text-left">
                    <h4 className="text-base font-semibold">Card {index + 1}</h4>
                    <p className="text-xs text-gray-500">
                      {card.title || 'Configure the category highlight displayed in the hero carousel.'}
                    </p>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      removeCard(index);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        e.preventDefault();
                        removeCard(index);
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-3 md:grid-cols-2 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <Input
                    value={card.title ?? ''}
                    onChange={(event) => updateCardField(index, 'title', event.target.value)}
                    placeholder="Packers & Movers"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Button Text</label>
                  <Input
                    value={card.buttonText ?? ''}
                    onChange={(event) => updateCardField(index, 'buttonText', event.target.value)}
                    placeholder="Get Best Deal"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Category Slug</label>
                  <Input
                    value={card.slug ?? ''}
                    onChange={(event) => updateCardField(index, 'slug', event.target.value)}
                    placeholder="real-estate"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Card Image</label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Ideal size: 1050-1100px × 1600px
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Image Preview - Left Side */}
                    {(imagePreviews[index] || card.image) ? (
                      <div className="relative w-full aspect-[1100/1600] rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-300 shadow-sm">
                        <Image
                          src={imagePreviews[index] || card.image || ''}
                          alt="Card preview"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 550px"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative w-full aspect-[1100/1600] rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <p className="text-sm text-gray-400 text-center">No image preview</p>
                      </div>
                    )}

                    {/* Upload Area - Right Side */}
                    <div>
                      <label
                        htmlFor={`card-image-${index}`}
                        className="flex flex-col items-center justify-center w-full h-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1c4233] transition-colors bg-gray-50"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploadingCardImages[index] ? (
                            <Loader2 className="w-8 h-8 text-gray-400 mb-2 animate-spin" />
                          ) : (
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          )}
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">
                              {uploadingCardImages[index] ? 'Uploading...' : 'Click to upload'}
                            </span> card image
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 15MB</p>
                        </div>
                        <input
                          id={`card-image-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(index, e)}
                          className="hidden"
                          disabled={uploadingCardImages[index]}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}



