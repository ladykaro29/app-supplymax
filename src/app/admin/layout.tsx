import React from 'react';
import type { Metadata } from 'next';
import AdminLayoutWrapper from '@/components/AdminLayoutWrapper/AdminLayoutWrapper';

export const metadata: Metadata = {
  title: 'Panel de Administración | SupplyMax',
  description: 'Gestión integral de inventario, finanzas, afiliados y equipo de SupplyMax.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayoutWrapper>
      {children}
    </AdminLayoutWrapper>
  );
}
