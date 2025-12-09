'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '@/services/subscription.service';
import { Business } from '@/services/business.service';
import axiosInstance from '@/lib/axios';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface AssignSponsorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AssignSponsorDialog({ open, onOpenChange }: AssignSponsorDialogProps) {
  const queryClient = useQueryClient();
  const [businessSearch, setBusinessSearch] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [notes, setNotes] = useState('');

  // Search businesses using admin endpoint
  const { data: businessesData, isLoading: loadingBusinesses } = useQuery({
    queryKey: ['admin-businesses-search', businessSearch],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/businesses/admin/all', {
        params: {
          search: businessSearch,
          limit: 20,
          page: 1,
        },
      });
      return response.data;
    },
    enabled: open && businessSearch.length >= 2,
  });

  const businesses = businessesData?.data?.businesses || [];

  const assignMutation = useMutation({
    mutationFn: (data: any) => subscriptionService.assignSponsorSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast.success('Sponsor access assigned successfully');
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign sponsor access');
    },
  });

  const handleClose = () => {
    setBusinessSearch('');
    setSelectedBusinessId('');
    setStartDate('');
    setEndsAt('');
    setNotes('');
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBusinessId) {
      toast.error('Please select a business');
      return;
    }

    // No planId needed - backend will auto-create or find a sponsor plan
    assignMutation.mutate({
      businessId: selectedBusinessId,
      startDate: startDate || undefined,
      endsAt: endsAt || undefined,
      notes: notes || undefined,
    });
  };

  useEffect(() => {
    if (!open) {
      handleClose();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>Assign Sponsor Access</DialogTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Grant premium sponsor access to a business without requiring payment. A default sponsor plan will be created automatically if needed.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Business *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                value={businessSearch}
                onChange={(e) => setBusinessSearch(e.target.value)}
                placeholder="Search by business name..."
                className="pl-10"
              />
            </div>
            {businessSearch.length >= 2 && (
              <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                {loadingBusinesses ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  </div>
                ) : businesses.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No businesses found</div>
                ) : (
                  businesses.map((business: Business) => (
                    <button
                      key={business.id}
                      type="button"
                      onClick={() => {
                        setSelectedBusinessId(business.id);
                        setBusinessSearch(business.name);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        selectedBusinessId === business.id ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div className="font-medium text-sm">{business.name}</div>
                      <div className="text-xs text-gray-500">{business.city?.name}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>


          {/* Start Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Leave empty for today"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to start today</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date (Optional)
              </label>
              <Input
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                placeholder="Auto-calculated from plan"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to use plan duration</p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any notes about this sponsor assignment..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-[#1c4233] focus:border-[#1c4233] dark:bg-gray-800"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedBusinessId || assignMutation.isPending}
              className="bg-[#1c4233] hover:bg-[#245240]"
            >
              {assignMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Assign Sponsor Access
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

