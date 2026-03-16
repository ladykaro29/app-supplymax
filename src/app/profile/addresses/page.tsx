'use client';

import React, { useState } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import DashboardSidebar from '@/components/DashboardSidebar/DashboardSidebar';
import styles from '../Profile.module.css';

export default function AddressesPage() {
  const [agencies, setAgencies] = useState([
    { id: 1, type: 'MRW', address: 'Calle 24 entre Av 3 y 4, Mérida', default: true },
    { id: 2, type: 'Zoom', address: 'Av. Las Américas, Sector Albarregas', default: false }
  ]);

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.dashboardLayout}>
        <DashboardSidebar />
        
        <main className={styles.content}>
          <header className={styles.pageHeader}>
             <h1>MIS <span>DIRECCIONES</span></h1>
             <p>GESTIONA TUS PUNTOS DE RETIRO</p>
          </header>

          <section className={styles.addressGrid}>
             {agencies.map(agency => (
               <div key={agency.id} className={`${styles.infoCard} glass`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{agency.type}</strong>
                    {agency.default && <span className={styles.defaultBadge}>PREDETERMINADO</span>}
                  </div>
                  <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>{agency.address}</p>
                  <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <button className={styles.miniBtn}>Editar</button>
                    {!agency.default && <button className={styles.miniBtn}>Hacer predeterminado</button>}
                  </div>
               </div>
             ))}
             
             <button className={styles.addAddressCard}>
                <span>+ NUEVA AGENCIA</span>
             </button>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
