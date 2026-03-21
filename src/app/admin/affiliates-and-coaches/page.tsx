'use client';

import React, { useState } from 'react';
import Header from '@/components/Header/Header';
import { useAppContext } from '@/context/AppContext';
import styles from './AffiliatesAndCoaches.module.css';

interface AffiliateCoach {
  id: string;
  name: string;
  type: 'Coach' | 'Afiliado';
  level: number;
  referrals: number;
  sales: number;
  isFeatured: boolean;
  avatar?: string;
}

const INITIAL_LIST: AffiliateCoach[] = [
  { id: '1', name: 'Alex Rivera', type: 'Coach', level: 1, referrals: 45, sales: 1200, isFeatured: true },
  { id: '2', name: 'Sofia Galindo', type: 'Afiliado', level: 2, referrals: 15, sales: 850, isFeatured: false },
  { id: '3', name: 'Mateo Ortiz', type: 'Coach', level: 2, referrals: 120, sales: 4500, isFeatured: true },
  { id: '4', name: 'Valeria Castro', type: 'Afiliado', level: 1, referrals: 8, sales: 320, isFeatured: false },
];

export default function AffiliatesAndCoaches() {
  const { user } = useAppContext();
  const [list, setList] = useState<AffiliateCoach[]>(INITIAL_LIST);

  if (!user || user.role_id !== 'Admin') {
    return (
      <div className={styles.unauthorized}>
        <Header />
        <h1 style={{ color: 'white' }}>Acceso Restringido</h1>
      </div>
    );
  }

  const updateLevel = (id: string, delta: number) => {
    setList(prev => prev.map(item => {
      if (item.id === id) {
        const newLevel = Math.max(1, Math.min(5, item.level + delta)); // Sample range 1-5
        return { ...item, level: newLevel };
      }
      return item;
    }));
  };

  const toggleFeatured = (id: string) => {
    setList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, isFeatured: !item.isFeatured };
      }
      return item;
    }));
  };

  // Sorting: Featured first, then level
  const sortedList = [...list].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    return b.level - a.level;
  });

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 style={{ color: 'white' }}>Nuestros <span>Afiliados y Coaches</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Gestión de niveles y visibilidad en página principal</p>
        </header>

        <div className={styles.grid}>
          {sortedList.map(item => (
            <div key={item.id} className={styles.card}>
              <div className={styles.userHeader}>
                <div className={styles.avatar}>{item.name[0]}</div>
                <div className={styles.userInfo}>
                  <h3>{item.name}</h3>
                  <span className={`${styles.badge} ${styles[item.type.toLowerCase()]}`}>{item.type}</span>
                </div>
              </div>

              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <label>Referidos</label>
                  <span>{item.referrals}</span>
                </div>
                <div className={styles.statItem}>
                  <label>Ventas Generadas</label>
                  <span>${item.sales}</span>
                </div>
              </div>

              <div className={styles.levelControl}>
                <button className={styles.levelBtn} onClick={() => updateLevel(item.id, -1)}>−</button>
                <span>Nivel {item.level}</span>
                <button className={styles.levelBtn} onClick={() => updateLevel(item.id, 1)}>+</button>
              </div>

              <div className={styles.actions}>
                <button 
                  className={`${styles.button} ${item.isFeatured ? styles.featuredActive : styles.featured}`}
                  onClick={() => toggleFeatured(item.id)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={item.isFeatured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  {item.isFeatured ? 'En Inicio (Destacado)' : 'Colocar en Inicio'}
                </button>
                {/* Level Up/Down according to requirements */}
                <div style={{ display: 'flex', gap: '8px' }}>
                   {item.level < 5 && (
                     <button className={styles.button} onClick={() => updateLevel(item.id, 1)}>
                        Subir de Nivel
                     </button>
                   )}
                   {item.level > 1 && (
                     <button className={styles.button} onClick={() => updateLevel(item.id, -1)}>
                        Degradar
                     </button>
                   )}
                </div>
                <button className={styles.button}>Ver Perfil Público</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
