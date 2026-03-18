'use client';

import React, { useState } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import DashboardSidebar from '@/components/DashboardSidebar/DashboardSidebar';
import { useAppContext } from '@/context/AppContext';
import styles from './Profile.module.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, logout, orders, formatPrice, addAddress, removeAddress } = useAppContext();
  const router = useRouter();

  // State for adding address
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [newAddrValue, setNewAddrValue] = useState('');

  if (!user) {
    if (typeof window !== 'undefined') router.push('/login');
    return null;
  }

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAddrLabel && newAddrValue) {
      addAddress(newAddrLabel, newAddrValue);
      setNewAddrLabel('');
      setNewAddrValue('');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.dashboardLayout}>
        <DashboardSidebar />
        
        <main className={styles.content}>
          {/* 1. Identity Header */}
          <header className={styles.identityHeader}>
             <div className={styles.avatar}>
               {user.name.charAt(0).toUpperCase()}
             </div>
             <div className={styles.userInfo}>
                <h1>{user.name.toUpperCase()}</h1>
                <span className={styles.roleBadge}>{user.role_id}</span>
                {user.sub_level && <span className={styles.subLevel}>{user.sub_level}</span>}
             </div>
          </header>

          {/* 2. Activity / Order History */}
          <section className={styles.sectionCard}>
             <div className={styles.sectionHeader}>
                <h2>Historial de Pedidos</h2>
                <button className={styles.viewMore} onClick={() => router.push('/profile/orders')}>VER TODO</button>
             </div>
             <div className={styles.orderList}>
                {orders.length > 0 ? (
                  orders.slice(0, 3).map((order) => (
                    <div key={order.id} className={styles.orderItem}>
                      <div>
                        <strong>PEDIDO #{order.id}</strong>
                        <p style={{fontSize: '0.8rem', color: 'gray'}}>{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <span className={styles.status}>{order.status}</span>
                      <strong>{formatPrice(order.total)}</strong>
                    </div>
                  ))
                ) : (
                  <p style={{color: 'gray', textAlign: 'center', padding: '1rem'}}>Aún no tienes pedidos registrados.</p>
                )}
             </div>
          </section>

          {/* 3. Configuration / Addresses */}
          <section className={styles.sectionCard}>
             <div className={styles.sectionHeader}>
                <h2>Gestión de Direcciones</h2>
             </div>
             <div className={styles.addressGrid}>
                {user.addresses.map((addr) => (
                   <div key={addr.id} className={styles.addressCard}>
                      <h4>{addr.label}</h4>
                      <p>{addr.value}</p>
                      <button className={styles.removeAddressBtn} onClick={() => removeAddress(addr.id)}>ELIMINAR</button>
                   </div>
                ))}
             </div>
             
             <form className={styles.addAddressForm} onSubmit={handleAddAddress}>
                <input 
                  type="text" 
                  placeholder="Etiqueta (Casa, Ofi...)" 
                  className={styles.input}
                  value={newAddrLabel}
                  onChange={(e) => setNewAddrLabel(e.target.value)}
                  required
                />
                <input 
                  type="text" 
                  placeholder="Dirección exacta..." 
                  className={styles.input}
                  value={newAddrValue}
                  onChange={(e) => setNewAddrValue(e.target.value)}
                  required
                />
                <button type="submit" className={styles.addBtn}>AÑADIR NUEVA</button>
             </form>
          </section>

          {/* 4. Specialization (Conditional) */}
          
          {/* Case: Influencer / Afiliado */}
          {user.role_id === 'Influencer' && (
            <section className={styles.tokensWallet}>
               <div className={styles.tokenBalance}>
                  <h3>MI BILLETERA SUPPLY</h3>
                  <div className={styles.tokenAmount}>
                    {user.tokens?.toLocaleString() || '0'} <span>TOKENS</span>
                  </div>
                  <p style={{fontSize: '0.85rem', color: '#00e5ff', marginTop: '10px'}}>Equivalente a {formatPrice((user.tokens || 0) / 100)} de crédito.</p>
               </div>
               <div className={styles.affiliateBox}>
                  <span className={styles.affiliateLabel}>MI CÓDIGO DE AFILIADO:</span>
                  <div className={styles.affiliateCode}>{user.affiliate_code || 'SIN CÓDIGO'}</div>
                  <p style={{fontSize: '0.7rem', marginTop: '10px', color: 'gray'}}>Comparte este código para ganar comisiones.</p>
               </div>
            </section>
          )}

          {/* Case: Coach N2 Premium */}
          {user.role_id === 'Coach' && user.coach_tier === 2 && (
            <section className={styles.coachFeaturedCard}>
               <h3>✨ PERFIL COACH PREMIUM ACTIVADO</h3>
               <p>Tu perfil está siendo promocionado en la página principal para captación de nuevos clientes.</p>
               <button className={styles.previewProfileBtn}>VISTA PREVIA DE PERFIL PÚBLICO</button>
            </section>
          )}

          {/* Case: Coach N1 (Normal) - Note shows 10% discount applied */}
          {user.role_id === 'Coach' && (
            <div style={{background: 'rgba(0, 229, 255, 0.05)', padding: '1rem', border: '1px solid var(--color-accent)', borderRadius: '8px', textAlign: 'center'}}>
               <p style={{color: 'var(--color-accent)', fontWeight: 700}}>🛡️ BENEFICIO ACTIVO: 10% de descuento automático en todas tus compras de Coach.</p>
            </div>
          )}

          {/* 5. Security */}
          <footer className={styles.logoutSection}>
             <button className={styles.logoutBtn} onClick={handleLogout}>
               CERRAR SESIÓN DE FORMA SEGURA
             </button>
          </footer>

        </main>
      </div>
      <Footer />
    </div>
  );
}
