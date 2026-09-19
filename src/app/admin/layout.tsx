import React from 'react';
import type { Metadata } from 'next';
import AdminHeader from '@/components/AdminHeader/AdminHeader';

export const metadata: Metadata = {
  title: 'Panel de Administración | SupplyMax',
  description: 'Gestión integral de inventario, finanzas, afiliados y staff de SupplyMax.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0B0B0B', color: '#FFFFFF' }}>
      <AdminHeader />
      {children}
    </div>
  );
}
