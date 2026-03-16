'use client';

import React from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import DashboardSidebar from '@/components/DashboardSidebar/DashboardSidebar';
import { useAppContext } from '@/context/AppContext';
import styles from './Profile.module.css';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, orders, formatPrice } = useAppContext();
  const router = useRouter();

  if (!user) return null;

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.dashboardLayout}>
        <DashboardSidebar />
        
        <main className={styles.content}>
          <header className={styles.pageHeader}>
             <h1>HOLA, <span>{user.name.toUpperCase()}</span></h1>
             <p>BIENVENIDO A TU PANEL DE ALTO RENDIMIENTO</p>
          </header>

          <section className={styles.overviewGrid}>
            <div className={`${styles.infoCard} glass neon-glow`}>
               <h3>Tokens Supplymax</h3>
               <div className={styles.bigValue}>🪙 {user.tokens || 0}</div>
               <p>Equivalente a {formatPrice((user.tokens || 0) / 100)} en descuentos.</p>
               <button className={styles.actionBtn}>CANJEAR TOKENS</button>
            </div>

            <div className={`${styles.infoCard} glass`}>
               <h3>Nivel de Atleta</h3>
               <div className={styles.levelBadge}>{user.level || 'BRONCE'}</div>
               <p>Faltan 5 compras para el nivel PLATA.</p>
               <div className={styles.progressBar}><div className={styles.progress} style={{width: '40%'}}></div></div>
            </div>
          </section>

          <section className={styles.recentActivity}>
            <div className={styles.sectionHeader}>
               <h2>Actividad Reciente</h2>
               <button onClick={() => router.push('/profile/orders')}>VER TODO</button>
            </div>
            
            <div className={styles.orderStrip}>
              {orders.length > 0 ? (
                <div className={styles.latestOrder}>
                   <span>Pedido #{orders[0].id}</span>
                   <strong>{orders[0].status}</strong>
                   <span>{new Date(orders[0].date).toLocaleDateString()}</span>
                   <strong>{formatPrice(orders[0].total)}</strong>
                </div>
              ) : (
                <p className={styles.empty}>Aún no tienes pedidos registrados.</p>
              )}
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
