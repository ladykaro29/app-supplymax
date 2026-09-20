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
    idType: 'V',
    idNumber: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    newsletter: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!formData.idNumber.trim()) {
      setError('Por favor ingresa tu número de Cédula o RIF');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Por favor ingresa tu número telefónico');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const fullIdNumber = `${formData.idType}-${formData.idNumber.trim()}`;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          idNumber: fullIdNumber,
          newsletter: formData.newsletter
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
              <label>Nombre y Apellido</label>
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
              <label>Cédula de Identidad / RIF</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  className={styles.input}
                  style={{ width: '80px', padding: '10px' }}
                  value={formData.idType}
                  onChange={(e) => setFormData({...formData, idType: e.target.value})}
                >
                  <option value="V">V-</option>
                  <option value="E">E-</option>
                  <option value="J">J-</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Número de cédula (Ej. 12345678)" 
                  className={styles.input} 
                  required
                  value={formData.idNumber}
                  onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Teléfono Móvil / WhatsApp</label>
              <input 
                type="tel" 
                placeholder="Ej. 0414-1234567" 
                className={styles.input} 
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Correo Electrónico</label>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px', marginBottom: '15px' }}>
              <input 
                type="checkbox" 
                id="newsletterCheck"
                checked={formData.newsletter}
                onChange={(e) => setFormData({...formData, newsletter: e.target.checked})}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
              />
              <label htmlFor="newsletterCheck" style={{ fontSize: '0.85rem', color: '#ccc', cursor: 'pointer' }}>
                Deseo recibir promociones, novedades y boletín informativo de SupplyMax
              </label>
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
