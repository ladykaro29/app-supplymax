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
            <h1>
              MIS <span>PEDIDOS</span>
            </h1>
            <p>HISTORIAL COMPLETO DE TUS COMPRAS</p>
          </header>

          <section className={styles.ordersSection}>
            {!Array.isArray(orders) || orders.length === 0 ? (
              <div className={styles.empty}>
                <p>No tienes pedidos registrados.</p>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {orders.map((order: any) => {
                  const items = Array.isArray(order.items) ? order.items : [];
                  const shortId = order.id ? String(order.id).slice(-6).toUpperCase() : 'ORDEN';
                  const orderDate = order.createdAt || order.date;

                  return (
                    <div key={order.id} className={`${styles.infoCard} glass`}>
                      <div className={styles.orderHeaderCompact}>
                        <div>
                          <strong>Pedido #{shortId}</strong>
                          {orderDate && (
                            <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.65 }}>
                              {new Date(orderDate).toLocaleDateString('es-VE')}
                            </span>
                          )}
                        </div>
                        <span className={styles.statusBadge}>{order.status || 'PENDIENTE'}</span>
                      </div>
                      <div className={styles.itemListCompact}>
                        {items.map((item: any, idx: number) => {
                          const productName =
                            item.product?.name || item.name || 'Producto SupplyMax';
                          const qty = Number(item.quantity) || 1;
                          const unitPrice = Number(item.price) || Number(item.product?.price) || 0;
                          return (
                            <div key={idx} className={styles.itemRow}>
                              <span>
                                {productName} x{qty}
                              </span>
                              <span>{formatPrice(unitPrice * qty)}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className={styles.orderTotal}>
                        <span>Total del Pedido</span>
                        <strong>{formatPrice(order.total || 0)}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
