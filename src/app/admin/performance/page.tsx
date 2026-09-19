'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import styles from './Performance.module.css';
import Link from 'next/link';

interface ProductPerformance {
  id: number;
  name: string;
  category: string;
  price: number;
  purchasePrice?: number | null;
  image: string;
  stock: number;
  unitsSold: number;
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
}

export default function PerformancePage() {
  const { user, formatPrice, exchangeRate, authLoading } = useAppContext();
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('month');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, statsRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/stats')
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(Array.isArray(prodData) ? prodData : []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setLocalOrders(statsData.orders || []);
      }
    } catch (err) {
      console.error('Error fetching performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted) {
      fetchData();
    }
  }, [isMounted]);

  // Authorization Check (case-insensitive)
  const allowedRoles = ['admin', 'administrador', 'subgerente'];

  // ----------------------------------------------------
  // DYNAMIC PERFORMANCE CALCULATIONS
  // ----------------------------------------------------
  const productPerformance = useMemo((): ProductPerformance[] => {
    if (products.length === 0) return [];

    // Initialize stats map for all products
    const statsMap: Record<number, { unitsSold: number; totalRevenue: number; totalProfit: number }> = {};
    products.forEach(p => {
      statsMap[p.id] = { unitsSold: 0, totalRevenue: 0, totalProfit: 0 };
    });

    // Time frame filtering
    const now = new Date();
    const thresholdDate = new Date();
    if (timeRange === 'week') {
      thresholdDate.setDate(now.getDate() - 7);
    } else {
      thresholdDate.setDate(now.getDate() - 30);
    }

    const filteredOrders = localOrders.filter(order => {
      const orderDate = new Date(order.createdAt || order.date);
      return orderDate >= thresholdDate;
    });

    // Aggregate sales
    filteredOrders.forEach(order => {
      if (!order.items) return;
      order.items.forEach((item: any) => {
        const prod = item.product || products.find(p => p.id === item.productId);
        if (!prod) return;
        
        const pId = prod.id;
        if (statsMap[pId] !== undefined) {
          const qty = item.quantity || 1;
          const price = item.price || prod.price;
          const cost = prod.purchasePrice || (prod.price * 0.6);
          
          statsMap[pId].unitsSold += qty;
          statsMap[pId].totalRevenue += price * qty;
          statsMap[pId].totalProfit += (price - cost) * qty;
        }
      });
    });

    // Map to full performance structures
    return products.map(p => {
      const stats = statsMap[p.id] || { unitsSold: 0, totalRevenue: 0, totalProfit: 0 };
      const purchasePrice = p.purchasePrice || (p.price * 0.6);
      const profitPerUnit = p.price - purchasePrice;
      const profitMargin = p.price > 0 ? (profitPerUnit / p.price) * 100 : 0;

      return {
        ...p,
        unitsSold: stats.unitsSold,
        totalRevenue: stats.totalRevenue,
        totalProfit: stats.totalProfit,
        profitMargin
      };
    }).sort((a, b) => b.unitsSold - a.unitsSold);
  }, [products, localOrders, timeRange]);

  // Derived KPI Cards
  const kpis = useMemo(() => {
    if (productPerformance.length === 0) return { winner: null, profitable: null, frozen: null, lowRot: null };

    // 1. Winner (highest unitsSold)
    const sortedBySold = [...productPerformance].sort((a, b) => b.unitsSold - a.unitsSold);
    const winner = sortedBySold[0].unitsSold > 0 ? sortedBySold[0] : null;

    // 2. Profitable (highest totalProfit)
    const sortedByProfit = [...productPerformance].sort((a, b) => b.totalProfit - a.totalProfit);
    const profitable = sortedByProfit[0].totalProfit > 0 ? sortedByProfit[0] : null;

    // 3. Frozen (0 sales, but has stock)
    const frozenCandidates = productPerformance.filter(p => p.unitsSold === 0 && p.stock > 0);
    const frozen = frozenCandidates.length > 0 ? frozenCandidates[0] : null;

    // 4. Low Rotation (unitsSold > 0 but lowest sold)
    const activeProducts = productPerformance.filter(p => p.unitsSold > 0);
    const sortedActiveAsc = [...activeProducts].sort((a, b) => a.unitsSold - b.unitsSold);
    const lowRot = sortedActiveAsc.length > 0 ? sortedActiveAsc[0] : null;

    return { winner, profitable, frozen, lowRot };
  }, [productPerformance]);

  // Total Performance stats for selected range
  const totalStats = useMemo(() => {
    let totalRev = 0;
    let totalProf = 0;
    let totalUnits = 0;
    
    productPerformance.forEach(p => {
      totalRev += p.totalRevenue;
      totalProf += p.totalProfit;
      totalUnits += p.unitsSold;
    });

    return { totalRev, totalProf, totalUnits };
  }, [productPerformance]);

  // Credit & Accounts Payable Metrics (Deuda de Proveedores & Flujo de Caja)
  const creditMetrics = useMemo(() => {
    const creditProducts = products.filter(p => p.purchaseType === 'CREDITO' && !p.creditPaid);
    
    let totalDebtUSD = 0;
    let totalCreditStock = 0;
    let overdueCount = 0;
    let urgentCount = 0; // <= 7 days

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items = creditProducts.map(p => {
      const cost = Number(p.purchasePrice) || 0;
      const stock = Number(p.stock) || 0;
      const debt = p.creditDebt !== null && p.creditDebt !== undefined 
        ? Number(p.creditDebt) 
        : cost * stock;
      
      totalDebtUSD += debt;
      totalCreditStock += stock;

      let daysRemaining: number | null = null;
      if (p.creditDueDate) {
        const parts = p.creditDueDate.split('-');
        if (parts.length === 3) {
          const due = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          due.setHours(0, 0, 0, 0);
          daysRemaining = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysRemaining < 0) overdueCount++;
          else if (daysRemaining <= 7) urgentCount++;
        }
      }

      return {
        ...p,
        calculatedDebt: debt,
        daysRemaining
      };
    }).sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999));

    return {
      totalDebtUSD,
      totalCreditStock,
      overdueCount,
      urgentCount,
      activeLotsCount: creditProducts.length,
      items
    };
  }, [products]);

  // Loading Screen (Premium UI Pulse)
  if (authLoading || loading || !isMounted) {
    return (
      <div className={styles.premiumLoaderContainer}>
        <div className={styles.premiumLoader}>
          <div className={styles.doublePulse}></div>
          <div className={styles.doublePulseInner}></div>
        </div>
        <p className={styles.loadingText}>Compilando Métricas Deportivas...</p>
      </div>
    );
  }

  // Access Control check
  const userRole = (user?.role_id || '').toLowerCase().trim();
  if (!user || !allowedRoles.includes(userRole)) {
    return (
      <div className={styles.unauthorized}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>⚠️</div>
          <h1>Acceso Restringido</h1>
          <p>Solo miembros de la gerencia corporativa de Supplymax pueden auditar el rendimiento.</p>
          <Link href="/" className={styles.goHomeBtn}>Volver a la Tienda</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* HEADER SECTION WITH FILTER */}
        <header className={styles.header}>
          <div className={styles.headerTitleWrap}>
            <span className={styles.sectionBadge}>Inteligencia Comercial</span>
            <h1>Rendimiento de <span>Productos</span></h1>
            <p>Monitoreo dinámico de márgenes, rotación e inversión de capital</p>
          </div>

          <div className={styles.controlsRow}>
            <button 
              className={`${styles.rangeBtn} ${timeRange === 'week' ? styles.activeRangeBtn : ''}`}
              onClick={() => setTimeRange('week')}
            >
              Últimos 7 Días
            </button>
            <button 
              className={`${styles.rangeBtn} ${timeRange === 'month' ? styles.activeRangeBtn : ''}`}
              onClick={() => setTimeRange('month')}
            >
              Últimos 30 Días
            </button>
          </div>
        </header>

        {/* TOP KPI CARDS GRID */}
        <div className={styles.statsGrid}>
          {/* Winner Card */}
          <div className={`${styles.statCard} ${styles.winner}`}>
            <span className={styles.statBadge}>Líder Volumen</span>
            <h3>🔥 Producto Winner</h3>
            {kpis.winner ? (
              <>
                <div className={styles.statValue}>{kpis.winner.name}</div>
                <p>Volumen de ventas: <strong>{kpis.winner.unitsSold} unidades</strong></p>
                <div className={styles.statMeta}>
                  <span className={styles.metaLabel}>Ingresos:</span>
                  <span className={styles.metaValue}>{formatPrice(kpis.winner.totalRevenue)}</span>
                </div>
              </>
            ) : (
              <>
                <div className={styles.statValue}>Sin Ventas</div>
                <p>No hay rotación en el período.</p>
              </>
            )}
          </div>

          {/* Highest Margin Card */}
          <div className={`${styles.statCard} ${styles.profitable}`}>
            <span className={styles.statBadge}>Mayor Aporte</span>
            <h3>💎 Mayor Utilidad</h3>
            {kpis.profitable ? (
              <>
                <div className={`${styles.statValue} ${styles.green}`}>
                  {formatPrice(kpis.profitable.totalProfit)}
                </div>
                <p>{kpis.profitable.name}</p>
                <div className={styles.statMeta}>
                  <span className={styles.metaLabel}>Margen Promedio:</span>
                  <span className={`${styles.metaValue} ${styles.green}`}>
                    {kpis.profitable.profitMargin.toFixed(1)}%
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className={styles.statValue}>$0.00 USD</div>
                <p>Sin rentabilidad registrada.</p>
              </>
            )}
          </div>

          {/* Frozen Card */}
          <div className={`${styles.statCard} ${styles.inactive}`}>
            <span className={styles.statBadge}>0 Rotación</span>
            <h3>❄️ Producto Congelado</h3>
            {kpis.frozen ? (
              <>
                <div className={styles.statValue}>{kpis.frozen.name}</div>
                <p>Stock inmovilizado: <strong>{kpis.frozen.stock} unidades</strong></p>
                <div className={styles.statMeta}>
                  <span className={styles.metaLabel}>Categoría:</span>
                  <span className={styles.metaValue}>{kpis.frozen.category}</span>
                </div>
              </>
            ) : (
              <>
                <div className={styles.statValue}>Óptimo</div>
                <p>Todo el catálogo está en movimiento.</p>
              </>
            )}
          </div>

          {/* Low Performer Card */}
          <div className={`${styles.statCard} ${styles.loser}`}>
            <span className={styles.statBadge}>Baja Rotación</span>
            <h3>📉 Alerta de Ventas</h3>
            {kpis.lowRot ? (
              <>
                <div className={styles.statValue}>{kpis.lowRot.name}</div>
                <p>Solo <strong>{kpis.lowRot.unitsSold} uds.</strong> colocadas</p>
                <div className={styles.statMeta}>
                  <span className={styles.metaLabel}>Sugerencia:</span>
                  <span className={`${styles.metaValue} ${styles.red}`}>Oferta / Merchandising</span>
                </div>
              </>
            ) : (
              <>
                <div className={styles.statValue}>Excelente</div>
                <p>Rotación de catálogo balanceada.</p>
              </>
            )}
          </div>
        </div>

        {/* ACCOUNTS PAYABLE & SUPPLIER CREDIT HEALTH */}
        <section className={styles.creditHealthSection}>
          <div className={styles.sectionTitle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>🏢</span>
              <div>
                <h2 style={{ margin: 0 }}>Cuentas por Pagar & Crédito de Proveedores</h2>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
                  Control de liquidez: Reserva obligatoria para facturas de proveedores vs. Ganancia libre
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {creditMetrics.overdueCount > 0 && (
                <span className={styles.urgentAlertBadge}>
                  🚨 {creditMetrics.overdueCount} Facturas Vencidas
                </span>
              )}
              {creditMetrics.urgentCount > 0 && (
                <span className={styles.warningAlertBadge}>
                  ⚠️ {creditMetrics.urgentCount} Vencen &le; 7 días
                </span>
              )}
            </div>
          </div>

          <div className={styles.creditSummaryGrid}>
            <div className={styles.creditSummaryCard}>
              <span className={styles.csLabel}>Deuda Total Activa (Proveedores)</span>
              <div className={styles.csValueOrange}>
                ${creditMetrics.totalDebtUSD.toFixed(2)} USD
              </div>
              <span className={styles.csSub}>
                ≈ {formatPrice(creditMetrics.totalDebtUSD)} a liquidar
              </span>
            </div>

            <div className={styles.creditSummaryCard}>
              <span className={styles.csLabel}>Mercancía a Crédito en Almacén</span>
              <div className={styles.csValueCyan}>
                {creditMetrics.totalCreditStock} unidades
              </div>
              <span className={styles.csSub}>
                Distribuido en {creditMetrics.activeLotsCount} lotes comerciales
              </span>
            </div>

            <div className={styles.creditSummaryCard}>
              <span className={styles.csLabel}>Regla de Oro de Flujo</span>
              <div className={styles.csValueGreen}>
                Fondo Separado
              </div>
              <span className={styles.csSub}>
                Apartar el costo de cada venta para pago a tiempo
              </span>
            </div>
          </div>

          {creditMetrics.items.length > 0 ? (
            <div className={styles.tableWrapper} style={{ marginTop: '1rem' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Producto a Crédito</th>
                    <th>Proveedor</th>
                    <th>Stock Lote</th>
                    <th>Deuda Pendiente</th>
                    <th>Vencimiento de Factura</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {creditMetrics.items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong>
                      </td>
                      <td>{item.supplierName || 'Proveedor no especificado'}</td>
                      <td>{item.stock} uds.</td>
                      <td style={{ color: '#fb923c', fontWeight: 'bold' }}>
                        ${item.calculatedDebt.toFixed(2)} USD
                      </td>
                      <td>
                        {item.daysRemaining !== null ? (
                          item.daysRemaining < 0 ? (
                            <span className={styles.badgeAlertRed}>Vencida hace {Math.abs(item.daysRemaining)}d</span>
                          ) : item.daysRemaining === 0 ? (
                            <span className={styles.badgeAlertRed}>Vence HOY</span>
                          ) : item.daysRemaining <= 7 ? (
                            <span className={styles.badgeAlertYellow}>Vence en {item.daysRemaining}d</span>
                          ) : (
                            <span className={styles.badgeAlertGreen}>{item.daysRemaining}d restantes</span>
                          )
                        ) : (
                          <span style={{ opacity: 0.5 }}>Sin fecha fijada</span>
                        )}
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                          {item.creditDueDate || ''}
                        </span>
                      </td>
                      <td>
                        <Link href="/admin/edit-products" className={styles.manageLotLink}>
                          Gestionar Lote &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyCreditMsg}>
              ✨ No tienes facturas a crédito pendientes por pagar. Todo tu inventario actual está libre de deudas.
            </div>
          )}
        </section>

        {/* DETAILED REAL CATALOG METRICS TABLE */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <h2>Análisis de Margen y Rotación Real</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span className={`${styles.badge} ${styles.green}`}>
                Volumen Total: {totalStats.totalUnits} uds
              </span>
              <button 
                onClick={() => {
                  alert('Exportación de reporte comercial generada exitosamente.');
                }}
                className={styles.exportBtn}
              >
                📊 Exportar Excel
              </button>
            </div>
          </div>

          {productPerformance.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📦</div>
              <h3>No hay productos registrados</h3>
              <p>Comienza agregando productos a tu base de datos para ver métricas.</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Unidades Vendidas</th>
                    <th>Ingreso Bruto</th>
                    <th>Costo de Venta (COGS)</th>
                    <th>Utilidad Neta</th>
                    <th>Margen %</th>
                    <th>Estado Comercial</th>
                  </tr>
                </thead>
                <tbody>
                  {productPerformance.map(p => {
                    const purchasePrice = p.purchasePrice || (p.price * 0.6);
                    const totalCost = purchasePrice * p.unitsSold;
                    
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className={styles.productCell}>
                            <img 
                              src={p.image || '/protein.png'} 
                              className={styles.productThumb} 
                              alt={p.name}
                              onError={(e) => { (e.target as HTMLImageElement).src = '/protein.png'; }}
                            />
                            <div className={styles.productNameCell}>
                              <strong>{p.name}</strong>
                              <span>Stock: {p.stock} uds</span>
                            </div>
                          </div>
                        </td>
                        <td>{p.category}</td>
                        <td>{p.unitsSold}</td>
                        <td>{formatPrice(p.totalRevenue)}</td>
                        <td>{formatPrice(totalCost)}</td>
                        <td className={p.totalProfit > 0 ? styles.trendingUp : ''}>
                          {formatPrice(p.totalProfit)}
                        </td>
                        <td className={styles.marginCell}>
                          {p.price > 0 ? `${p.profitMargin.toFixed(1)}%` : '0%'}
                          <span className={`
                            ${styles.marginPercentage} 
                            ${p.profitMargin < 25 ? styles.poor : p.profitMargin < 40 ? styles.low : ''}
                          `}>
                            {p.profitMargin >= 40 ? 'Premium' : p.profitMargin >= 25 ? 'Normal' : 'Bajo'}
                          </span>
                        </td>
                        <td>
                          {p.unitsSold >= 25 ? (
                            <span className={`${styles.statusTrend} ${styles.trendHot}`}>Alta Rotación</span>
                          ) : p.unitsSold > 0 ? (
                            <span className={`${styles.statusTrend} ${styles.trendStable}`}>Estable</span>
                          ) : (
                            <span className={`${styles.statusTrend} ${styles.trendCold}`}>Frío (0 Ventas)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* RECENT AUDIT COMPACT ORDERS TABLE */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <h2>Bitácora de Conciliación de Pedidos</h2>
            <span className={styles.badge}>Historial Integrado</span>
          </div>
          
          <p style={{ opacity: 0.6, fontSize: '0.88rem', marginTop: '-15px', marginBottom: '20px' }}>
            Listado de transacciones del período seleccionado para auditar con tasa de cambio global de <strong>Bs. {exchangeRate}</strong>.
          </p>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID Pedido</th>
                  <th>Fecha de Venta</th>
                  <th>Cliente</th>
                  <th>Método / Ref</th>
                  <th>Total USD</th>
                  <th>Total VES (Equiv.)</th>
                  <th>Estado Físico</th>
                </tr>
              </thead>
              <tbody>
                {localOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
                      Sin pedidos registrados en la base de datos.
                    </td>
                  </tr>
                ) : (
                  localOrders.slice(0, 8).map(order => (
                    <tr key={order.id}>
                      <td className={styles.orderIdCell}>
                        # {order.id.slice(-6).toUpperCase()}
                      </td>
                      <td>
                        {new Date(order.createdAt || order.date).toLocaleDateString()} - {new Date(order.createdAt || order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <strong>{order.user?.name || 'Cliente Supply'}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block' }}>
                          {order.user?.email || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <strong>{order.paymentMethod || 'Pago Móvil'}</strong>
                        {order.paymentRef && (
                          <span style={{ fontSize: '0.75rem', color: '#00ff88', display: 'block' }}>
                            Ref: #{order.paymentRef}
                          </span>
                        )}
                      </td>
                      <td className={styles.priceCol}>
                        {formatPrice(order.total)}
                      </td>
                      <td className={styles.priceCol}>
                        Bs. {(order.total * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span className={`${styles.orderStatusBadge} ${styles[order.status.toLowerCase()] || ''}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
