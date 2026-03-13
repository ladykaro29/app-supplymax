'use client';

import React from 'react';
import Header from '@/components/Header/Header';
import { useAppContext } from '@/context/AppContext';
import styles from './Profile.module.css';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, orders, formatPrice, addToCart } = useAppContext();
  const router = useRouter();

  if (!user) {
    if (typeof window !== 'undefined') router.push('/login');
    return null;
  }

  // Marketing Automation Logic: Identify if something is likely finished
  const getDaysSince = (dateString: string) => {
    const orderDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - orderDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getReminders = () => {
    const reminders: any[] = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.durationInDays) {
          const daysPassed = getDaysSince(order.date);
          // If 80% of duration has passed, suggest re-buy
          if (daysPassed >= item.durationInDays * 0.8 && daysPassed <= item.durationInDays + 7) {
            reminders.push(item);
          }
        }
      });
    });
    return reminders;
  };

  const activeReminders = getReminders();

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Mi <span>Perfil</span></h1>
        </div>

        {activeReminders.length > 0 && (
          <section className={styles.reminderSection}>
            <div className={`${styles.reminderCard} glass glow`}>
              <div className={styles.reminderText}>
                <h3>📦 ¡Hora de reponer tus suplementos!</h3>
                <p>Basado en tu última compra, es probable que tu <strong>{activeReminders[0].name}</strong> esté por terminarse.</p>
              </div>
              <button 
                className={styles.buyNowBtn}
                onClick={() => {
                  addToCart(activeReminders[0]);
                  router.push('/checkout');
                }}
              >
                Volver a comprar
              </button>
            </div>
          </section>
        )}

        <div className={styles.grid}>
          {/* Sidebar */}
          <aside className={`${styles.profileCard} glass`}>
            <div className={styles.avatar}>{user.name[0]}</div>
            <h2>{user.name}</h2>
            <p className={styles.email}>usuario@supplymax.com</p>
            
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span>Pedidos</span>
                <strong>{orders.length}</strong>
              </div>
              <div className={styles.statItem}>
                <span>Estatus</span>
                <strong>Fiel</strong>
              </div>
            </div>
          </aside>

          {/* Orders */}
          <section className={styles.ordersSection}>
            <h2>Historial de Pedidos</h2>
            
            {orders.length === 0 ? (
              <div className={`${styles.emptyOrders} glass`}>
                <p>Aún no has realizado pedidos.</p>
                <button onClick={() => router.push('/catalog')} className={styles.buyNowBtn} style={{ marginTop: '2rem' }}>
                  Ir al catálogo
                </button>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {orders.map(order => (
                  <div key={order.id} className={`${styles.orderCard} glass`}>
                    <div className={styles.orderHeader}>
                      <div>
                        <span className={styles.orderId}>{order.id}</span>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={styles.status}>{order.status}</span>
                    </div>

                    <div className={styles.orderItems}>
                      {order.items.map((item, idx) => (
                        <div key={idx} className={styles.itemLine}>
                          <span>{item.name} x{item.quantity}</span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.orderFooter}>
                      <strong>Total: {formatPrice(order.total)}</strong>
                      <button 
                        className={styles.reorderBtn}
                        onClick={() => {
                          order.items.forEach(item => addToCart(item));
                          router.push('/checkout');
                        }}
                      >
                        Repetir Pedido
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
