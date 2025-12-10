'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { touristPlaceService, TouristPlace } from '@/services/touristPlace.service';
import { TouristPlaceForm } from '@/components/admin/tourist-places/TouristPlaceForm';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EditTouristPlacePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: touristPlace, isLoading, error } = useQuery({
    queryKey: ['tourist-place-admin', id],
    queryFn: async () => {
      // Get all places and find by ID
      const response = await touristPlaceService.getAllAdmin({ limit: 1000 });
      const place = response.data.touristPlaces.find((p: TouristPlace) => p.id === id);
      if (!place) throw new Error('Tourist place not found');
      // Get full details by slug
      return await touristPlaceService.getBySlugAdmin(place.slug);
    },
    enabled: !!id,
  });

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      await touristPlaceService.update(id, formData);
      toast.success('Tourist place updated successfully!');
      router.push('/admin/tourist-places');
    } catch (error: any) {
      console.error('Error updating tourist place:', error);
      toast.error(error.message || 'Failed to update tourist place');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !touristPlace) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Tourist Place Not Found</h1>
          <p className="text-gray-600 mb-6">The tourist place you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/admin/tourist-places')}>
            Back to Tourist Places
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6">
      <TouristPlaceForm
        touristPlace={touristPlace}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

