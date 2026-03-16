'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandInfo}>
          <div className={styles.logo}>
            SUPPLY<span>MAX</span>
          </div>
          <p>Tu tienda online de confianza para suplementos deportivos en Mérida, Venezuela.</p>
          <div className={styles.socials}>
             <a href="#" aria-label="Instagram">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
             </a>
          </div>
        </div>

        <div className={styles.linksColumn}>
          <h4>Enlaces Rápidos</h4>
          <ul>
            <li><Link href="/">Inicio</Link></li>
            <li><Link href="/catalog">Catálogo</Link></li>
            <li><Link href="/report-payment">Reportar Pago</Link></li>
          </ul>
        </div>

        <div className={styles.linksColumn}>
          <h4>Horarios de Entrega</h4>
          <ul>
            <li>Lun - Vie: 1:30 PM - 6:00 PM</li>
            <li>Sáb - Dom: 8:00 AM - 3:00 PM</li>
          </ul>
        </div>

        <div className={styles.linksColumn}>
          <h4>Ubicación</h4>
          <p>📍 Mérida, Venezuela.</p>
        </div>
      </div>
      
      <div className={styles.bottomBar}>
        <div className={styles.container}>
          <p>© 2026 Supply Max. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
