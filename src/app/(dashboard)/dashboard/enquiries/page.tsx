'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { enquiryService, Enquiry, EnquiryStatus, EnquiryFilters } from '@/services/enquiry.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Search, MessageSquare, Loader2, Eye, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const statusColors: Record<EnquiryStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  CLOSED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const statusIcons: Record<EnquiryStatus, any> = {
  OPEN: AlertCircle,
  IN_PROGRESS: Clock,
  CLOSED: CheckCircle2,
  REJECTED: XCircle,
};

export default function BusinessOwnerEnquiriesPage() {
  const [filters, setFilters] = useState<EnquiryFilters>({
    page: 1,
    limit: 20,
  });
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<EnquiryStatus>(EnquiryStatus.OPEN);
  const [updateResponse, setUpdateResponse] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['business-enquiries', filters],
    queryFn: () => enquiryService.getBusinessEnquiries(filters),
    staleTime: 30000,
  });

  const handleStatusChange = (status: EnquiryStatus) => {
    setFilters({ ...filters, status, page: 1 });
  };

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search: search || undefined, page: 1 });
  };

  const handleViewEnquiry = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setViewDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedEnquiry) return;

    try {
      await enquiryService.updateEnquiryStatus(selectedEnquiry.id, {
        status: updateStatus,
        response: updateResponse || undefined,
      });
      toast.success('Enquiry status updated successfully');
      setUpdateDialogOpen(false);
      setUpdateResponse('');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update enquiry status');
    }
  };

  const openUpdateDialog = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setUpdateStatus(enquiry.status);
    setUpdateResponse(enquiry.response || '');
    setUpdateDialogOpen(true);
  };

  const enquiries = data?.enquiries || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Enquiries</h1>
          <p className="text-gray-600 mt-1">View and manage enquiries for your businesses</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search enquiries..."
              value={filters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                const { status, ...rest } = filters;
                setFilters({ ...rest, page: 1 });
              } else {
                handleStatusChange(value as EnquiryStatus);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value={EnquiryStatus.OPEN}>Open</SelectItem>
              <SelectItem value={EnquiryStatus.IN_PROGRESS}>In Progress</SelectItem>
              <SelectItem value={EnquiryStatus.CLOSED}>Closed</SelectItem>
              <SelectItem value={EnquiryStatus.REJECTED}>Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : enquiries.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No enquiries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enquiries.map((enquiry) => {
                  const StatusIcon = statusIcons[enquiry.status];
                  return (
                    <tr key={enquiry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{enquiry.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{enquiry.message.substring(0, 50)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{enquiry.business?.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{enquiry.email}</div>
                        <div className="text-sm text-gray-500">{enquiry.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={statusColors[enquiry.status]}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {enquiry.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(enquiry.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEnquiry(enquiry)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => openUpdateDialog(enquiry)}
                        >
                          Update
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} enquiries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                disabled={pagination.page >= pagination.pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Enquiry Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm text-gray-900">{selectedEnquiry.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm text-gray-900">{selectedEnquiry.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm text-gray-900">{selectedEnquiry.phone}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={statusColors[selectedEnquiry.status]}>
                    {selectedEnquiry.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label>Business</Label>
                  <p className="text-sm text-gray-900">{selectedEnquiry.business?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p className="text-sm text-gray-900">
                    {format(new Date(selectedEnquiry.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
              <div>
                <Label>Message</Label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedEnquiry.message}</p>
              </div>
              {selectedEnquiry.response && (
                <div>
                  <Label>Your Response</Label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedEnquiry.response}</p>
                  {selectedEnquiry.responseDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Responded on {format(new Date(selectedEnquiry.responseDate), 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setViewDialogOpen(false);
                  openUpdateDialog(selectedEnquiry);
                }}>
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Enquiry Status</DialogTitle>
            <DialogDescription>
              Update the status and add a response to this enquiry. The user will be notified via email.
            </DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={updateStatus} onValueChange={(value) => setUpdateStatus(value as EnquiryStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EnquiryStatus.OPEN}>Open</SelectItem>
                    <SelectItem value={EnquiryStatus.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={EnquiryStatus.CLOSED}>Closed</SelectItem>
                    <SelectItem value={EnquiryStatus.REJECTED}>Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Response (Optional)</Label>
                <Textarea
                  value={updateResponse}
                  onChange={(e) => setUpdateResponse(e.target.value)}
                  placeholder="Add a response to the enquiry. This will be sent to the user via email..."
                  rows={5}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateStatus}>
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

