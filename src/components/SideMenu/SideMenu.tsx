'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import styles from './SideMenu.module.css';

export default function SideMenu() {
  const { isMenuOpen, setMenuOpen, user, logout, setChatOpen } = useAppContext();

  // Close menu on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setMenuOpen]);

  if (!isMenuOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={() => setMenuOpen(false)} />
      <aside className={`${styles.menu} ${isMenuOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.logo}>SUPPLY<span>MAX</span></div>
          <button className={styles.closeBtn} onClick={() => setMenuOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <nav className={styles.nav}>
          <Link href="/profile" className={styles.navItem} onClick={() => setMenuOpen(false)}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
             Mi Cuenta
          </Link>
          <Link href="/catalog" className={styles.navItem} onClick={() => setMenuOpen(false)}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
             Suplementos
          </Link>
          <Link href="/catalog?category=Ropa" className={styles.navItem} onClick={() => setMenuOpen(false)}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"></path></svg>
             Ropa
          </Link>
          <Link href="/join-team" className={styles.navItem} onClick={() => setMenuOpen(false)}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
             Cómo ser parte de nuestro equipo
          </Link>
          <button className={styles.navItem} onClick={() => { setChatOpen(true); setMenuOpen(false); }}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
             Soporte Técnico
          </button>
          {user?.role === 'Admin' && (
            <Link href="/admin/applications" className={styles.navItem} onClick={() => setMenuOpen(false)}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
               Ver Solicitudes (Admin)
            </Link>
          )}
        </nav>

        <div className={styles.footer}>
          {user && (
            <button className={styles.logoutBtn} onClick={() => { logout(); setMenuOpen(false); }}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
               Cerrar Sesión
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
