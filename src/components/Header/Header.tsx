'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import styles from './Header.module.css';

export default function Header() {
  const { currency, toggleCurrency, user, logout, cart } = useAppContext();

  return (
    <header className={`${styles.header} glass`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoContainer}>
          <Image 
            src="/logo.jpg" 
            alt="Supplymax Logo" 
            width={50} 
            height={50} 
            className={styles.logo}
          />
          <span className={styles.brandName}>SUPPLY<span>MAX</span></span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/catalog">Catálogo</Link>
          <Link href="/coaches">Coaches</Link>
          <Link href="/tokens">Tokens</Link>
        </nav>

        <div className={styles.actions}>
          <div className={styles.currencyToggle} onClick={toggleCurrency}>
            <span className={currency === 'USD' ? styles.active : ''}>USD</span>
            <div className={styles.toggleTrack}>
              <div className={`${styles.toggleThumb} ${currency === 'VES' ? styles.toggleRight : ''}`} />
            </div>
            <span className={currency === 'VES' ? styles.active : ''}>BS</span>
          </div>
          
          <Link href="/checkout" className={styles.cartIcon}>
            🛒
            <span className={styles.cartCount}>{cart.length}</span>
          </Link>
          
          {user ? (
            <div className={styles.userMenu}>
              <Link href={user.role === 'Admin' ? '/dashboard/admin' : user.role === 'Influencer' ? '/dashboard/influencer' : '/profile'} className={styles.profileLink}>
                {user.name}
              </Link>
              <button onClick={logout} className={styles.logoutBtn}>✖</button>
            </div>
          ) : (
            <Link href="/login" className={styles.loginBtn}>Ingresar</Link>
          )}
        </div>
      </div>
    </header>
  );
}
