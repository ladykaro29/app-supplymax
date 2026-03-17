'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import Header from '@/components/Header/Header';
import ApplicationsAdminClient from './ApplicationsAdminClient';

export default function ApplicationsAdminPage() {
  const { user } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'Admin') {
      router.push('/login');
    }
  }, [user, router]);

  if (!user || user.role !== 'Admin') return null;

  return (
    <div>
      <Header />
      <ApplicationsAdminClient />
    </div>
  );
}
