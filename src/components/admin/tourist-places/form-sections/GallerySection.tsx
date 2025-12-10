'use client';

import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { X, Upload } from 'lucide-react';
import Image from 'next/image';

interface GalleryImage {
  url?: string;
  file?: File;
  preview?: string;
}

interface GallerySectionProps {
  images: GalleryImage[];
  onImagesChange: (images: GalleryImage[]) => void;
}

export function GallerySection({ images, onImagesChange }: GallerySectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages: GalleryImage[] = files.map((file) => {
      const preview = URL.createObjectURL(file);
      return { file, preview };
    });

    onImagesChange([...images, ...newImages]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    // Revoke object URL if it's a preview
    if (imageToRemove.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const getImageSrc = (image: GalleryImage): string => {
    if (image.preview) return image.preview;
    if (image.url) return image.url;
    return '';
  };

  return (
    <div className="bg-white p-6 rounded-lg border space-y-4">
      <h2 className="text-xl font-semibold">Gallery Images</h2>
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
          id="gallery-upload"
        />
        <label
          htmlFor="gallery-upload"
          className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50"
        >
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Click to upload images</p>
            <p className="text-xs text-gray-400 mt-1">Multiple images supported</p>
          </div>
        </label>
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-8 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image 
                  src={getImageSrc(image)} 
                  alt={`Gallery ${index + 1}`} 
                  fill 
                  className="object-cover" 
                  unoptimized 
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

