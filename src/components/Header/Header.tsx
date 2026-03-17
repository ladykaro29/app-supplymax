'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import styles from './Header.module.css';

export default function Header() {
  const { user, logout, cart, setCartOpen, setMenuOpen } = useAppContext();

  return (
    <header className={`${styles.header} glass`}>
      <div className={styles.container}>
        {/* Left: Menu & Categories */}
        <div className={styles.leftSection}>
          <div className={styles.menuIcon} onClick={() => setMenuOpen(true)}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </div>
          <Link href="/" className={styles.brandName}>
            SUPPLY<span>MAX</span>
          </Link>
        </div>

        {/* Center: Search (Placeholder for now, or moved from page.tsx) */}
        <div className={styles.searchArea}>
          <div className={styles.searchIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input 
            type="text" 
            placeholder="Buscar suplementos (Proteínas, Creatinas...)" 
            className={styles.searchInput}
          />
        </div>

        {/* Right: Actions */}
        <div className={styles.actions}>
          {user ? (
            <div className={styles.iconBtn}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
               <Link href={user.role === 'Admin' ? '/dashboard/admin' : '/profile'} className={styles.userLabel}>
                 {user.role === 'Admin' ? 'Hola, Admin' : user.name}
               </Link>
               <button onClick={logout} style={{ marginLeft: '5px', opacity: 0.6 }}>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
               </button>
            </div>
          ) : (
            <Link href="/login" className={styles.iconBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </Link>
          )}

          <button className={styles.iconBtn} aria-label="Abrir Carrito" onClick={() => setCartOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            <span className={styles.cartCount}>{cart.length}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
