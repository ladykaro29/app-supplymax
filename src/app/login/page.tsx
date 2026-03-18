'use client';

import React, { useState } from 'react';
import Header from '@/components/Header/Header';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import styles from './Login.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAppContext();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple logic for the demo: 
    // admin@supplymax.com -> Admin
    // influencer@supplymax.com -> Influencer
    // anyone else -> User
    
    if (email === 'admin@supplymax.com' && password === 'admin123') {
      login('Admin');
      router.push('/admin/applications');
    } else if (email === 'influencer@supplymax.com' && password === 'pass123') {
      login('Influencer');
      router.push('/dashboard/influencer');
    } else {
      login('User');
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
          
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label>Usuario o Email</label>
              <input 
                type="text" 
                placeholder="Tu nombre de usuario o email (ej: admin@supplymax.com)" 
                className={styles.input} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Contraseña</label>
              <input 
                type="password" 
                placeholder="Tu contraseña (ej: admin123)" 
                className={styles.input} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <span className={styles.forgot}>¿Olvidaste tu contraseña?</span>
            
            <button className={styles.submitBtn} type="submit">
              INICIAR SESIÓN
            </button>
          </form>

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
