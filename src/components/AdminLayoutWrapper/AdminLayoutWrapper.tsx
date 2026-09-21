'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar/AdminSidebar';
import AdminHeader from '@/components/AdminHeader/AdminHeader';
import styles from './AdminLayoutWrapper.module.css';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layoutContainer}>
      {/* Left Navigation Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Right Content Section */}
      <div className={styles.mainContent}>
        <AdminHeader 
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)} 
        />
        <main className={styles.pageBody}>
          {children}
        </main>
      </div>
    </div>
  );
}
