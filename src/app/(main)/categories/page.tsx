'use client';

import { useEffect, useState } from 'react';
import { categoryService, Category } from '@/services/category.service';
import { useCityStore } from '@/store/cityStore';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategoriesPage() {
  const { t } = useTranslation('common');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const { selectedLocation, selectedCity, cities, fetchCities } = useCityStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await categoryService.fetchCategories(currentPage, limit);
        setCategories(response.data.categories);
        setTotalPages(response.data.pagination.totalPages);
        setTotal(response.data.pagination.total);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  useEffect(() => {
    if (!cities.length) {
      fetchCities();
    }
  }, [cities.length, fetchCities]);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const locationSlug =
    selectedLocation?.slug ||
    selectedCity?.slug ||
    cities.find((city) => city.name.toLowerCase().includes('riyadh'))?.slug ||
    cities[0]?.slug ||
    'riyadh';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Search */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Popular Categories
          </h1>
          <div className="relative w-64">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
        </div>

        {/* Compact Categories Grid - 4 columns, icon + text side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {filteredCategories.map((category) => (
            <Link
              key={category.id}
              href={`/${locationSlug}/${category.slug}`}
              className="bg-white rounded-lg p-3 border border-gray-200 hover:border-primary hover:bg-gray-50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                {/* Icon - smaller, compact */}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50 group-hover:bg-primary/10 transition-colors flex-shrink-0">
                  {category.icon ? (
                    <Image
                      src={category.icon}
                      alt={category.name}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-xl">📁</span>
                  )}
                </div>

                {/* Name - compact text */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors truncate">
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No results */}
        {filteredCategories.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories found</p>
          </div>
        )}

        {/* Compact Pagination - only show if more than 20 categories and not searching */}
        {totalPages > 1 && !searchQuery && total > 20 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </button>
            
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        currentPage === pageNum
                          ? 'bg-primary text-white'
                          : 'border hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return <span key={pageNum} className="px-1">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}