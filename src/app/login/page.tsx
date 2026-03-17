'use client';

import React from 'react';
import Header from '@/components/Header/Header';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import styles from './Login.module.css';
import Image from 'next/image';
import Link from 'next/link';

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
        <div className={styles.loginCard}>
          <div className={styles.logoGlow}>
             <Image src="/logo.jpg" alt="Logo" width={60} height={60} />
          </div>
          <h1>Iniciar Sesión</h1>
          <p>Accede a tu cuenta de Supply Max</p>
          
          <div className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Usuario o Email</label>
              <input type="text" placeholder="Tu nombre de usuario o email" className={styles.input} />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Contraseña</label>
              <input type="password" placeholder="Tu contraseña" className={styles.input} />
            </div>
            
            <span className={styles.forgot}>¿Olvidaste tu contraseña?</span>
            
            <button className={styles.submitBtn} onClick={() => handleMockLogin('User')}>
              INICIAR SESIÓN
            </button>
          </div>

          <div className={styles.roleSection}>
            <h4>¿Quieres ser parte del equipo?</h4>
            <div className={styles.roleButtons}>
              <Link href="/join-team" className={styles.roleBtn}>
                🏆 Ser Coach Supply
              </Link>
              <Link href="/join-team" className={styles.roleBtn}>
                💰 Ser Afiliado Supply
              </Link>
            </div>
          </div>

          <div className={styles.register}>
            ¿No tienes cuenta? <span>Crear Cuenta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
