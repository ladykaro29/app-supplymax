'use client';

import React from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import DashboardSidebar from '@/components/DashboardSidebar/DashboardSidebar';
import { useAppContext } from '@/context/AppContext';
import styles from '../Profile.module.css';

export default function OrdersPage() {
  const { user, orders, formatPrice } = useAppContext();

  if (!user) return null;

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.dashboardLayout}>
        <DashboardSidebar />
        
        <main className={styles.content}>
          <header className={styles.pageHeader}>
             <h1>MIS <span>PEDIDOS</span></h1>
             <p>HISTORIAL COMPLETO DE TUS COMPRAS</p>
          </header>

          <section className={styles.ordersSection}>
             {orders.length === 0 ? (
               <div className={styles.empty}>
                 <p>No tienes pedidos registrados.</p>
               </div>
             ) : (
               <div className={styles.ordersList}>
                 {orders.map(order => (
                   <div key={order.id} className={`${styles.infoCard} glass`}>
                      <div className={styles.orderHeaderCompact}>
                         <strong>#{order.id}</strong>
                         <span className={styles.statusBadge}>{order.status}</span>
                      </div>
                      <div className={styles.itemListCompact}>
                         {order.items.map((item, idx) => (
                           <div key={idx} className={styles.itemRow}>
                              <span>{item.name} x{item.quantity}</span>
                              <span>{formatPrice(item.price * item.quantity)}</span>
                           </div>
                         ))}
                      </div>
                      <div className={styles.orderTotal}>
                         <span>Total del Pedido</span>
                         <strong>{formatPrice(order.total)}</strong>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
