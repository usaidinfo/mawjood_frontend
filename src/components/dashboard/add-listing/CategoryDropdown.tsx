import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { categoryService, Category } from '@/services/category.service';

interface DropdownCategory {
  id: string;
  name: string;
  slug: string;
  subcategories?: DropdownCategory[];
}

interface CategoryDropdownProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
}

export default function CategoryDropdown({
  value,
  onChange,
  onBlur,
  error,
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search query
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Fetch all categories initially (when dropdown opens, component mounts, or when there's a selected value)
  const { data: initialCategoriesData } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => categoryService.fetchCategories(1, 1000),
    enabled: (isOpen && !debouncedSearchQuery) || !!value, // Fetch when dropdown opens OR when there's a selected value (for display)
    staleTime: 300000, // 5 minutes
  });

  // Fetch categories from API when searching (using debounced query)
  const { data: searchData, isLoading: isSearching } = useQuery({
    queryKey: ['categories', 'search', debouncedSearchQuery],
    queryFn: () => categoryService.fetchCategories(1, 1000, debouncedSearchQuery),
    enabled: isOpen && debouncedSearchQuery.length > 0, // Only fetch when dropdown is open and there's a debounced search query
    staleTime: 30000, // 30 seconds
  });

  // Use search results if searching, otherwise use initial categories
  const categories = debouncedSearchQuery && searchData?.data.categories 
    ? (searchData.data.categories as DropdownCategory[])
    : (initialCategoriesData?.data.categories as DropdownCategory[] || []);

  // Find selected category (could be a subcategory)
  const findSelectedCategory = (cats: DropdownCategory[], id: string): DropdownCategory | undefined => {
    for (const cat of cats) {
      if (cat.id === id) return cat;
      if (cat.subcategories && cat.subcategories.length > 0) {
        const found = findSelectedCategory(cat.subcategories, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const selectedCategory = findSelectedCategory(categories, value);

  // When using API search, auto-expand all categories since they're already filtered
  useEffect(() => {
    if (debouncedSearchQuery && searchData?.data.categories) {
      const newExpanded = new Set<string>();
      const expandAllParents = (cats: DropdownCategory[]) => {
        cats.forEach((cat) => {
          if (cat.subcategories && cat.subcategories.length > 0) {
            newExpanded.add(cat.id);
            expandAllParents(cat.subcategories);
          }
        });
      };
      const catsToExpand = searchData.data.categories as DropdownCategory[];
      expandAllParents(catsToExpand);
      setExpandedCategories(newExpanded);
    } else if (!debouncedSearchQuery) {
      // Reset expanded state when search is cleared
      setExpandedCategories(new Set());
    }
  }, [debouncedSearchQuery, searchData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategorySelect = (categoryId: string) => {
    onChange(categoryId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const renderCategory = (category: DropdownCategory, level: number = 0) => {
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = value === category.id;
    const isParentCategory = hasSubcategories;

    return (
      <div key={category.id}>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => {
              if (hasSubcategories) {
                toggleCategory(category.id);
              } else {
                handleCategorySelect(category.id);
              }
            }}
            className={`flex-1 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
              isSelected ? 'bg-[#1c4233]/10 text-[#1c4233] font-medium' : 'text-gray-900'
            } ${isParentCategory ? 'font-semibold' : ''}`}
            style={{ paddingLeft: `${1 + level * 1.5}rem` }}
          >
            <div className="flex items-center gap-2">
              {hasSubcategories && (
                <ChevronRight
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              )}
              <span>{category.name}</span>
              {isParentCategory && (
                <span className="text-xs text-gray-500 ml-2">
                  ({category.subcategories?.length})
                </span>
              )}
            </div>
          </button>
        </div>

        {category.subcategories && hasSubcategories && isExpanded && (
          <div>
            {category.subcategories.map((subcategory) => renderCategory(subcategory, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={onBlur}
        className={`w-full px-4 py-3 border rounded-lg flex items-center justify-between transition-colors ${
          error
            ? 'border-red-500'
            : 'border-gray-300 focus:ring-2 focus:ring-[#1c4233] focus:border-transparent'
        }`}
      >
        <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
          {selectedCategory ? selectedCategory.name : 'Select Category'}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c4233]"
              />
            </div>
          </div>

          {/* Categories List */}
          <div className="max-h-48 overflow-y-auto">
            {isSearching || (searchQuery && !debouncedSearchQuery) || (!debouncedSearchQuery && !initialCategoriesData) ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">No categories found</div>
            ) : (
              categories.map((category) => renderCategory(category))
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

