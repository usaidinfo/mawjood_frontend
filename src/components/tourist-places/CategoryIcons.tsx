'use client';

import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';
import Link from 'next/link';
import Image from 'next/image';
import { useCityStore } from '@/store/cityStore';

interface CategoryIconsProps {
  citySlug: string;
}

export default function CategoryIcons({ citySlug }: CategoryIconsProps) {
  const { selectedCity } = useCityStore();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories-for-tourist-place', citySlug],
    queryFn: async () => {
      const response = await categoryService.fetchCategories(1, 50);
      return response.data.categories
        .filter((cat) => (cat._count?.businesses || 0) > 0)
        .slice(0, 10);
    },
    enabled: !!citySlug,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  if (isLoading) {
    return (
      <div className="mb-6 sm:mb-8">
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 px-1">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex flex-col items-center gap-2 sm:gap-3"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gray-200 animate-pulse" />
              <div className="w-16 sm:w-20 h-3 sm:h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) return null;

  return (
    <section className="mb-6 sm:mb-8">
      <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide px-1">
        {categories.map((category: any) => (
          <Link
            key={category.id}
            href={`/${citySlug}/${category.slug}`}
            className="flex-shrink-0 flex flex-col items-center gap-2 sm:gap-3 group"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 group-hover:border-blue-500 transition-colors">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : category.icon ? (
                <div className="w-full h-full flex items-center justify-center p-3 sm:p-4">
                  <Image
                    src={category.icon}
                    alt={category.name}
                    width={40}
                    height={40}
                    className="sm:w-14 sm:h-14 object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg sm:text-xl md:text-2xl">
                  {category.name.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-xs sm:text-sm text-gray-700 text-center max-w-[80px] sm:max-w-[112px] truncate font-medium">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

