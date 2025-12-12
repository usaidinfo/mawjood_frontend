'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { enquiryService } from '@/services/enquiry.service';
import { MessageSquare } from 'lucide-react';

export default function EnquiryChatButton() {
  const { user, isAuthenticated } = useAuthStore();

  // Check for enquiries with responses (only for regular users)
  const { data: userEnquiries } = useQuery({
    queryKey: ['user-enquiries-badge'],
    queryFn: () => enquiryService.getUserEnquiries({ page: 1, limit: 100 }),
    enabled: isAuthenticated && user?.role === 'USER',
    staleTime: 30000,
    refetchInterval: 60000, // Refetch every minute
  });

  const hasEnquiryResponse = useMemo(() => {
    if (!userEnquiries?.enquiries) return false;
    return userEnquiries.enquiries.some((enquiry) => !!enquiry.response);
  }, [userEnquiries]);

  // Only show for regular users
  if (!isAuthenticated || user?.role !== 'USER') {
    return null;
  }

  return (
    <Link
      href="/profile?tab=enquiries"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
      title="My Enquiries"
    >
      <MessageSquare className="w-6 h-6" />
      {hasEnquiryResponse && (
        <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
      )}
    </Link>
  );
}


