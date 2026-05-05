'use client';

import React from 'react';
import Header from '@/components/Header/Header';
import DashboardSidebar from '@/components/DashboardSidebar/DashboardSidebar';
import Footer from '@/components/Footer/Footer';
import { useAppContext } from '@/context/AppContext';
import styles from './Influencer.module.css';
import commonStyles from '../../profile/Profile.module.css';

export default function InfluencerDashboard() {
  const { user } = useAppContext();

  if (!user || user.role_id !== 'Influencer') return null;

  const withdrawLimit = 5000;
  const canWithdraw = (user.tokens || 0) >= withdrawLimit;

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={commonStyles.dashboardLayout}>
        <DashboardSidebar />
        
        <main className={commonStyles.content}>
          <header className={commonStyles.pageHeader}>
             <h1>PANEL DE <span>EMBAJADOR</span></h1>
             <p>GANA COMISIONES POR TU RENDIMIENTO Y COMUNIDAD</p>
          </header>

          <section className={commonStyles.overviewGrid}>
            <div className={`${commonStyles.infoCard} glass neon-glow`}>
               <h3>Saldo de Tokens</h3>
               <div className={commonStyles.bigValue}>🪙 {user.tokens?.toLocaleString()}</div>
               <p>≈ ${(user.tokens || 0) / 100} USD disponibles.</p>
               <button className={commonStyles.actionBtn} disabled={!canWithdraw}>
                 {canWithdraw ? 'RETIRAR FONDOS' : `FALTAN ${withdrawLimit - (user.tokens || 0)} PARA RETIRAR`}
               </button>
            </div>

            <div className={`${commonStyles.infoCard} glass`}>
               <h3>Tasa de Comisión</h3>
               <div className={commonStyles.levelBadge}>{user.level === 'Plata' ? '8%' : '5%'}</div>
               <p>Nivel {user.level}. Siguiente nivel (Oro): 10%</p>
               <div className={commonStyles.progressBar}>
                 <div className={commonStyles.progress} style={{ width: '65%' }}></div>
               </div>
            </div>
          </section>

          <section className={styles.influencerTools}>
            <div className={`${commonStyles.infoCard} glass`}>
               <h3>Tu Código de Descuento</h3>
               <div className={styles.promoCode}>{user.affiliate_code}</div>
               <p>Comparte este código para dar 10% de descuento a tus seguidores y ganar comisiones.</p>
               <button className={styles.copyBtn}>COPIAR ENLACE ÚNICO</button>
            </div>
          </section>

          <section className={styles.metaSection}>
             <div className={commonStyles.sectionHeader}>
                <h2>Meta de 30 Días</h2>
             </div>
             <div className={styles.metaGrid}>
                <div className={styles.metaBox}>
                   <span>Ventas</span>
                   <strong>12 / 20</strong>
                </div>
                <div className={styles.metaBox}>
                   <span>Días Restantes</span>
                   <strong>8</strong>
                </div>
             </div>
             <p className={styles.warning}>Mantén tu meta mensual para conservar el Nivel Plata.</p>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
