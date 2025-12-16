'use client';

import { AdType } from './AdvertisementForm';

interface AdTypeSelectorProps {
  adType: AdType;
  onAdTypeChange: (adType: AdType) => void;
}

export default function AdTypeSelector({ adType, onAdTypeChange }: AdTypeSelectorProps) {
  const adTypes: { value: AdType; label: string }[] = [
    { value: 'CATEGORY', label: 'Category Sidebar' },
    { value: 'BUSINESS_LISTING', label: 'Business Listing' },
    { value: 'BLOG_LISTING', label: 'Blog Listing' },
    { value: 'HOMEPAGE', label: 'Homepage' },
    { value: 'HERO_STRIP', label: 'Hero Strip' },
    { value: 'TOP', label: 'Top Banner' },
    { value: 'FOOTER', label: 'Footer Banner' },
  ];

  const getAdTypeDescription = (type: AdType) => {
    switch (type) {
      case 'CATEGORY':
        return {
          title: '📍 Category Sidebar (Right Sidebar on Category Pages)',
          description: 'Displays in the right sidebar on category listing pages. Vertical/square format recommended (300×350px).',
        };
      case 'BUSINESS_LISTING':
        return {
          title: '📍 Business Listing Sidebar (Right Sidebar on /businesses)',
          description: 'Displays in the right sidebar on the businesses listing page (/businesses). Vertical format recommended (300×350px). No category/location targeting needed.',
        };
      case 'BLOG_LISTING':
        return {
          title: '📍 Blog Listing Sidebar (Right Sidebar on Blog Listing)',
          description: 'Displays in the right sidebar on blog listing pages. Vertical format recommended (300×350px). No category/location targeting needed.',
        };
      case 'HOMEPAGE':
        return {
          title: '📍 Homepage Banner (Top of Homepage)',
          description: 'Displays as a prominent banner on the homepage. Horizontal format recommended (1278×184px). No category/location targeting needed.',
        };
      case 'HERO_STRIP':
        return {
          title: '📍 Hero Strip (Small Strip Above Hero Section)',
          description: 'Displays as a small horizontal strip above the hero section on the homepage. Full width, small height format recommended (1920×48px for desktop, 1920×64px for mobile). No category/location targeting needed.',
        };
      case 'TOP':
        return {
          title: '📍 Top Banner (Top of Pages)',
          description: 'Displays at the top of pages as a horizontal banner. Supports multiple ads with auto-rotation (1278×184px).',
        };
      case 'FOOTER':
        return {
          title: '📍 Footer Banner (Bottom of Pages)',
          description: 'Displays at the bottom of pages as a horizontal banner (1278×184px).',
        };
      default:
        return { title: '', description: '' };
    }
  };

  const description = getAdTypeDescription(adType);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Advertisement Location
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {adTypes.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onAdTypeChange(type.value)}
            className={`px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
              adType === type.value
                ? 'bg-[#1c4233] text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
      <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
          {description.title}
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          {description.description}
        </p>
      </div>
    </div>
  );
}

