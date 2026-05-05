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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      login(data);
      
      // Redirect based on role
      if (data.role_id === 'Admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/profile');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          {error && <div className={styles.errorAlert}>{error}</div>}
          
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
              <div className={styles.passwordWrapper}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Tu contraseña (ej: adminpassword)" 
                  className={styles.input} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            
            <span className={styles.forgot}>¿Olvidaste tu contraseña?</span>
            
            <button className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? 'CARGANDO...' : 'INICIAR SESIÓN'}
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
