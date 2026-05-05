'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header/Header';
import { useAppContext } from '@/context/AppContext';
import styles from './Admin.module.css';

export default function AdminDashboard() {
  const { user, orders, exchangeRate, setExchangeRate, formatPrice } = useAppContext();
  
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalSalesUSD: 0, pendingOrdersCount: 0 });
  const [loading, setLoading] = useState(true);
  const [newRate, setNewRate] = useState(exchangeRate.toString());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, remindersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/reminders')
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setLocalOrders(data.orders);
          setStats({
            totalSalesUSD: data.totalSalesUSD,
            pendingOrdersCount: data.pendingOrdersCount
          });
        }

        if (remindersRes.ok) {
          const data = await remindersRes.json();
          setReminders(data);
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!user || user.role_id !== 'Admin') {
    return (
      <div className={styles.unauthorized}>
        <Header />
        <div className={styles.errorContent}>
          <h1>Acceso Restringido</h1>
          <p>Esta sección es solo para el equipo de administración de Supplymax.</p>
        </div>
      </div>
    );
  }

  const handleRateUpdate = () => {
    const rate = parseFloat(newRate);
    if (!isNaN(rate) && rate > 0) {
      setExchangeRate(rate);
      alert(`Tasa actualizada a: ${rate} Bs/$`);
    } else {
      alert('Tasa inválida');
    }
  };

  const verifyOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'VERIFICADO' }),
      });

      if (res.ok) {
        setLocalOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: 'VERIFICADO' } : order
        ));
        setStats(prev => ({ ...prev, pendingOrdersCount: prev.pendingOrdersCount - 1 }));
      }
    } catch (err) {
      console.error('Error verifying order:', err);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>Panel de <span>Administración</span></h1>
          <p>Control central de Supplymax Bimonetario</p>
        </header>

        <div className={styles.grid}>
          {/* Quick Stats & Controls */}
          <div className={styles.controlsSide}>
            <section className={`${styles.controlCard} glass glow`}>
              <h3>⚙️ Tasa de Cambio Global</h3>
              <p>Esta tasa afecta a todo el catálogo al instante.</p>
              
              <div className={styles.rateControl}>
                <div className={styles.rateInputWrap}>
                  <span className={styles.currencyPrefix}>Bs/$</span>
                  <input 
                    type="number" 
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className={styles.rateInput}
                    step="0.01"
                  />
                </div>
                <button 
                  onClick={handleRateUpdate} 
                  className={styles.updateBtn}
                  disabled={parseFloat(newRate) === exchangeRate}
                >
                  Confirmar Tasa
                </button>
              </div>
              <div className={styles.currentRate}>
                Tasa Activa: <strong>{exchangeRate} Bs/$</strong>
              </div>
            </section>

            <div className={`${styles.statsGrid} glass`}>
              <div className={styles.statBox}>
                <span>Ventas (USD)</span>
                <strong>{formatPrice(stats.totalSalesUSD)}</strong>
              </div>
              <div className={styles.statBox}>
                <span>Ventas (VES aprox)</span>
                <strong>Bs. {(stats.totalSalesUSD * exchangeRate).toLocaleString('es-VE')}</strong>
              </div>
              <div className={styles.statBox}>
                <span>Órdenes Pendientes</span>
                <strong className={styles.pendingNumber}>{stats.pendingOrdersCount}</strong>
              </div>
            </div>

            <section className={`${styles.remindersCard} glass`}>
              <h3>🔔 Próximas Recompras</h3>
              <p>Clientes que podrían estar por agotar sus productos.</p>
              
              <div className={styles.remindersList}>
                {reminders.length === 0 ? (
                  <p className={styles.emptySmall}>No hay recordatorios pendientes.</p>
                ) : (
                  reminders.map((rem, idx) => (
                    <div key={idx} className={styles.reminderRow}>
                      <div className={styles.remInfo}>
                        <strong>{rem.userName}</strong>
                        <span>{rem.productName}</span>
                      </div>
                      <div className={`${styles.remBadge} ${styles[rem.status.toLowerCase().replace(' ', '')] || styles.pending}`}>
                        {rem.status} ({rem.daysRemaining}d)
                      </div>
                      <button className={styles.contactBtn}>WhatsApp</button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Orders Management */}
          <div className={styles.ordersSide}>
            <h2>Gestión de Pedidos</h2>
            
            <div className={styles.ordersList}>
              {localOrders.length === 0 ? (
                <p className={styles.emptyMsg}>No hay pedidos en el sistema.</p>
              ) : (
                localOrders.map(order => (
                  <div key={order.id} className={`${styles.orderRow} glass`}>
                    <div className={styles.orderBasic}>
                      <strong>{order.id}</strong>
                      <span className={styles.date}>{new Date(order.date).toLocaleString()}</span>
                    </div>
                    
                    <div className={styles.orderAmount}>
                      {formatPrice(order.total)}
                      <span className={styles.vesAmount}>≈ Bs. {(order.total * exchangeRate).toLocaleString('es-VE')}</span>
                    </div>

                    <div className={styles.orderStatusCell}>
                      <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className={styles.orderActions}>
                      <button className={styles.viewCaptureBtn}>Ver Capture</button>
                      {order.status === 'Pendiente' && (
                        <button 
                          className={styles.verifyBtn}
                          onClick={() => verifyOrder(order.id)}
                        >
                          Verificar Pago
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
