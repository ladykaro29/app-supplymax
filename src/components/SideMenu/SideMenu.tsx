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

  const role = (user?.role_id || '').toLowerCase().trim();
  const isAdmin = role === 'admin';
  const isCoach = role === 'coach';
  const isInfluencer = role === 'influencer';

  return (
    <>
      <div className={styles.overlay} onClick={() => setMenuOpen(false)} />
      <aside className={`${styles.menu} ${isMenuOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.logo}>SUPPLY<span>MAX</span></div>
          <button 
            className={styles.closeBtn} 
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar Menú"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <nav className={styles.nav}>
          {/* SECTION 1: NAVEGACIÓN GENERAL DE LA TIENDA (Visible para TODOS los roles) */}
          <div className={styles.section}>
            <span className={styles.sectionTitle}>Navegación Tienda</span>

            <Link href="/" className={styles.navItem} onClick={() => setMenuOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              Inicio
            </Link>

            <Link href="/catalog" className={styles.navItem} onClick={() => setMenuOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              Suplementos
            </Link>

            <Link href="/ropa" className={styles.navItem} onClick={() => setMenuOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"></path></svg>
              Ropa Deportiva
            </Link>

            <Link href="/coaches" className={styles.navItem} onClick={() => setMenuOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Coaches & Atletas
            </Link>

            <Link href="/sobre-nosotros" className={styles.navItem} onClick={() => setMenuOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              Quiénes Somos
            </Link>

            <Link href="/join-team" className={styles.navItem} onClick={() => setMenuOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
              Únete a Nuestro Team
            </Link>

            <button 
              className={styles.navItem} 
              onClick={() => { setChatOpen(true); setMenuOpen(false); }}
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Soporte Técnico
            </button>
          </div>

          {/* SECTION 2: GESTIÓN SEGÚN EL ROL DEL USUARIO */}
          {isAdmin && (
            <div className={styles.section}>
              <span className={`${styles.sectionTitle} ${styles.adminTitle}`}>🛡️ Panel Administrativo</span>
              
              <Link href="/admin/edit-products" className={styles.navItem} onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                Catálogo de Productos
              </Link>
              <Link href="/admin/edit-products?new=true" className={styles.navItem} onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                Agregar Producto
              </Link>
              <Link href="/admin/performance" className={styles.navItem} onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                Finanzas & Rendimiento
              </Link>
              <Link href="/admin/applications" className={styles.navItem} onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
                Solicitudes de Afiliados
              </Link>
              <Link href="/admin/affiliates-and-coaches" className={styles.navItem} onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Nuestros Afiliados y Coaches
              </Link>
              <Link href="/admin/team" className={styles.navItem} onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Equipo de Trabajo
              </Link>
            </div>
          )}

          {isCoach && (
            <div className={styles.section}>
              <span className={`${styles.sectionTitle} ${styles.coachTitle}`}>🏆 Zona Coach</span>
              
              <Link href="/profile" className={styles.navItem} onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Mi Perfil & Descuentos
              </Link>
              <Link href="/profile/orders" className={styles.navItem} onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                Mis Pedidos
              </Link>
              <Link href="/profile/addresses" className={styles.navItem} onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Agencias de Envío
              </Link>
            </div>
          )}

          {isInfluencer && (
            <div className={styles.section}>
              <span className={`${styles.sectionTitle} ${styles.influencerTitle}`}>🌟 Zona Embajador</span>
              
              <Link href="/dashboard/influencer" className={styles.navItem} onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v12M15 9.5a3.5 3.5 0 1 0-7 0 3.5 3.5 0 0 0 7 0Z"/></svg>
                Tokens & Comisiones
              </Link>
              <Link href="/profile" className={styles.navItem} onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Mi Perfil
              </Link>
              <Link href="/profile/orders" className={styles.navItem} onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                Mis Pedidos
              </Link>
              <Link href="/profile/addresses" className={styles.navItem} onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Agencias de Envío
              </Link>
            </div>
          )}

          {user && !isAdmin && !isCoach && !isInfluencer && (
            <div className={styles.section}>
              <span className={styles.sectionTitle}>👤 Mi Cuenta</span>
              
              <Link href="/profile" className={styles.navItem} onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Mi Perfil
              </Link>
              <Link href="/profile/orders" className={styles.navItem} onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                Mis Pedidos
              </Link>
              <Link href="/profile/addresses" className={styles.navItem} onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Agencias de Envío
              </Link>
              <Link href="/profile/settings" className={styles.navItem} onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Configuración
              </Link>
            </div>
          )}

          {!user && (
            <div className={styles.section}>
              <span className={styles.sectionTitle}>Acceso</span>
              <Link href="/login" className={styles.navItem} onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                Iniciar Sesión / Registro
              </Link>
            </div>
          )}
        </nav>

        <div className={styles.footer}>
          {user ? (
            <div className={styles.userSection}>
              <div className={styles.userCard}>
                <div className={styles.userAvatar}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className={styles.userDetails}>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={styles.userRoleBadge}>
                    {isAdmin ? 'ADMINISTRADOR' : isCoach ? 'COACH' : isInfluencer ? 'EMBAJADOR' : 'CLIENTE'}
                  </span>
                </div>
              </div>
              <button 
                className={styles.logoutBtn} 
                onClick={() => { logout(); setMenuOpen(false); }}
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <Link href="/login" className={styles.loginBtnFull} onClick={() => setMenuOpen(false)}>
              INGRESAR A MI CUENTA
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}

