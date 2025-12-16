'use client';

import Image from 'next/image';
import { Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AdType } from './AdvertisementForm';

interface ImageUploadSectionProps {
  adType: AdType;
  imagePreview: string | null;
  existingImageUrl: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  submitting: boolean;
  error?: string;
  mode: 'create' | 'edit';
}

export default function ImageUploadSection({
  adType,
  imagePreview,
  existingImageUrl,
  onImageChange,
  submitting,
  error,
  mode,
}: ImageUploadSectionProps) {
  const getAspectRatio = () => {
    if (adType === 'CATEGORY' || adType === 'BUSINESS_LISTING' || adType === 'BLOG_LISTING') {
      return 'aspect-[300/350] max-w-[300px] mx-auto';
    }
    if (adType === 'HERO_STRIP') {
      return 'aspect-[1920/48]';
    }
    return 'aspect-[1278/184]';
  };

  const getFormatLabel = () => {
    if (adType === 'CATEGORY' || adType === 'BUSINESS_LISTING' || adType === 'BLOG_LISTING') {
      return 'Sidebar';
    }
    if (adType === 'HOMEPAGE') {
      return 'Homepage Banner';
    }
    if (adType === 'HERO_STRIP') {
      return 'Hero Strip';
    }
    if (adType === 'TOP') {
      return 'Top Banner';
    }
    return 'Footer Banner';
  };

  const getRecommendedSizes = () => {
    if (adType === 'CATEGORY' || adType === 'BUSINESS_LISTING' || adType === 'BLOG_LISTING') {
      return <li><span className="font-semibold">Sidebar Ad:</span> 300 × 350 pixels (vertical format)</li>;
    }
    if (adType === 'TOP' || adType === 'FOOTER' || adType === 'HOMEPAGE') {
      return <li><span className="font-semibold">Horizontal Banner:</span> 1278 × 184 pixels (wide banner)</li>;
    }
    if (adType === 'HERO_STRIP') {
      return <li><span className="font-semibold">Hero Strip:</span> 1920 × 48 pixels (desktop) or 1920 × 64 pixels (mobile) - full width, small height</li>;
    }
    return null;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Advertisement Image
      </h2>
      <div className="mt-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-1">
          Recommended Image Sizes:
        </p>
        <ul className="text-xs text-yellow-800 dark:text-yellow-300 space-y-1 list-disc list-inside">
          {getRecommendedSizes()}
        </ul>
      </div>
      {(imagePreview || existingImageUrl) && (
        <div className="mt-4 relative w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
          <div className={`relative ${getAspectRatio()}`}>
            <Image
              src={imagePreview || existingImageUrl || ''}
              alt="Advertisement preview"
              fill
              className="object-contain"
            />
          </div>
          <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
            {imagePreview ? (mode === 'create' ? 'Preview' : 'New Image Preview') : 'Current Image'} ({getFormatLabel()} format)
          </p>
        </div>
      )}
      <label className="mt-4 flex justify-center items-center w-full px-6 py-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-[#1c4233] dark:hover:border-[#1c4233] transition-colors">
        <div className="text-center">
          <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
          <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {imagePreview || existingImageUrl ? 'Click to change image' : 'Click to upload banner image'}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">JPG, PNG up to 5MB</p>
        </div>
        <Input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="hidden"
          disabled={submitting}
        />
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

