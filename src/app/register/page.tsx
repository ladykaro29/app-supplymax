'use client';

import React, { useState } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import styles from '../login/Login.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
  const { login } = useAppContext();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear cuenta');
      }

      login(data);
      router.push('/profile');
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
          
          <form className={styles.form} onSubmit={handleRegister}>
            <div className={styles.inputGroup}>
              <label>Nombre Completo</label>
              <input 
                type="text" 
                placeholder="Ej. Juan Pérez" 
                className={styles.input} 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Email</label>
              <input 
                type="email" 
                placeholder="tu@email.com" 
                className={styles.input} 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Contraseña</label>
              <input 
                type="password" 
                placeholder="Mínimo 8 caracteres" 
                className={styles.input} 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Confirmar Contraseña</label>
              <input 
                type="password" 
                placeholder="Repite tu contraseña" 
                className={styles.input} 
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
            
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
            </button>
          </form>

          <div className={styles.roleSection}>
            <h4>¿Buscas beneficios profesionales?</h4>
            <div className={styles.roleButtons}>
              <Link href="/coaches" className={styles.roleBtn}>
                🏆 Programa Coaches
              </Link>
              <Link href="/login" className={styles.roleBtn}>
                💰 Ser Afiliado
              </Link>
            </div>
          </div>

          <div className={styles.register}>
            ¿Ya tienes cuenta? <Link href="/login"><span>Iniciar Sesión</span></Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
