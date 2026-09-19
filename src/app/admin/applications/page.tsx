'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import Header from '@/components/Header/Header';
import ApplicationsAdminClient from './ApplicationsAdminClient';

export default function ApplicationsAdminPage() {
  const { user } = useAppContext();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && (!user || user.role_id !== 'Admin')) {
      router.push('/login');
    }
  }, [user, router, isMounted]);

  if (!isMounted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'sans-serif' }}>
        <p>Cargando panel...</p>
      </div>
    );
  }

  if (!user || user.role_id !== 'Admin') return null;

  return (
    <div>
      <ApplicationsAdminClient />
    </div>
  );
}
