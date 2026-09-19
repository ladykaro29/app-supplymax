'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import styles from './AdminHeader.module.css';

export default function AdminHeader() {
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

  const navItems = [
    { label: 'Inventario / Stock', href: '/admin/edit-products', icon: '📦' },
    { label: 'Finanzas & Métricas', href: '/admin/performance', icon: '📈' },
    { label: 'Coaches & Afiliados', href: '/admin/affiliates-and-coaches', icon: '👥' },
    { label: 'Postulaciones', href: '/admin/applications', icon: '📝' },
    { label: 'Equipo & Roles', href: '/admin/team', icon: '🛡️' },
  ];

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <header className={styles.adminHeader}>
      <div className={styles.container}>
        {/* Brand & Admin Badge */}
        <Link href="/admin/edit-products" className={styles.brandSection}>
          <div className={styles.logoWrapper}>
            <Image 
              src="/icon-round.png" 
              alt="SupplyMax Logo" 
              width={40} 
              height={40} 
              className={styles.logoImg}
            />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>SUPPLY<span>MAX</span></span>
            <span className={styles.adminBadge}>MODO ADMINISTRADOR</span>
          </div>
        </Link>

        {/* Central Admin Navigation */}
        <nav className={styles.navLinks}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

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
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.storeButton}
            title="Abrir la tienda pública en una pestaña nueva"
          >
            <span>🛒</span>
            <span>Ver Tienda</span>
          </Link>

          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              {userInitial}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name || 'Administrador'}</span>
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
