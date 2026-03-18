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
    
    // Technical Profile Definitions
    if (email === 'admin@supplymax.com' && password === 'admin123') {
      login({ id: '0', name: 'Admin Master', role_id: 'Admin', status: 'Active' });
      router.push('/admin/applications');
    } else if (email === 'influencer@supplymax.com' && password === 'pass123') {
      login({ 
        id: '1', 
        name: 'Alex Trainer', 
        email: 'alex@supply.com', 
        role_id: 'Influencer', 
        status: 'Active', 
        tokens: 4500, 
        affiliate_code: 'ALEX10' 
      });
      router.push('/profile');
    } else if (email === 'coach@supplymax.com' && password === 'coach123') {
      login({ 
        id: '2', 
        name: 'Coach Pro', 
        email: 'coach@supply.com', 
        role_id: 'Coach', 
        coach_tier: 2, 
        is_featured: true, 
        status: 'Active' 
      });
      router.push('/profile');
    } else {
      login({ 
        id: '100', 
        name: 'Juan Perez', 
        email: email || 'user@email.com', 
        role_id: 'User', 
        status: 'Active' 
      });
      router.push('/profile');
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
