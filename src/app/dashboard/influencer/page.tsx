'use client';

import React from 'react';
import Header from '@/components/Header/Header';
import { useAppContext } from '@/context/AppContext';
import styles from './Influencer.module.css';

export default function InfluencerDashboard() {
  const { user } = useAppContext();

  if (!user || user.role !== 'Influencer') {
    return (
      <div className={styles.unauthorized}>
        <Header />
        <div className={styles.errorContent}>
          <h1>Acceso Restringido</h1>
          <p>Esta sección es solo para Embajadores Supplymax.</p>
        </div>
      </div>
    );
  }

  const withdrawLimit = 5000;
  const canWithdraw = (user.tokens || 0) >= withdrawLimit;

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.welcome}>
             <h1>Panel de <span>Embajador</span></h1>
             <p>Hola, {user.name} 👋</p>
          </div>
          <div className={`${styles.badge} glass`}>Nivel {user.level}</div>
        </header>

        <section className={styles.statsGrid}>
          {/* Token Card */}
          <div className={`${styles.statCard} glass glow`}>
            <h3>Saldo de Tokens</h3>
            <div className={styles.tokenCount}>
              🪙 {user.tokens?.toLocaleString()}
            </div>
            <p className={styles.conversion}>≈ ${(user.tokens || 0) / 100} USD</p>
            <button className={styles.withdrawBtn} disabled={!canWithdraw}>
              {canWithdraw ? 'Retirar Fondos' : `Faltan ${withdrawLimit - (user.tokens || 0)} para retirar`}
            </button>
          </div>

          {/* Performance Card */}
          <div className={`${styles.statCard} glass`}>
            <h3>Tasa de Comisión</h3>
            <div className={styles.percentage}>{user.level === 'Plata' ? '8%' : '5%'}</div>
            <p>Siguiente nivel (Oro): 10%</p>
            <div className={styles.progressBar}>
              <div className={styles.progress} style={{ width: '65%' }}></div>
            </div>
          </div>

          {/* Code Card */}
          <div className={`${styles.statCard} glass`}>
            <h3>Tu Código Único</h3>
            <div className={styles.code}>{user.influencerCode}</div>
            <p>Comparte este código para dar 10% de descuento a tus seguidores.</p>
            <button className={styles.copyBtn}>Copiar Link</button>
          </div>
        </section>

        <section className={styles.performance}>
           <h2>Meta de 30 Días</h2>
           <div className={`${styles.metaInfo} glass`}>
              <div className={styles.metaStat}>
                <span>Ventas Realizadas</span>
                <strong>12</strong>
              </div>
              <div className={styles.metaStat}>
                <span>Meta Mínima</span>
                <strong>20</strong>
              </div>
              <div className={styles.metaStat}>
                <span>Días Restantes</span>
                <strong>8</strong>
              </div>
           </div>
           <p className={styles.warning}>Mantén tu meta para no bajar de nivel.</p>
        </section>
      </main>
    </div>
  );
}
