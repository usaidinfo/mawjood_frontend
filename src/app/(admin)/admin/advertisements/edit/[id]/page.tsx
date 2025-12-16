'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import AdvertisementForm, { AdvertisementFormData, AdType } from '@/components/admin/advertisements/AdvertisementForm';

interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl?: string | null;
  openInNewTab?: boolean;
  adType: AdType;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  notes?: string | null;
  countryId?: string | null;
  regionId?: string | null;
  cityId?: string | null;
  categoryId?: string | null;
  city?: { 
    id: string; 
    name: string;
    region?: {
      id: string;
      name: string;
      country?: {
        id: string;
        name: string;
      };
    };
  } | null;
  region?: { 
    id: string; 
    name: string;
    country?: {
      id: string;
      name: string;
    };
  } | null;
  country?: { id: string; name: string } | null;
  category?: { id: string; name: string } | null;
}

export default function EditAdvertisementPage() {
  const router = useRouter();
  const params = useParams();
  const adId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<AdvertisementFormData> | null>(null);

  // Fetch advertisement data
  useEffect(() => {
    const fetchAdvertisement = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`${API_ENDPOINTS.ADVERTISEMENTS.BASE}/${adId}`);
        const ad: Advertisement = response.data.data;
        
        // Prepare initial data for form
        const formData: Partial<AdvertisementFormData> = {
          adType: ad.adType,
          title: ad.title,
          targetUrl: ad.targetUrl || '',
          openInNewTab: ad.openInNewTab !== false,
          isActive: ad.isActive,
          notes: ad.notes || '',
          existingImageUrl: ad.imageUrl,
          startsAt: ad.startsAt ? new Date(ad.startsAt) : null,
          endsAt: ad.endsAt ? new Date(ad.endsAt) : null,
          categoryId: ad.categoryId || 'none',
        };
        
        // Set location
        if (ad.cityId) {
          formData.locationType = 'city';
          formData.selectedCityId = ad.cityId;
          if (ad.city?.region) {
            formData.selectedRegionId = ad.city.region.id;
            if (ad.city.region.country) {
              formData.selectedCountryId = ad.city.region.country.id;
            }
          }
        } else if (ad.regionId) {
          formData.locationType = 'region';
          formData.selectedRegionId = ad.regionId;
          if (ad.region?.country) {
            formData.selectedCountryId = ad.region.country.id;
          }
        } else if (ad.countryId) {
          formData.locationType = 'country';
          formData.selectedCountryId = ad.countryId;
        } else {
          formData.locationType = 'global';
        }
        
        setInitialData(formData);
      } catch (error: any) {
        console.error('Error fetching advertisement:', error);
        toast.error('Failed to load advertisement');
        router.push('/admin/advertisements/list');
      } finally {
        setLoading(false);
      }
    };

    if (adId) {
      fetchAdvertisement();
    }
  }, [adId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1c4233]" />
      </div>
    );
  }

  if (!initialData) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 sm:p-8 lg:p-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Advertisement</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Update advertisement details and settings
            </p>
          </div>
          <Button
            type="button"
            onClick={() => router.push('/admin/advertisements/list')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </Button>
        </div>

        <AdvertisementForm mode="edit" adId={adId} initialData={initialData} />
      </div>
    </div>
  );
}
