'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { advertisementService, Advertisement as ServiceAdvertisement } from '@/services/advertisement.service';
import { AdvertisementsTable } from '@/components/admin/advertisements/AdvertisementsTable';
import { createColumns, Advertisement } from '@/components/admin/advertisements/columns';
import { ViewAdvertisementDialog } from '@/components/admin/advertisements/ViewAdvertisementDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Loader2, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdvertisementsListPage() {
  const router = useRouter();
  const [advertisements, setAdvertisements] = useState<ServiceAdvertisement[]>([]);
  const [allAdvertisements, setAllAdvertisements] = useState<ServiceAdvertisement[]>([]); // For stats
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    adType: '',
    isActive: '',
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    adId: string | null;
  }>({ open: false, adId: null });
  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    advertisement: ServiceAdvertisement | null;
  }>({ open: false, advertisement: null });
  const [error, setError] = useState<{
    stats: string | null;
    list: string | null;
  }>({ stats: null, list: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  // Fetch all advertisements for stats (unfiltered) - only on mount and after mutations
  useEffect(() => {
    const fetchAllAds = async () => {
      try {
        setStatsLoading(true);
        setError((prev) => ({ ...prev, stats: null }));
        const response = await advertisementService.getAllAdvertisements({ page: 1, limit: 1000 });
        
        if (!response || !response.advertisements) {
          throw new Error('Invalid response from server');
        }
        
        setAllAdvertisements(Array.isArray(response.advertisements) ? response.advertisements : []);
      } catch (error: any) {
        console.error('Error fetching all advertisements:', error);
        const errorMessage = error?.message || 'Failed to load advertisement statistics. Please try again.';
        setError((prev) => ({ ...prev, stats: errorMessage }));
        toast.error(errorMessage);
        setAllAdvertisements([]); // Set empty array on error
      } finally {
        setStatsLoading(false);
      }
    };

    fetchAllAds();
  }, []); // Only fetch on mount

  // Fetch advertisements when filters or searchInput change
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setSearchLoading(true);
        setError((prev) => ({ ...prev, list: null }));
        const params: any = {
          page: 1,
          limit: 100,
        };

        if (searchInput) params.search = searchInput;
        if (filters.adType && filters.adType !== 'all') params.adType = filters.adType;
        if (filters.isActive && filters.isActive !== 'all') params.isActive = filters.isActive;

        const response = await advertisementService.getAllAdvertisements(params);
        
        if (!response || !response.advertisements) {
          throw new Error('Invalid response from server');
        }
        
        setAdvertisements(Array.isArray(response.advertisements) ? response.advertisements : []);
      } catch (error: any) {
        console.error('Error fetching advertisements:', error);
        const errorMessage = error?.message || 'Failed to fetch advertisements. Please try again.';
        setError((prev) => ({ ...prev, list: errorMessage }));
        toast.error(errorMessage);
        setAdvertisements([]); // Set empty array on error
      } finally {
        setSearchLoading(false);
      }
    };

    fetchAds();
  }, [searchInput, filters.adType, filters.isActive]);

  const refetchAll = useCallback(async () => {
    try {
      setError({ stats: null, list: null });
      
      // Refetch all for stats
      try {
        const allResponse = await advertisementService.getAllAdvertisements({ page: 1, limit: 1000 });
        if (!allResponse || !allResponse.advertisements) {
          throw new Error('Invalid response from server');
        }
        setAllAdvertisements(Array.isArray(allResponse.advertisements) ? allResponse.advertisements : []);
      } catch (error: any) {
        console.error('Error refetching stats:', error);
        setError((prev) => ({ ...prev, stats: error?.message || 'Failed to refresh statistics' }));
      }
      
      // Refetch filtered
      try {
        const params: any = { page: 1, limit: 100 };
        if (searchInput) params.search = searchInput;
        if (filters.adType && filters.adType !== 'all') params.adType = filters.adType;
        if (filters.isActive && filters.isActive !== 'all') params.isActive = filters.isActive;
        
        const response = await advertisementService.getAllAdvertisements(params);
        if (!response || !response.advertisements) {
          throw new Error('Invalid response from server');
        }
        setAdvertisements(Array.isArray(response.advertisements) ? response.advertisements : []);
      } catch (error: any) {
        console.error('Error refetching list:', error);
        setError((prev) => ({ ...prev, list: error?.message || 'Failed to refresh advertisements list' }));
      }
    } catch (error: any) {
      console.error('Error in refetchAll:', error);
      toast.error('Failed to refresh data. Please try again.');
    }
  }, [searchInput, filters.adType, filters.isActive]);

  const handleToggleActive = async (adId: string, isActive: boolean) => {
    if (!adId) {
      toast.error('Invalid advertisement ID');
      return;
    }

    try {
      setToggleLoading(adId);
      await advertisementService.toggleAdvertisementStatus(adId, isActive);
      toast.success(`Advertisement ${isActive ? 'activated' : 'deactivated'} successfully`);
      await refetchAll();
    } catch (error: any) {
      console.error('Error toggling advertisement status:', error);
      const errorMessage = error?.message || 'Failed to update advertisement status. Please try again.';
      toast.error(errorMessage);
      // Don't update state on error - keep the previous state
    } finally {
      setToggleLoading(null);
    }
  };

  const handleDeleteAd = async () => {
    if (!deleteDialog.adId) {
      toast.error('No advertisement selected for deletion');
      setDeleteDialog({ open: false, adId: null });
      return;
    }

    try {
      setDeleteLoading(true);
      await advertisementService.deleteAdvertisement(deleteDialog.adId);
      toast.success('Advertisement deleted successfully');
      setDeleteDialog({ open: false, adId: null });
      await refetchAll();
    } catch (error: any) {
      console.error('Error deleting advertisement:', error);
      const errorMessage = error?.message || 'Failed to delete advertisement. Please try again.';
      toast.error(errorMessage);
      // Keep dialog open on error so user can retry
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleView = (ad: ServiceAdvertisement) => {
    if (!ad || !ad.id) {
      toast.error('Invalid advertisement data');
      return;
    }
    setViewDialog({ open: true, advertisement: ad });
  };

  const handleEdit = (adId: string) => {
    if (!adId) {
      toast.error('Invalid advertisement ID');
      return;
    }
    try {
      router.push(`/admin/advertisements/edit/${adId}`);
    } catch (error: any) {
      console.error('Error navigating to edit page:', error);
      toast.error('Failed to navigate to edit page. Please try again.');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleAdTypeFilter = (value: string) => {
    setFilters((prev) => ({ ...prev, adType: value }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters((prev) => ({ ...prev, isActive: value }));
  };

  const columns = createColumns(
    handleView as (ad: Advertisement) => void,
    handleEdit,
    (adId) => setDeleteDialog({ open: true, adId }),
    handleToggleActive
  );

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1c4233]" />
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advertisements Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all advertisements, banners, and promotional content
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/advertisements')}
          className="bg-[#1c4233] hover:bg-[#1c4233]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Advertisement
        </Button>
      </div>

      {/* Error Alert for Stats */}
      {error.stats && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Statistics</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error.stats}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setStatsLoading(true);
                setError((prev) => ({ ...prev, stats: null }));
                try {
                  const response = await advertisementService.getAllAdvertisements({ page: 1, limit: 1000 });
                  if (response && response.advertisements) {
                    setAllAdvertisements(Array.isArray(response.advertisements) ? response.advertisements : []);
                  }
                } catch (error: any) {
                  setError((prev) => ({ ...prev, stats: error?.message || 'Failed to load statistics' }));
                } finally {
                  setStatsLoading(false);
                }
              }}
              className="ml-4"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1c4233] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Advertisements</p>
          <p className="text-3xl font-bold mt-1">
            {statsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin inline" />
            ) : error.stats ? (
              '—'
            ) : (
              allAdvertisements.length
            )}
          </p>
        </div>
        <div className="bg-[#245240] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Active</p>
          <p className="text-3xl font-bold mt-1">
            {statsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin inline" />
            ) : error.stats ? (
              '—'
            ) : (
              allAdvertisements.filter((ad) => ad?.isActive).length
            )}
          </p>
        </div>
        <div className="bg-[#2d624d] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Homepage Ads</p>
          <p className="text-3xl font-bold mt-1">
            {statsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin inline" />
            ) : error.stats ? (
              '—'
            ) : (
              allAdvertisements.filter((ad) => ad?.adType === 'HOMEPAGE').length
            )}
          </p>
        </div>
        <div className="bg-[#36725a] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Category Ads</p>
          <p className="text-3xl font-bold mt-1">
            {statsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin inline" />
            ) : error.stats ? (
              '—'
            ) : (
              allAdvertisements.filter((ad) => ad?.adType === 'CATEGORY').length
            )}
          </p>
        </div>
      </div>

      {/* Error Alert for List */}
      {error.list && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Advertisements</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error.list}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setSearchLoading(true);
                setError((prev) => ({ ...prev, list: null }));
                try {
                  const params: any = { page: 1, limit: 100 };
                  if (searchInput) params.search = searchInput;
                  if (filters.adType && filters.adType !== 'all') params.adType = filters.adType;
                  if (filters.isActive && filters.isActive !== 'all') params.isActive = filters.isActive;
                  const response = await advertisementService.getAllAdvertisements(params);
                  if (response && response.advertisements) {
                    setAdvertisements(Array.isArray(response.advertisements) ? response.advertisements : []);
                  }
                } catch (error: any) {
                  setError((prev) => ({ ...prev, list: error?.message || 'Failed to load advertisements' }));
                } finally {
                  setSearchLoading(false);
                }
              }}
              className="ml-4"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Advertisements Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <AdvertisementsTable
          columns={columns}
          data={advertisements as Advertisement[]}
          onSearchChange={handleSearchChange}
          onAdTypeFilter={handleAdTypeFilter}
          onStatusFilter={handleStatusFilter}
          loading={searchLoading}
        />
      </div>

      {/* View Dialog */}
      <ViewAdvertisementDialog
        open={viewDialog.open}
        onOpenChange={(open) => setViewDialog({ open, advertisement: null })}
        advertisement={viewDialog.advertisement}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, adId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the advertisement
              and remove it from all pages where it's displayed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAd}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

