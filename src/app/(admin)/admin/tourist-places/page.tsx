'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { touristPlaceService, TouristPlace } from '@/services/touristPlace.service';
import { TouristPlacesTable } from '@/components/admin/tourist-places/TouristPlacesTable';
import { createColumns } from '@/components/admin/tourist-places/columns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TouristPlacesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [touristPlaces, setTouristPlaces] = useState<TouristPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    placeId: string | null;
  }>({ open: false, placeId: null });

  // Fetch tourist places
  useEffect(() => {
    fetchTouristPlaces();
  }, [searchInput]);

  const fetchTouristPlaces = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 100,
      };

      if (searchInput) {
        params.search = searchInput;
      }

      const response = await touristPlaceService.getAllAdmin(params);
      setTouristPlaces(response.data.touristPlaces || []);
    } catch (error: any) {
      console.error('Error fetching tourist places:', error);
      toast.error(error.message || 'Failed to fetch tourist places');
    } finally {
      setLoading(false);
    }
  };

  // Filter tourist places based on status
  const filteredPlaces = useMemo(() => {
    let filtered = [...touristPlaces];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((place) => {
        if (statusFilter === 'active') return place.isActive === true;
        if (statusFilter === 'inactive') return place.isActive === false;
        return true;
      });
    }

    return filtered;
  }, [touristPlaces, statusFilter]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await touristPlaceService.delete(id);
    },
    onSuccess: () => {
      toast.success('Tourist place deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['tourist-places'] });
      fetchTouristPlaces();
      setDeleteDialog({ open: false, placeId: null });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete tourist place');
    },
  });

  const handleDelete = (id: string) => {
    setDeleteDialog({ open: true, placeId: id });
  };

  const confirmDelete = () => {
    if (deleteDialog.placeId) {
      deleteMutation.mutate(deleteDialog.placeId);
    }
  };

  const columns = createColumns({
    onDelete: handleDelete,
    onEdit: (id: string) => {
      router.push(`/admin/tourist-places/edit/${id}`);
    },
    onView: (slug: string) => {
      window.open(`/tourist-places/${slug}`, '_blank');
    },
  });

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tourist Places</h1>
          <p className="text-gray-600 mt-1">Manage tourist places and travel guides</p>
        </div>
        <Button
          onClick={() => router.push('/admin/tourist-places/new')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Tourist Place
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <TouristPlacesTable
          columns={columns}
          data={filteredPlaces}
          onSearchChange={setSearchInput}
          searchValue={searchInput}
          loading={loading}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, placeId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tourist Place</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tourist place? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

