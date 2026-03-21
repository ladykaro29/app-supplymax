'use client';

import React, { useState } from 'react';
import Header from '@/components/Header/Header';
import { useAppContext } from '@/context/AppContext';
import styles from './Admin.module.css';

export default function AdminDashboard() {
  const { user, orders, exchangeRate, setExchangeRate, formatPrice } = useAppContext();
  
  // Local state for the admin controls
  const [newRate, setNewRate] = useState<string>(exchangeRate.toString());
  const [localOrders, setLocalOrders] = useState(orders);

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

  const verifyOrder = (orderId: string) => {
    setLocalOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'Verificado' } : order
    ));
    // In a real app, this would also update the AppContext/Backend
  };

  // Calculate stats
  const pendingOrders = localOrders.filter(o => o.status === 'Pendiente');
  const totalSalesUSD = localOrders.reduce((sum, order) => sum + order.total, 0);

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
                <strong>{formatPrice(totalSalesUSD)}</strong>
              </div>
              <div className={styles.statBox}>
                <span>Ventas (VES aprox)</span>
                <strong>Bs. {(totalSalesUSD * exchangeRate).toLocaleString('es-VE')}</strong>
              </div>
              <div className={styles.statBox}>
                <span>Órdenes Pendientes</span>
                <strong className={styles.pendingNumber}>{pendingOrders.length}</strong>
              </div>
            </div>
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
