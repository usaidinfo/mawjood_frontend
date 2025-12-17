// app/dashboard/layout.tsx
'use client';

import DashboardNavbar from '@/components/dashboard/layout/Navbar';
import DashboardSidebar from '@/components/dashboard/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import QueryProvider from '@/providers/QueryProvider';
import { Toaster } from '@/components/ui/sonner'; 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [checking, setChecking] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
  
    // Check if current path is a payment page (should be accessible without auth)
    const isPaymentPage = pathname?.includes('/dashboard/payments/success') ||
      pathname?.includes('/dashboard/payments/failed') ||
      pathname?.includes('/dashboard/payments/pending');
  
    useEffect(() => {
      const timer = setTimeout(() => {
        // Skip auth check for payment pages
        if (isPaymentPage) {
          setChecking(false);
          return;
        }
        
        if (!isAuthenticated) {
          router.push('/');
        } else {
          setChecking(false);
        }
      }, 100);
  
      return () => clearTimeout(timer);
    }, [isAuthenticated, user, router, isPaymentPage]);

  // For payment pages, don't require authentication or show dashboard UI
  if (isPaymentPage) {
    return (
      <QueryProvider>
        <div className="min-h-screen bg-gray-50">
          <main>{children}</main>
        </div>
        <Toaster />
      </QueryProvider>
    );
  }

  if (checking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryProvider>
      <div className="min-h-screen bg-gray-50">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="lg:ml-64">
          <DashboardNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          <main className="py-16 px-4 sm:px-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </QueryProvider>
  );
}