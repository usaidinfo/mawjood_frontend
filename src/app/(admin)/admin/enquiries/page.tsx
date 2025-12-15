'use client';

import { useEffect, useState } from 'react';
import { enquiryService, Enquiry, EnquiryStatus } from '@/services/enquiry.service';
import { categoryService, Category } from '@/services/category.service';
import { EnquiriesTable } from '@/components/admin/enquiries/EnquiriesTable';
import { createColumns } from '@/components/admin/enquiries/columns';
import { toast } from 'sonner';
import { Loader2, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';

const statusColors: Record<EnquiryStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  CLOSED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const statusIcons: Record<EnquiryStatus, any> = {
  OPEN: AlertCircle,
  IN_PROGRESS: Clock,
  CLOSED: CheckCircle2,
  REJECTED: XCircle,
};

export default function EnquiriesPage() {
  const [allEnquiries, setAllEnquiries] = useState<Enquiry[]>([]); // All enquiries for stats
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]); // Filtered enquiries for table
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await categoryService.fetchCategories(1, 100);
        setCategories(result.data.categories || []);
      } catch (error: any) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch all enquiries on mount for stats
  useEffect(() => {
    fetchAllEnquiries();
  }, []);

  // Fetch filtered enquiries on search/filter change
  useEffect(() => {
    if (!initialLoading) {
      fetchEnquiries();
    }
  }, [searchInput, statusFilter, categoryFilter]);

  const fetchAllEnquiries = async () => {
    try {
      setInitialLoading(true);
      const response = await enquiryService.getAllEnquiries({
        page: 1,
        limit: 1000, // Get all for stats
      });
      setAllEnquiries(response.enquiries || []);
      setEnquiries(response.enquiries || []); // Initially show all
    } catch (error: any) {
      console.error('Error fetching all enquiries:', error);
      toast.error(error.message || 'Failed to fetch enquiries');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchEnquiries = async () => {
    try {
      setSearchLoading(true);
      const params: any = {
        page: 1,
        limit: 100,
      };

      if (searchInput) {
        params.search = searchInput;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (categoryFilter !== 'all') {
        params.categoryId = categoryFilter;
      }

      const response = await enquiryService.getAllEnquiries(params);
      setEnquiries(response.enquiries || []);
    } catch (error: any) {
      console.error('Error fetching enquiries:', error);
      toast.error(error.message || 'Failed to fetch enquiries');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleView = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setViewDialogOpen(true);
  };

  const columns = createColumns(handleView);

  // Calculate stats from ALL enquiries (not filtered)
  const stats = {
    total: allEnquiries.length,
    open: allEnquiries.filter((e) => e.status === EnquiryStatus.OPEN).length,
    inProgress: allEnquiries.filter((e) => e.status === EnquiryStatus.IN_PROGRESS).length,
    closed: allEnquiries.filter((e) => e.status === EnquiryStatus.CLOSED).length,
  };

  if (initialLoading && allEnquiries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1c4233]" />
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Enquiries Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage all business enquiries from users
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1c4233] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Enquiries</p>
          <p className="text-3xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="bg-[#245240] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Open</p>
          <p className="text-3xl font-bold mt-1">{stats.open}</p>
        </div>
        <div className="bg-[#2d624d] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">In Progress</p>
          <p className="text-3xl font-bold mt-1">{stats.inProgress}</p>
        </div>
        <div className="bg-[#36725a] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Closed</p>
          <p className="text-3xl font-bold mt-1">{stats.closed}</p>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <EnquiriesTable
          columns={columns}
          data={enquiries}
          onSearchChange={setSearchInput}
          searchValue={searchInput}
          loading={searchLoading}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          categories={categories}
          onStatusFilterChange={setStatusFilter}
          onCategoryFilterChange={setCategoryFilter}
        />
      </div>

      {/* View Enquiry Dialog */}
      {selectedEnquiry && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Enquiry Details</DialogTitle>
              <DialogDescription>
                Complete details of the enquiry from {selectedEnquiry.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">{selectedEnquiry.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">
                    <a href={`mailto:${selectedEnquiry.email}`} className="text-primary hover:underline">
                      {selectedEnquiry.email}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">
                    <a href={`tel:${selectedEnquiry.phone}`} className="text-primary hover:underline">
                      {selectedEnquiry.phone}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <div className="mt-1">
                    <Badge className={`${statusColors[selectedEnquiry.status]} flex items-center gap-2 w-fit`}>
                      {(() => {
                        const StatusIcon = statusIcons[selectedEnquiry.status];
                        return <StatusIcon className="w-3 h-3" />;
                      })()}
                      {selectedEnquiry.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Business</label>
                <div className="mt-1">
                  {selectedEnquiry.business ? (
                    <div>
                      <a
                        href={`/businesses/${selectedEnquiry.business.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        {selectedEnquiry.business.name}
                      </a>
                      {selectedEnquiry.business.category && (
                        <p className="text-sm text-gray-500 mt-1">
                          Category: {selectedEnquiry.business.category.name}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">N/A</p>
                  )}
                </div>
              </div>

              {selectedEnquiry.message ? (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {selectedEnquiry.message}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                  <p className="mt-1 text-gray-400 dark:text-gray-500 italic bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    No message provided
                  </p>
                </div>
              )}

              {selectedEnquiry.response && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <label className="text-sm font-medium text-green-900 dark:text-green-300 flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Response from Business
                    {selectedEnquiry.responseDate && (
                      <span className="text-xs text-green-700 dark:text-green-400 font-normal">
                        ({format(new Date(selectedEnquiry.responseDate), 'MMM dd, yyyy hh:mm a')})
                      </span>
                    )}
                  </label>
                  <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {selectedEnquiry.response}
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500 pt-2 border-t">
                Created on {format(new Date(selectedEnquiry.createdAt), 'MMM dd, yyyy hh:mm a')}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

