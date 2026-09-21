'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import styles from './AdminSidebar.module.css';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAppContext();

  const navSections = [
    {
      title: 'PANEL & CONTROL',
      items: [
        { label: 'Panel General', href: '/admin', icon: '⚡' },
        { label: 'Punto de Venta (POS)', href: '/admin/pos', icon: '📟' },
      ],
    },
    {
      title: 'GESTIÓN DE CATÁLOGO',
      items: [
        { label: 'Productos & Stock', href: '/admin/edit-products', icon: '📦' },
        { label: 'Agregar Producto', href: '/admin/edit-products?new=true', icon: '➕' },
      ],
    },
    {
      title: 'FINANZAS & VENTAS',
      items: [
        { label: 'Pedidos & Ventas', href: '/admin/orders', icon: '🛍️' },
        { label: 'Contabilidad & Utilidades', href: '/admin/performance', icon: '📈' },
      ],
    },
    {
      title: 'EQUIPO & COMUNIDAD',
      items: [
        { label: 'Coaches & Afiliados', href: '/admin/affiliates-and-coaches', icon: '👥' },
        { label: 'Postulaciones', href: '/admin/applications', icon: '📝' },
        { label: 'Equipo & Roles', href: '/admin/team', icon: '🛡️' },
      ],
    },
  ];

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className={styles.backdrop} 
          onClick={onClose} 
          aria-hidden="true" 
        />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <Link href="/admin/edit-products" className={styles.brandLink} onClick={onClose}>
            <div className={styles.logoWrapper}>
              <Image 
                src="/icon-round.png" 
                alt="SupplyMax Logo" 
                width={38} 
                height={38} 
                className={styles.logoImg}
              />
            </div>
            <div className={styles.brandInfo}>
              <span className={styles.brandName}>SUPPLY<span>MAX</span></span>
              <span className={styles.badge}>ADMINISTRADOR</span>
            </div>
          </Link>

          <button 
            type="button" 
            className={styles.closeBtn} 
            onClick={onClose} 
            aria-label="Cerrar Menú"
          >
            ✕
          </button>
        </div>

        {/* Navigation Sections */}
        <div className={styles.navContainer}>
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className={styles.sectionGroup}>
              <span className={styles.sectionTitle}>{section.title}</span>
              <nav className={styles.navLinks}>
                {section.items.map((item) => {
                  const itemPath = item.href.split('?')[0];
                  const hasNewParam = item.href.includes('new=true');
                  const isActive = pathname === itemPath && (!hasNewParam || pathname === itemPath);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                    >
                      <span className={styles.navIcon}>{item.icon}</span>
                      <span className={styles.navLabel}>{item.label}</span>
                      {isActive && <span className={styles.activePill} />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* Quick External Link */}
          <div className={styles.sectionGroup}>
            <span className={styles.sectionTitle}>ACCESOS RÁPIDOS</span>
            <Link href="/" className={styles.storeLink} onClick={onClose}>
              <span className={styles.navIcon}>🏪</span>
              <span className={styles.navLabel}>Ver Tienda Pública</span>
              <span className={styles.externalArrow}>↗</span>
            </Link>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className={styles.userFooter}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{userInitial}</div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user?.name || 'Administrador'}</span>
              <span className={styles.userEmail}>{user?.email || 'admin@supplymax.app'}</span>
              <span className={styles.userRoleTag}>{user?.role_id || 'Admin'}</span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={logout} 
            className={styles.logoutBtn}
            title="Cerrar sesión"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
