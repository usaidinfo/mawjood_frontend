'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AdvertisementForm from '@/components/admin/advertisements/AdvertisementForm';

export default function AdvertisementsPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 sm:p-8 lg:p-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Advertisement</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Create a new advertisement banner for category pages, top sidebar, or footer
            </p>
          </div>
          <Button
            type="button"
            onClick={() => router.push('/admin/advertisements/list')}
            variant="outline"
            className="flex items-center gap-2"
          >
            View All Advertisements
          </Button>
        </div>

        <AdvertisementForm mode="create" />
      </div>
    </div>
  );
}
