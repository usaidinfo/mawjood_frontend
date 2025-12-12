'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import SettingsPage from '@/components/settings/SettingsPage';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [initialTab, setInitialTab] = useState<'profile' | 'security' | 'notifications' | 'enquiries' | 'preferences'>('profile');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'security', 'notifications', 'enquiries', 'preferences'].includes(tab)) {
      setInitialTab(tab as any);
    }
  }, [searchParams]);

  if (!isAuthenticated) {
    return null;
  }

  return <SettingsPage initialTab={initialTab} />;
}

