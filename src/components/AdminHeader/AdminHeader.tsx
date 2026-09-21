'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import styles from './AdminHeader.module.css';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const { user, logout, exchangeRate, setExchangeRate } = useAppContext();
  const pathname = usePathname();

  // Exchange rate editing state
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState(exchangeRate ? exchangeRate.toString() : '60');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (exchangeRate) {
      setRateInput(exchangeRate.toString());
    }
  }, [exchangeRate]);

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(rateInput);
    if (!isNaN(parsed) && parsed > 0) {
      await setExchangeRate(parsed);
      setSaveSuccess(true);
      setIsEditingRate(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const getPageTitle = () => {
    if (pathname.includes('/admin/orders')) return 'Pedidos & Ventas';
    if (pathname.includes('/admin/team')) return 'Equipo de Trabajo & Roles';
    if (pathname.includes('/admin/edit-products')) return 'Catálogo & Inventario';
    if (pathname.includes('/admin/performance')) return 'Finanzas & Rendimiento';
    if (pathname.includes('/admin/affiliates-and-coaches')) return 'Coaches & Afiliados';
    if (pathname.includes('/admin/applications')) return 'Postulaciones Recibidas';
    return 'Panel de Administración';
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <header className={styles.adminHeader}>
      <div className={styles.container}>
        {/* Left: Sidebar Toggle Button & Current Section Title */}
        <div className={styles.leftSection}>
          <button 
            type="button" 
            className={styles.menuBtn} 
            onClick={onToggleSidebar}
            aria-label="Abrir Menú Lateral"
            title="Abrir Menú de Navegación Lateral"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div className={styles.pageBreadcrumb}>
            <span className={styles.breadcrumbPrefix}>PANEL /</span>
            <h1 className={styles.pageTitle}>{getPageTitle()}</h1>
          </div>
        </div>

        {/* Right Actions: Daily Rate Widget, Public Store Link & Session */}
        <div className={styles.rightActions}>
          {/* Daily Exchange Rate Widget */}
          <div className={styles.rateWidget} title="Tasa oficial BCV / día para conversión a Bolívares (VES)">
            <span className={styles.rateLabel}>💵 TASA DEL DÍA:</span>
            {isEditingRate ? (
              <form onSubmit={handleSaveRate} className={styles.rateForm}>
                <input 
                  type="number" 
                  step="0.01" 
                  min="1"
                  className={styles.rateInput}
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  autoFocus
                />
                <button type="submit" className={styles.rateSaveBtn}>OK</button>
                <button type="button" className={styles.rateCancelBtn} onClick={() => setIsEditingRate(false)}>✕</button>
              </form>
            ) : (
              <>
                <span className={styles.rateValue}>
                  {(typeof exchangeRate === 'number' ? exchangeRate : (parseFloat(String(exchangeRate)) || 60)).toFixed(2)} VES
                </span>
                <button 
                  type="button" 
                  className={styles.rateEditBtn} 
                  onClick={() => setIsEditingRate(true)}
                  title="Editar Tasa del Día"
                >
                  ✏️
                </button>
                {saveSuccess && <span className={styles.rateSuccessToast}>✓ Guardada</span>}
              </>
            )}
          </div>

          <Link 
            href="/" 
            className={styles.storeButton}
            title="Ir a la Tienda Principal"
          >
            <span>🛒</span>
            <span className={styles.storeButtonText}>Ver Tienda</span>
          </Link>

          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              {userInitial}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name || 'Admin'}</span>
              <span className={styles.userRole}>{user?.role_id || 'Admin'}</span>
            </div>
            <button 
              onClick={logout} 
              className={styles.logoutBtn} 
              title="Cerrar Sesión de Administrador"
              type="button"
            >
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
