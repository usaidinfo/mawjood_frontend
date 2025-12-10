'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { touristPlaceService } from '@/services/touristPlace.service';
import { TouristPlaceForm } from '@/components/admin/tourist-places/TouristPlaceForm';
import { toast } from 'sonner';

export default function NewTouristPlacePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      await touristPlaceService.create(formData);
      toast.success('Tourist place created successfully!');
      router.push('/admin/tourist-places');
    } catch (error: any) {
      console.error('Error creating tourist place:', error);
      toast.error(error.message || 'Failed to create tourist place');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6">
      <TouristPlaceForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}

