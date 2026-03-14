'use client';

import React from 'react';
import Header from '@/components/Header/Header';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import styles from './Login.module.css';

export default function LoginPage() {
  const { login } = useAppContext();
  const router = useRouter();

  const handleMockLogin = (role: any) => {
    login(role);
    if (role === 'Influencer') {
      router.push('/dashboard/influencer');
    } else if (role === 'Admin') {
      router.push('/dashboard/admin');
    } else {
      router.push('/');
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.loginCardOuter}>
        <div className={`${styles.loginCard} glass`}>
          <h1>Bienvenido a <span>Supplymax</span></h1>
          <p>Tu rendimiento empieza aquí.</p>
          
          <div className={styles.socialButtons}>
            <button className={styles.googleBtn} onClick={() => handleMockLogin('User')}>
              <img src="https://www.google.com/favicon.ico" alt="Google" />
              Continuar con Google
            </button>
            <button className={styles.facebookBtn} onClick={() => handleMockLogin('User')}>
              <img src="https://www.facebook.com/favicon.ico" alt="FB" />
              Continuar con Facebook
            </button>
          </div>

          <div className={styles.divider}>
            <span>O accede como</span>
          </div>

          <div className={styles.roleButtons}>
            <button className={`${styles.roleBtn} glass`} onClick={() => handleMockLogin('Influencer')}>
              Soy Influencer
            </button>
            <button className={`${styles.roleBtn} glass`} onClick={() => handleMockLogin('Admin')}>
              Admin (Demo)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
