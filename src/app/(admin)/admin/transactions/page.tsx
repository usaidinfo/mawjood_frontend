'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { paymentService, Payment } from '@/services/payment.service';
import { subscriptionService, BusinessSubscription, SubscriptionPlan } from '@/services/subscription.service';
import { PaymentsTable } from '@/components/admin/transactions/PaymentsTable';
import { SubscriptionsTable } from '@/components/admin/transactions/SubscriptionsTable';
import { createPaymentColumns } from '@/components/admin/transactions/paymentColumns';
import { createSubscriptionColumns } from '@/components/admin/transactions/subscriptionColumns';
import { toast } from 'sonner';
import { Loader2, Receipt, CreditCard, CalendarIcon, X, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import AssignSponsorDialog from '@/components/admin/subscription-plans/AssignSponsorDialog';

type TabType = 'payments' | 'subscriptions';

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<BusinessSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('subscriptions');
  const [isAssignSponsorOpen, setIsAssignSponsorOpen] = useState(false);
  const [paymentSearchInput, setPaymentSearchInput] = useState('');
  const [subscriptionSearchInput, setSubscriptionSearchInput] = useState('');
  const [debouncedPaymentSearch, setDebouncedPaymentSearch] = useState('');
  const [debouncedSubscriptionSearch, setDebouncedSubscriptionSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState<string>('');
  const [subscriptionPlanFilter, setSubscriptionPlanFilter] = useState<string>('');
  const [paymentStartDate, setPaymentStartDate] = useState<Date | undefined>();
  const [paymentEndDate, setPaymentEndDate] = useState<Date | undefined>();
  const [subscriptionStartDate, setSubscriptionStartDate] = useState<Date | undefined>();
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | undefined>();
  const [planSearchQuery, setPlanSearchQuery] = useState('');

  const paymentDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const subscriptionDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch all subscription plans (including sponsor plans)
  const { data: plansData, isLoading: loadingPlans } = useQuery({
    queryKey: ['subscription-plans', 'all'],
    queryFn: async () => {
      const response = await subscriptionService.getSubscriptionPlans({
        page: 1,
        limit: 1000,
        includeSponsor: 'true',
      });
      return response.data.plans || [];
    },
  });

  const plans = plansData || [];

  // Filter plans based on search query
  const filteredPlans = useMemo(() => {
    if (!planSearchQuery.trim()) return plans;
    const query = planSearchQuery.toLowerCase();
    return plans.filter(
      (plan: SubscriptionPlan) =>
        plan.name.toLowerCase().includes(query) ||
        plan.slug.toLowerCase().includes(query) ||
        (plan.description && plan.description.toLowerCase().includes(query))
    );
  }, [plans, planSearchQuery]);

  // Debounce payment search
  useEffect(() => {
    if (paymentDebounceTimer.current) {
      clearTimeout(paymentDebounceTimer.current);
    }

    paymentDebounceTimer.current = setTimeout(() => {
      setDebouncedPaymentSearch(paymentSearchInput);
    }, 500);

    return () => {
      if (paymentDebounceTimer.current) {
        clearTimeout(paymentDebounceTimer.current);
      }
    };
  }, [paymentSearchInput]);

  // Debounce subscription search
  useEffect(() => {
    if (subscriptionDebounceTimer.current) {
      clearTimeout(subscriptionDebounceTimer.current);
    }

    subscriptionDebounceTimer.current = setTimeout(() => {
      setDebouncedSubscriptionSearch(subscriptionSearchInput);
    }, 500);

    return () => {
      if (subscriptionDebounceTimer.current) {
        clearTimeout(subscriptionDebounceTimer.current);
      }
    };
  }, [subscriptionSearchInput]);

  // Fetch both payments and subscriptions on initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchPayments(),
          fetchSubscriptions(),
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch payments when filters change (only if on payments tab)
  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments();
    }
  }, [activeTab, debouncedPaymentSearch, paymentStatusFilter, paymentStartDate, paymentEndDate]);

  // Fetch subscriptions when filters change (only if on subscriptions tab)
  useEffect(() => {
    if (activeTab === 'subscriptions') {
      fetchSubscriptions();
    }
  }, [activeTab, debouncedSubscriptionSearch, subscriptionStatusFilter, subscriptionPlanFilter, subscriptionStartDate, subscriptionEndDate]);

  const fetchPayments = async () => {
    try {
      const params: any = {
        page: 1,
        limit: 100,
      };

      if (paymentStatusFilter) {
        params.status = paymentStatusFilter;
      }

      if (paymentStartDate) {
        params.startDate = format(paymentStartDate, 'yyyy-MM-dd');
      }

      if (paymentEndDate) {
        params.endDate = format(paymentEndDate, 'yyyy-MM-dd');
      }

      const response = await adminService.getAllPayments(params);
      let filteredPayments = response.data.payments || [];

      // Client-side search filtering
      if (debouncedPaymentSearch) {
        const searchLower = debouncedPaymentSearch.toLowerCase();
        filteredPayments = filteredPayments.filter(
          (payment: Payment) =>
            payment.business?.name?.toLowerCase().includes(searchLower) ||
            payment.user?.email?.toLowerCase().includes(searchLower) ||
            payment.transactionId?.toLowerCase().includes(searchLower) ||
            `${payment.user?.firstName} ${payment.user?.lastName}`.toLowerCase().includes(searchLower)
        );
      }

      setPayments(filteredPayments);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast.error(error.message || 'Failed to fetch payments');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const params: any = {
        page: 1,
        limit: 100,
      };

      if (subscriptionStatusFilter) {
        params.status = subscriptionStatusFilter;
      }

      if (subscriptionPlanFilter) {
        params.planId = subscriptionPlanFilter;
      }

      if (debouncedSubscriptionSearch) {
        params.search = debouncedSubscriptionSearch;
      }

      if (subscriptionStartDate) {
        params.startDate = format(subscriptionStartDate, 'yyyy-MM-dd');
      }

      if (subscriptionEndDate) {
        params.endDate = format(subscriptionEndDate, 'yyyy-MM-dd');
      }

      const response = await adminService.getAllSubscriptions(params);
      setSubscriptions(response.data.subscriptions || []);
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      toast.error(error.message || 'Failed to fetch subscriptions');
    }
  };

  const handlePaymentSearchChange = (value: string) => {
    setPaymentSearchInput(value);
  };

  const handleSubscriptionSearchChange = (value: string) => {
    setSubscriptionSearchInput(value);
  };

  const paymentColumns = createPaymentColumns();
  const subscriptionColumns = createSubscriptionColumns();

  const tabs = [
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'payments', label: 'Payments', icon: Receipt },
  ] as const;

  // Sync active tab with URL
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType | null;
    if (tabParam && (tabParam === 'payments' || tabParam === 'subscriptions')) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'subscriptions') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    router.replace(`/admin/transactions?${params.toString()}`, { scroll: false });
  };

  if (loading && payments.length === 0 && subscriptions.length === 0) {
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
          <h1 className="text-3xl font-bold">Transactions Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all payments and subscriptions
          </p>
        </div>
        <Button
          onClick={() => setIsAssignSponsorOpen(true)}
          variant="outline"
          className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-900/20"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Assign Sponsor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1c4233] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Payments</p>
          <p className="text-3xl font-bold mt-1">{payments.length}</p>
        </div>
        <div className="bg-[#245240] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Subscriptions</p>
          <p className="text-3xl font-bold mt-1">{subscriptions.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as TabType)}
                className={`relative py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-[#1c4233] text-[#1c4233] dark:border-green-400 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        {activeTab === 'payments' ? (
          <>
            {/* Payment Filters */}
            <div className="mb-4 flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <Select
                  value={paymentStatusFilter || 'all'}
                  onValueChange={(value) => setPaymentStatusFilter(value === 'all' ? '' : value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !paymentStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {paymentStartDate ? format(paymentStartDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={paymentStartDate}
                      onSelect={setPaymentStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !paymentEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {paymentEndDate ? format(paymentEndDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={paymentEndDate}
                      onSelect={setPaymentEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {(paymentStartDate || paymentEndDate) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setPaymentStartDate(undefined);
                    setPaymentEndDate(undefined);
                  }}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Dates
                </Button>
              )}
            </div>
            <PaymentsTable
              columns={paymentColumns}
              data={payments}
              onSearchChange={handlePaymentSearchChange}
              searchValue={paymentSearchInput}
            />
          </>
        ) : (
          <>
            {/* Subscription Filters */}
            <div className="mb-4 flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <Select
                  value={subscriptionStatusFilter || 'all'}
                  onValueChange={(value) => setSubscriptionStatusFilter(value === 'all' ? '' : value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plan</label>
                <Select 
                  value={subscriptionPlanFilter || 'all'} 
                  onValueChange={(value) => setSubscriptionPlanFilter(value === 'all' ? '' : value)}
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Filter by plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2 border-b sticky top-0 bg-white dark:bg-slate-800 z-10">
                      <Input
                        type="text"
                        placeholder="Search plans..."
                        value={planSearchQuery}
                        onChange={(e) => {
                          setPlanSearchQuery(e.target.value);
                          e.stopPropagation();
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c4233] bg-white dark:bg-slate-700"
                      />
                    </div>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="sponsor">
                      <div className="flex items-center gap-2">
                        <span>Sponsor Plan</span>
                        <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded">
                          Sponsor
                        </span>
                      </div>
                    </SelectItem>
                    {loadingPlans ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">Loading plans...</div>
                    ) : filteredPlans.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">
                        {planSearchQuery ? 'No plans found' : 'No plans available'}
                      </div>
                    ) : (
                      filteredPlans.map((plan: SubscriptionPlan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          <div className="flex items-center gap-2">
                            <span>{plan.name}</span>
                            {plan.isSponsorPlan && (
                              <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded">
                                Sponsor
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !subscriptionStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {subscriptionStartDate ? format(subscriptionStartDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={subscriptionStartDate}
                      onSelect={setSubscriptionStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !subscriptionEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {subscriptionEndDate ? format(subscriptionEndDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={subscriptionEndDate}
                      onSelect={setSubscriptionEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {(subscriptionStartDate || subscriptionEndDate) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubscriptionStartDate(undefined);
                    setSubscriptionEndDate(undefined);
                  }}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Dates
                </Button>
              )}
            </div>
            <SubscriptionsTable
              columns={subscriptionColumns}
              data={subscriptions}
              onSearchChange={handleSubscriptionSearchChange}
              searchValue={subscriptionSearchInput}
              onPlanFilterChange={setSubscriptionPlanFilter}
              selectedPlanId={subscriptionPlanFilter}
            />
          </>
        )}
      </div>

      <AssignSponsorDialog
        open={isAssignSponsorOpen}
        onOpenChange={setIsAssignSponsorOpen}
        onSuccess={() => {
          handleTabChange('subscriptions');
          fetchSubscriptions();
        }}
      />
    </div>
  );
}
