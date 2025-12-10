'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface BusinessSection {
  title: string;
  categoryIds: string[];
  order: number;
}

interface BusinessSectionsSectionProps {
  businessSections: BusinessSection[];
  categories: any[];
  onBusinessSectionsChange: (sections: BusinessSection[]) => void;
}

export function BusinessSectionsSection({
  businessSections,
  categories,
  onBusinessSectionsChange,
}: BusinessSectionsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Ensure there's always exactly one section
  useEffect(() => {
    if (businessSections.length === 0) {
      onBusinessSectionsChange([{ title: '', categoryIds: [], order: 0 }]);
    } else if (businessSections.length > 1) {
      // Keep only the first section
      onBusinessSectionsChange([businessSections[0]]);
    }
  }, [businessSections.length]);

  const section = businessSections[0] || { title: '', categoryIds: [], order: 0 };

  const getFilteredCategories = () => {
    if (!searchQuery) return categories;
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const updateBusinessSection = (field: keyof BusinessSection, value: any) => {
    onBusinessSectionsChange([{
      ...section,
      [field]: value,
    }]);
  };

  const toggleCategory = (categoryId: string) => {
    const currentIds = section.categoryIds || [];
    if (currentIds.includes(categoryId)) {
      updateBusinessSection('categoryIds', currentIds.filter((id: string) => id !== categoryId));
    } else {
      updateBusinessSection('categoryIds', [...currentIds, categoryId]);
    }
  };

  const filteredCategories = getFilteredCategories();
  const selectedCount = section.categoryIds.length;

  return (
    <div className="bg-white p-6 rounded-lg border space-y-4">
      <h2 className="text-xl font-semibold">Business Sections</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Select Categories</Label>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-8"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categories List */}
          <div className="border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto bg-gray-50">
            {filteredCategories.length > 0 ? (
              <div className="space-y-2">
                {filteredCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-white transition-colors"
                    onClick={() => toggleCategory(cat.id)}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      section.categoryIds.includes(cat.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {section.categoryIds.includes(cat.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 flex-1">{cat.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">
                No categories found matching "{searchQuery}"
              </div>
            )}
          </div>
          
          {selectedCount > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {selectedCount} categor{selectedCount === 1 ? 'y' : 'ies'} selected
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

