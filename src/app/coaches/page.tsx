'use client';

import React from 'react';
import Header from '@/components/Header/Header';
import styles from './Coaches.module.css';
import { useRouter } from 'next/navigation';

interface Coach {
  id: string;
  name: string;
  specialty: string;
  tier: 'Elite' | 'Pro' | 'Rising';
  bio: string;
  code: string;
}

const COACHES_DATA: Coach[] = [
  {
    id: '1',
    name: 'Carlos Mendoza',
    specialty: 'Fuerza y Powerlifting',
    tier: 'Elite',
    bio: 'Atleta Nacional y entrenador especializado en fuerza bruta. Usa mi código para envío prioritario.',
    code: 'MENDOZA5'
  },
  {
    id: '2',
    name: 'Valeria Rivas',
    specialty: 'Recomposición Corporal',
    tier: 'Pro',
    bio: 'Mi objetivo es ayudarte a lograr la mejor versión de tu cuerpo. Especialista mujeres fitness.',
    code: 'VALEFIT'
  },
  {
    id: '3',
    name: 'David Torres',
    specialty: 'CrossFit y Resistencia',
    tier: 'Pro',
    bio: 'Resistencia pura. Maximiza tu energía y desempeño en cada WOD con mi suplementación clave.',
    code: 'TORRESX'
  },
  {
    id: '4',
    name: 'Ana Silva',
    specialty: 'Nutrición Deportiva',
    tier: 'Rising',
    bio: 'Coach certificada. Te enseño cómo los macros y los suplementos correctos cambian tu vida.',
    code: 'ANASILVA'
  }
];

export default function CoachesPage() {
  const router = useRouter();

  const handleSupport = (code: string) => {
    alert(`Acabas de activar el código: ${code}. Se aplicará a tu carrito.`);
    // In a real app, this would save the referal code in context/localstorage
    router.push('/catalog');
  };

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>Nuestros <span>Coaches</span></h1>
          <p>
            En Supplymax no solo vendemos suplementos, impulsamos una comunidad. 
            Apoya a nuestros embajadores Nivel 2 utilizando sus códigos únicos y obtén beneficios exclusivos en tus compras.
          </p>
        </header>

        <section className={styles.coachGrid}>
          {COACHES_DATA.map((coach) => (
            <div key={coach.id} className={`${styles.coachCard} glass glow`}>
              <div className={styles.tierBadge}>{coach.tier}</div>
              <div className={styles.avatar}>{coach.name.charAt(0)}</div>
              
              <h3>{coach.name}</h3>
              <span className={styles.specialty}>{coach.specialty}</span>
              
              <p className={styles.bio}>{coach.bio}</p>

              <div className={styles.codeBox}>
                <span>Código de Apoyo</span>
                <strong>{coach.code}</strong>
              </div>

              <button 
                className={styles.supportBtn}
                onClick={() => handleSupport(coach.code)}
              >
                Apoyar Coach
              </button>
            </div>
          ))}
        </section>

        <section className={styles.joinSection}>
          <h2>¿Quieres ser un Supplymax Coach?</h2>
          <p>
            Únete a nuestro programa de influencers, comparte nuestra visión y gana comisiones automáticas (Tokens Supplymax) por cada venta generada con tu código o enlace exclusivo.
          </p>
          <button className={styles.joinBtn} onClick={() => router.push('/login')}>
            Aplicar al Programa Nivel 1
          </button>
        </section>
      </main>
    </div>
  );
}
