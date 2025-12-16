'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '@/services/subscription.service';
import { Business } from '@/services/business.service';
import axiosInstance from '@/lib/axios';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Search, AlertCircle, CalendarIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AssignSponsorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AssignSponsorDialog({ open, onOpenChange, onSuccess }: AssignSponsorDialogProps) {
  const queryClient = useQueryClient();
  const [businessSearch, setBusinessSearch] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endsAt, setEndsAt] = useState<Date | undefined>();
  const [notes, setNotes] = useState('');

  // Search businesses using admin endpoint - only APPROVED businesses
  const { data: businessesData, isLoading: loadingBusinesses } = useQuery({
    queryKey: ['admin-businesses-search', businessSearch],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/businesses/admin/all', {
        params: {
          search: businessSearch,
          limit: 20,
          page: 1,
          status: 'APPROVED', // Only fetch approved businesses
        },
      });
      return response.data;
    },
    enabled: open && businessSearch.length >= 2,
  });

  const businesses = (businessesData?.data?.businesses || []).filter(
    (business: Business) => business.status === 'APPROVED'
  );

  // Check if selected business has active sponsor subscription
  const { data: existingSubscriptionData } = useQuery({
    queryKey: ['business-sponsor-subscription', selectedBusinessId],
    queryFn: async () => {
      if (!selectedBusinessId) return null;
      try {
        const response = await axiosInstance.get('/api/subscriptions/admin/all', {
          params: {
            businessId: selectedBusinessId,
            status: 'ACTIVE',
            limit: 100,
          },
        });
        const subscriptions = response.data?.data?.subscriptions || [];
        // Find sponsor subscription (has plan with isSponsorPlan = true or metadata.isSponsorSubscription = true)
        return subscriptions.find((sub: any) => 
          sub.plan?.isSponsorPlan === true || 
          sub.metadata?.isSponsorSubscription === true
        ) || null;
      } catch (error) {
        console.error('Error checking active sponsor subscription:', error);
        return null;
      }
    },
    enabled: !!selectedBusinessId && open,
  });

  const existingSubscription = existingSubscriptionData || null;
  const hasActiveSponsorSubscription = existingSubscription && 
    existingSubscription.status === 'ACTIVE' && 
    new Date(existingSubscription.endsAt) > new Date();

  const assignMutation = useMutation({
    mutationFn: (data: any) => subscriptionService.assignSponsorSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['business-sponsor-subscription'] });
      toast.success('Sponsor access assigned successfully');
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign sponsor access');
    },
  });

  const handleClose = () => {
    setBusinessSearch('');
    setSelectedBusinessId('');
    setStartDate(undefined);
    setEndsAt(undefined);
    setNotes('');
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBusinessId) {
      toast.error('Please select a business');
      return;
    }

    // Check if business already has active sponsor subscription
    if (hasActiveSponsorSubscription) {
      toast.error('This business already has an active sponsor subscription. Please wait until it expires before assigning a new one.');
      return;
    }

    // No planId needed - backend will auto-create or find a sponsor plan
    assignMutation.mutate({
      businessId: selectedBusinessId,
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      endsAt: endsAt ? format(endsAt, 'yyyy-MM-dd') : undefined,
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
            {hasActiveSponsorSubscription && selectedBusinessId && (
              <Alert className="mt-2 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-800 dark:text-amber-300">
                  This business already has an active sponsor subscription. It will expire on{' '}
                  {existingSubscription?.endsAt 
                    ? new Date(existingSubscription.endsAt).toLocaleDateString()
                    : 'N/A'
                  }. Please wait until it expires before assigning a new one.
                </AlertDescription>
              </Alert>
            )}
          </div>


          {/* Start Date and End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => {
                      // Disable all previous dates (before today)
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {startDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStartDate(undefined)}
                  className="mt-2 h-6 px-2 text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
              <p className="text-xs text-gray-500 mt-1">Leave empty to start today</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date (Optional)
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endsAt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endsAt ? format(endsAt, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endsAt}
                    onSelect={setEndsAt}
                    disabled={(date) => {
                      // Disable all previous dates (before today or before start date if selected)
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (startDate) {
                        const start = new Date(startDate);
                        start.setHours(0, 0, 0, 0);
                        return date < start;
                      }
                      return date < today;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {endsAt && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEndsAt(undefined)}
                  className="mt-2 h-6 px-2 text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
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
              disabled={!selectedBusinessId || assignMutation.isPending || hasActiveSponsorSubscription}
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

