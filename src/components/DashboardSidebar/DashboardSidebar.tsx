'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import styles from './DashboardSidebar.module.css';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, setChatOpen } = useAppContext();

  const role = (user?.role_id || '').toLowerCase().trim();
  const isAdmin = role === 'admin';
  const isInfluencer = role === 'influencer';

  const storeItems: SidebarItem[] = [
    { 
      label: 'Inicio Tienda', 
      href: '/', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> 
    },
    { 
      label: 'Suplementos', 
      href: '/catalog', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg> 
    },
    { 
      label: 'Ropa Deportiva', 
      href: '/ropa', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"></path></svg> 
    }
  ];

  const profileItems: SidebarItem[] = [
    { 
      label: 'Resumen Perfil', 
      href: '/profile', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> 
    },
    ...(isInfluencer ? [{ 
      label: 'Panel Embajador', 
      href: '/dashboard/influencer', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v12M15 9.5a3.5 3.5 0 1 0-7 0 3.5 3.5 0 0 0 7 0Z"/></svg> 
    }] : []),
    ...(isAdmin ? [{
      label: 'Panel Admin',
      href: '/admin/edit-products',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
    }] : []),
    { 
      label: 'Mis Pedidos', 
      href: '/profile/orders', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg> 
    },
    { 
      label: 'Agencias de Envío', 
      href: '/profile/addresses', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> 
    },
    { 
      label: 'Configuración', 
      href: '/profile/settings', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> 
    }
  ];

  return (
    <aside className={styles.sidebar}>
      {/* Store Navigation Section */}
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>TIENDA</span>
      </div>
      <div className={styles.nav}>
        {storeItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Account Section */}
      <div className={`${styles.sectionHeader} ${styles.sectionHeaderSpaced}`}>
        <span className={styles.sectionTitle}>MI CUENTA</span>
      </div>
      <div className={styles.nav}>
        {profileItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
      
      <div className={styles.footer}>
        <p>¿Necesitas ayuda?</p>
        <button 
          className={styles.supportBtn} 
          onClick={() => setChatOpen(true)}
          type="button"
        >
          SOPORTE TÉCNICO
        </button>
      </div>
    </aside>
  );
}

