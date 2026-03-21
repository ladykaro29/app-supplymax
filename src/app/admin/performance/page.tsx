'use client';

import React, { useMemo } from 'react';
import Header from '@/components/Header/Header';
import { useAppContext } from '@/context/AppContext';
import { PRODUCTS } from '@/data/products';
import styles from './Performance.module.css';

export default function PerformancePage() {
  const { user, formatPrice } = useAppContext();

  // Redirect or block if not authorized
  const allowedRoles = ['Admin', 'Subgerente']; // Managers/Admins only
  if (!user || !allowedRoles.includes(user.role_id)) {
    return (
      <div className={styles.unauthorized}>
        <Header />
        <h1>Acceso Denegado</h1>
        <p>Esta sección es solo para la gerencia de Supplymax.</p>
      </div>
    );
  }

  // Mocking sales data for demonstration (normally this comes from real orders)
  const productPerformance = useMemo(() => {
    return PRODUCTS.map((p, idx) => {
      const sold = (idx + 1) * 25 + Math.floor(Math.random() * 50); // Mock sold
      const profitPerUnit = p.purchasePrice ? (p.price - p.purchasePrice) : (p.price * 0.4);
      const totalProfit = sold * profitPerUnit;
      return {
        ...p,
        unitsSold: sold,
        totalProfit: totalProfit,
        profitMargin: (profitPerUnit / p.price) * 100
      };
    }).sort((a, b) => b.unitsSold - a.unitsSold); // Sort by most sold
  }, []);

  const mostSold = productPerformance[0];
  const leastSold = productPerformance[productPerformance.length - 1];
  const highestProfit = [...productPerformance].sort((a, b) => b.totalProfit - a.totalProfit)[0];
  
  // "Winner" = Most Profit + High Sold
  const winner = highestProfit;
  // "Loser" = Least Sold or low/negative profit
  const loser = leastSold;

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>Rendimiento de <span>Productos</span></h1>
          <p>Métricas clave del mes actual</p>
        </header>

        {/* Top Metrics Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Más Vendido</h3>
            <div className={styles.statValue}>{mostSold.name}</div>
            <p>{mostSold.unitsSold} unidades</p>
          </div>
          <div className={styles.statCard}>
            <h3>Mayor Ganancia (Esete Mes)</h3>
            <div className={`${styles.statValue} ${styles.green}`}>{formatPrice(highestProfit.totalProfit)}</div>
            <p>{highestProfit.name}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Producto "Winner"</h3>
            <div className={`${styles.statValue} ${styles.green}`}>🏆 {winner.name}</div>
          </div>
          <div className={styles.statCard}>
            <h3>Producto estancado</h3>
            <div className={`${styles.statValue} ${styles.red}`}>{leastSold.name}</div>
            <p>{leastSold.unitsSold} uds. (Invertir en marketing)</p>
          </div>
          <div className={styles.statCard}>
            <h3>Producto "Loser"</h3>
            <div className={`${styles.statValue} ${styles.red}`}>📉 {loser.name}</div>
          </div>
        </div>

        {/* List of Products Table */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <h2>Análisis de Catálogo</h2>
            <span className={styles.badge}>Filtrado Mensual</span>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Unidades Vendidas</th>
                  <th>Inversión (Costo)</th>
                  <th>Ganancia Total</th>
                  <th>Margen %</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {productPerformance.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.productCell}>
                        <img src={p.image} className={styles.productThumb} alt="" />
                        {p.name}
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td>{p.unitsSold}</td>
                    <td>{formatPrice((p.purchasePrice || (p.price * 0.6)) * p.unitsSold)}</td>
                    <td className={styles.trendingUp}>{formatPrice(p.totalProfit)}</td>
                    <td>{p.profitMargin.toFixed(1)}%</td>
                    <td>
                      <span className={`${styles.badge} ${p.unitsSold > 50 ? styles.green : p.unitsSold < 20 ? styles.red : ''}`}>
                        {p.unitsSold > 50 ? 'En Tendencia' : p.unitsSold < 20 ? 'Baja Rotación' : 'Estable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Orders Database (Mock) */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <h2>Base de Datos de Pedidos (Reporte)</h2>
            <button className={styles.badge}>Exportar CSV</button>
          </div>
          <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '15px' }}>
            Listado completo de pedidos semanales/mensuales para auditoría.
          </p>
          <div className={styles.tableWrapper}>
             <table className={styles.table}>
                <thead>
                   <tr>
                      <th>ID Pedido</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Método Pago</th>
                      <th>Total USD</th>
                      <th>Total VES</th>
                   </tr>
                </thead>
                <tbody>
                   {[1, 2, 3, 4, 5].map(i => (
                     <tr key={i}>
                        <td>#ORD-{3450 + i}</td>
                        <td>21/03/2026</td>
                        <td>Entregado</td>
                        <td>Pago Móvil</td>
                        <td>$85.50</td>
                        <td>Bs. 5,130.00</td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </section>
      </main>
    </div>
  );
}
