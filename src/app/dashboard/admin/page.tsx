'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header/Header';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Admin.module.css';

export default function AdminDashboard() {
  const { user, exchangeRate, setExchangeRate, formatPrice, authLoading } = useAppContext();
  
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalSalesUSD: 0, pendingOrdersCount: 0 });
  const [loading, setLoading] = useState(true);
  
  const [newRate, setNewRate] = useState(exchangeRate.toString());
  const [isSavingRate, setIsSavingRate] = useState(false);
  const [rateSuccessMessage, setRateSuccessMessage] = useState('');
  
  const [selectedCapture, setSelectedCapture] = useState<any | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (exchangeRate) {
      setNewRate(exchangeRate.toString());
    }
  }, [exchangeRate]);

  const fetchData = async () => {
    try {
      const [statsRes, productsRes, remindersRes, appsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/products'),
        fetch('/api/admin/reminders'),
        fetch('/api/applications')
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setLocalOrders(data.orders || []);
        setStats({
          totalSalesUSD: data.totalSalesUSD || 0,
          pendingOrdersCount: data.pendingOrdersCount || 0
        });
      }

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data || []);
      }

      if (remindersRes.ok) {
        const data = await remindersRes.json();
        setReminders(data || []);
      }

      if (appsRes.ok) {
        const data = await appsRes.json();
        setApplications(data || []);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted) {
      fetchData();
    }
  }, [isMounted]);

  // Loading Screen (Premium Visual Experience)
  if (authLoading || loading || !isMounted) {
    return (
      <div className={styles.premiumLoaderContainer}>
        <div className={styles.premiumLoader}>
          <div className={styles.doublePulse}></div>
          <div className={styles.doublePulseInner}></div>
        </div>
        <p className={styles.loadingText}>Sincronizando Sistema SupplyMax...</p>
      </div>
    );
  }

  // Access Control (Admin only)
  if (!user || user.role_id !== 'Admin') {
    return (
      <div className={styles.unauthorized}>
        <Header />
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>⚠️</div>
          <h1>Acceso Restringido</h1>
          <p>Esta sección es de uso exclusivo para el equipo de administración de Supplymax.</p>
          <Link href="/" className={styles.goHomeBtn}>Volver a la Tienda</Link>
        </div>
      </div>
    );
  }

  const handleRateUpdate = async () => {
    const rate = parseFloat(newRate);
    if (!isNaN(rate) && rate > 0) {
      setIsSavingRate(true);
      setRateSuccessMessage('');
      try {
        await setExchangeRate(rate);
        setRateSuccessMessage('Tasa sincronizada en DB SQLite');
        setTimeout(() => setRateSuccessMessage(''), 3000);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSavingRate(false);
      }
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
        setStats(prev => ({ ...prev, pendingOrdersCount: Math.max(0, prev.pendingOrdersCount - 1) }));
      }
    } catch (err) {
      console.error('Error verifying order:', err);
    }
  };

  // ----------------------------------------------------
  // DYNAMIC CALCULATIONS & METRICS (SQLite Data Engine)
  // ----------------------------------------------------
  
  // Aggregate sales by product
  const salesByProduct: Record<string, { product: any; quantity: number; revenue: number; profit: number }> = {};
  
  localOrders.forEach(order => {
    if (!order.items) return;
    order.items.forEach((item: any) => {
      const p = item.product;
      if (!p) return;
      if (!salesByProduct[p.id]) {
        salesByProduct[p.id] = {
          product: p,
          quantity: 0,
          revenue: 0,
          profit: 0
        };
      }
      salesByProduct[p.id].quantity += item.quantity || 1;
      salesByProduct[p.id].revenue += (item.price || p.price) * (item.quantity || 1);
      
      const cost = p.purchasePrice || (p.price * 0.6); // Fallback cost if purchasePrice is missing
      const margin = (item.price || p.price) - cost;
      salesByProduct[p.id].profit += margin * (item.quantity || 1);
    });
  });

  // KPI 1: Winner Product (most units sold)
  let winnerProduct: any = null;
  let maxQty = 0;
  Object.values(salesByProduct).forEach(data => {
    if (data.quantity > maxQty) {
      maxQty = data.quantity;
      winnerProduct = data.product;
    }
  });

  // KPI 2: Most Profitable Product (most total profit generated)
  let profitableProduct: any = null;
  let maxProfit = -Infinity;
  Object.values(salesByProduct).forEach(data => {
    if (data.profit > maxProfit) {
      maxProfit = data.profit;
      profitableProduct = data.product;
    }
  });

  // KPI 3: Frozen Product (0 sales in the last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const soldIn30Days = new Set<number>();
  localOrders.forEach(order => {
    const oDate = new Date(order.date || order.createdAt);
    if (oDate >= thirtyDaysAgo && order.items) {
      order.items.forEach((item: any) => {
        if (item.product) soldIn30Days.add(item.product.id);
      });
    }
  });
  
  const frozenProducts = products.filter(p => !soldIn30Days.has(p.id));
  const frozenProduct = frozenProducts.length > 0 ? frozenProducts[0] : null;

  // KPI 4: Stock Alert (stock < 5)
  const lowStockProducts = products.filter(p => p.stock !== undefined && p.stock !== null && p.stock < 5);
  const stockAlertProduct = lowStockProducts.length > 0 ? lowStockProducts[0] : null;

  // Earnings of the day
  const todayStr = new Date().toDateString();
  const todaysOrders = localOrders.filter(o => new Date(o.date || o.createdAt).toDateString() === todayStr);
  const todaysEarningsUSD = todaysOrders.reduce((sum, o) => sum + o.total, 0);
  const todaysEarningsVES = todaysEarningsUSD * exchangeRate;

  // Dynamic alerts list
  const pendingApps = applications.filter(a => a.status === 'PENDING' || a.status === 'Pendiente');
  const pendingOrders = localOrders.filter(o => o.status === 'PENDIENTE' || o.status === 'Pendiente');

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        {/* HEADER: GLOBAL CONTROLS & TODAY'S METRICS */}
        <div className={styles.executiveHeader}>
          <div className={styles.headerTitleWrap}>
            <span className={styles.kpiTag}>Consola Ejecutiva</span>
            <h1>Panel de <span>Administración</span></h1>
            <p>Control financiero global y analíticas bimonetarias</p>
          </div>
          
          <div className={styles.headControlGrid}>
            {/* Global Fixed Exchange Rate Widget */}
            <div className={`${styles.headControlCard} glass`}>
              <div className={styles.cardHeaderSmall}>
                <span>⚡ TASA GLOBAL FIJA</span>
                {rateSuccessMessage && <span className={styles.rateSuccess}>{rateSuccessMessage}</span>}
              </div>
              <div className={styles.rateInputRow}>
                <div className={styles.inputPrefix}>Bs/$</div>
                <input 
                  type="number" 
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  className={styles.rateHeadInput}
                  step="0.01"
                />
                <button 
                  onClick={handleRateUpdate}
                  disabled={isSavingRate || parseFloat(newRate) === exchangeRate}
                  className={`${styles.saveRateBtn} ${parseFloat(newRate) !== exchangeRate ? styles.activeSave : ''}`}
                >
                  {isSavingRate ? '...' : 'Fijar'}
                </button>
              </div>
              <span className={styles.rateStatusLabel}>Persistente en SQLite DB</span>
            </div>

            {/* Earnings of the day Widget */}
            <div className={`${styles.headControlCard} glass`}>
              <div className={styles.cardHeaderSmall}>
                <span>💰 INGRESOS DEL DÍA</span>
                <span className={styles.todayPulse}>● HOY</span>
              </div>
              <div className={styles.earningsValue}>
                <h2>{formatPrice(todaysEarningsUSD)}</h2>
                <p>≈ Bs. {todaysEarningsVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</p>
              </div>
              <span className={styles.rateStatusLabel}>{todaysOrders.length} ordenes recibidas hoy</span>
            </div>
          </div>
        </div>

        {/* 4 PRODUCT KPI CARDS SECTION */}
        <section className={styles.kpisSection}>
          <h2 className={styles.sectionHeading}>Radiografía de Productos</h2>
          <div className={styles.kpiGrid}>
            
            {/* KPI 1: Winner */}
            <div className={`${styles.kpiCard} glass`}>
              <div className={`${styles.kpiHeader} ${styles.winner}`}>
                <span>🏆 PRODUCTO GANADOR</span>
                <span className={styles.kpiBadge}>Líder Ventas</span>
              </div>
              {winnerProduct ? (
                <div className={styles.kpiBody}>
                  <div className={styles.kpiProductImage}>
                    <Image 
                      src={winnerProduct.image || '/protein.png'} 
                      alt={winnerProduct.name} 
                      width={50} 
                      height={50} 
                      className={styles.kpiThumb}
                    />
                  </div>
                  <div className={styles.kpiInfo}>
                    <h3>{winnerProduct.name}</h3>
                    <p className={styles.kpiMetric}>{maxQty} unidades vendidas</p>
                    <span className={styles.kpiSub}>{winnerProduct.category}</span>
                  </div>
                </div>
              ) : (
                <p className={styles.emptyKpi}>Sin ventas registradas aún</p>
              )}
            </div>

            {/* KPI 2: Profitable */}
            <div className={`${styles.kpiCard} glass`}>
              <div className={`${styles.kpiHeader} ${styles.profitable}`}>
                <span>💎 MÁS RENTABLE</span>
                <span className={styles.kpiBadge}>Mayor Margen</span>
              </div>
              {profitableProduct ? (
                <div className={styles.kpiBody}>
                  <div className={styles.kpiProductImage}>
                    <Image 
                      src={profitableProduct.image || '/protein.png'} 
                      alt={profitableProduct.name} 
                      width={50} 
                      height={50} 
                      className={styles.kpiThumb}
                    />
                  </div>
                  <div className={styles.kpiInfo}>
                    <h3>{profitableProduct.name}</h3>
                    <p className={styles.kpiMetric}>+${maxProfit.toFixed(2)} USD netos</p>
                    <span className={styles.kpiSub}>Costo: ${profitableProduct.purchasePrice || 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <p className={styles.emptyKpi}>Sin datos de costo cargados</p>
              )}
            </div>

            {/* KPI 3: Frozen */}
            <div className={`${styles.kpiCard} glass`}>
              <div className={`${styles.kpiHeader} ${styles.frozen}`}>
                <span>❄️ PRODUCTO CONGELADO</span>
                <span className={styles.kpiBadge}>0 Ventas (30d)</span>
              </div>
              {frozenProduct ? (
                <div className={styles.kpiBody}>
                  <div className={styles.kpiProductImage}>
                    <Image 
                      src={frozenProduct.image || '/protein.png'} 
                      alt={frozenProduct.name} 
                      width={50} 
                      height={50} 
                      className={styles.kpiThumb}
                    />
                  </div>
                  <div className={styles.kpiInfo}>
                    <h3>{frozenProduct.name}</h3>
                    <p className={styles.kpiMetricAlert}>Inactivo en 30 días</p>
                    <span className={styles.kpiSub}>Stock actual: {frozenProduct.stock} unid.</span>
                  </div>
                </div>
              ) : (
                <p className={styles.emptyKpi}>Todo el catálogo en rotación</p>
              )}
            </div>

            {/* KPI 4: Stock Alert */}
            <div className={`${styles.kpiCard} glass`}>
              <div className={`${styles.kpiHeader} ${styles.alert}`}>
                <span>🚨 ALERTA DE STOCK</span>
                <span className={styles.kpiBadge}>Crítico &lt; 5</span>
              </div>
              {stockAlertProduct ? (
                <div className={styles.kpiBody}>
                  <div className={styles.kpiProductImage}>
                    <Image 
                      src={stockAlertProduct.image || '/protein.png'} 
                      alt={stockAlertProduct.name} 
                      width={50} 
                      height={50} 
                      className={styles.kpiThumb}
                    />
                  </div>
                  <div className={styles.kpiInfo}>
                    <h3>{stockAlertProduct.name}</h3>
                    <p className={styles.kpiMetricAlert}>Quedan {stockAlertProduct.stock} unidades</p>
                    <span className={styles.kpiSub}>{stockAlertProduct.category}</span>
                  </div>
                </div>
              ) : (
                <div className={styles.kpiBodyPerfect}>
                  <div className={styles.perfectIcon}>✨</div>
                  <div>
                    <h3>Inventario Óptimo</h3>
                    <p className={styles.kpiMetricPerfect}>Ningún producto en crítico</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* TWO COLUMNS WORKSPACE */}
        <div className={styles.executiveWorkspace}>
          
          {/* LEFT COLUMN: DYNAMIC ALERTS & REMINDERS */}
          <div className={styles.leftWorkspace}>
            
            {/* Dynamic Alerts Center */}
            <section className={`${styles.workspaceCard} glass`}>
              <div className={styles.workspaceCardHeader}>
                <h2>🚨 Centro de Notificaciones</h2>
                <span className={styles.pulseCount}>{pendingApps.length + pendingOrders.length + lowStockProducts.length} Activas</span>
              </div>
              
              <div className={styles.alertsList}>
                {pendingApps.length > 0 && (
                  <div className={`${styles.alertItem} ${styles.alertPurple}`}>
                    <div className={styles.alertIcon}>👥</div>
                    <div className={styles.alertInfo}>
                      <h4>Solicitudes de Afiliación</h4>
                      <p>Hay {pendingApps.length} candidatos (Afiliados/Coaches) pendientes de aprobación.</p>
                      <Link href="/admin/applications" className={styles.alertActionLink}>
                        Revisar bandeja &rarr;
                      </Link>
                    </div>
                  </div>
                )}

                {lowStockProducts.length > 0 && (
                  <div className={`${styles.alertItem} ${styles.alertRed}`}>
                    <div className={styles.alertIcon}>📦</div>
                    <div className={styles.alertInfo}>
                      <h4>Bajo Stock en Inventario</h4>
                      <p>{lowStockProducts.length} productos cuentan con menos de 5 unidades.</p>
                      <Link href="/admin/edit-products" className={styles.alertActionLink}>
                        Reponer inventario &rarr;
                      </Link>
                    </div>
                  </div>
                )}

                {pendingOrders.length > 0 && (
                  <div className={`${styles.alertItem} ${styles.alertCyan}`}>
                    <div className={styles.alertIcon}>💳</div>
                    <div className={styles.alertInfo}>
                      <h4>Órdenes por Verificar</h4>
                      <p>Tienes {pendingOrders.length} transacciones esperando revisión de recibo bancario.</p>
                    </div>
                  </div>
                )}

                {pendingApps.length === 0 && lowStockProducts.length === 0 && pendingOrders.length === 0 && (
                  <p className={styles.emptyAlerts}>✨ Sistema sin alertas pendientes. ¡Operaciones en orden!</p>
                )}
              </div>
            </section>

            {/* Smart Recompra Reminders */}
            <section className={`${styles.workspaceCard} glass`}>
              <div className={styles.workspaceCardHeader}>
                <h2>🔔 Próximas Recompras (Ciclos de Nutrición)</h2>
              </div>
              <p className={styles.workspaceCardIntro}>
                Clientes sugeridos para seguimiento personalizado de ciclo de suplementación.
              </p>
              
              <div className={styles.remindersList}>
                {reminders.length === 0 ? (
                  <p className={styles.emptySmall}>No hay recordatorios de recompra pendientes.</p>
                ) : (
                  reminders.slice(0, 4).map((rem, idx) => (
                    <div key={idx} className={styles.reminderRow}>
                      <div className={styles.remInfo}>
                        <strong>{rem.userName}</strong>
                        <span>{rem.productName}</span>
                      </div>
                      <div className={styles.reminderMeta}>
                        <span className={`${styles.remBadge} ${styles[rem.status.toLowerCase().replace(' ', '')] || styles.pending}`}>
                          {rem.status} ({rem.daysRemaining}d)
                        </span>
                        <a 
                          href={`https://wa.me/?text=Hola%20${encodeURIComponent(rem.userName)}!%20Espero%20que%20estés%20entrenando%20duro.%20Te%20escribo%20de%20SupplyMax%20para%20recordarte%20que%20tu%20${encodeURIComponent(rem.productName)}%20debe%20estar%20por%20acabarse.%20¿Quieres%20que%20te%20agendemos%20el%20despacho%20de%20tu%20repuesto?`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={styles.whatsAppBtn}
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: RECENT SALES FEED */}
          <div className={styles.rightWorkspace}>
            <section className={`${styles.workspaceCard} glass`}>
              <div className={styles.workspaceCardHeader}>
                <h2>🧾 Historial de Ventas Recientes</h2>
                <span className={styles.ordersTotalCount}>{localOrders.length} Totales</span>
              </div>
              
              <div className={styles.ordersList}>
                {localOrders.length === 0 ? (
                  <p className={styles.emptyMsg}>No hay transacciones registradas en el sistema.</p>
                ) : (
                  localOrders.slice(0, 5).map(order => (
                    <div key={order.id} className={styles.orderRow}>
                      <div className={styles.orderHead}>
                        <div className={styles.orderBasic}>
                          <span className={styles.orderId}># {order.id.slice(-6).toUpperCase()}</span>
                          <span className={styles.orderBuyer}>{order.user?.name || 'Cliente Supply'}</span>
                          <span className={styles.date}>{new Date(order.createdAt || order.date).toLocaleDateString()} - {new Date(order.createdAt || order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className={styles.orderAmount}>
                          <span className={styles.usdAmount}>{formatPrice(order.total)}</span>
                          <span className={styles.vesAmount}>Bs. {(order.total * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      <div className={styles.orderDivider}></div>

                      <div className={styles.orderFooter}>
                        <div className={styles.paymentInfoCol}>
                          {order.paymentRef ? (
                            <span className={styles.refCode}>Ref: #{order.paymentRef}</span>
                          ) : (
                            <span className={styles.noRef}>Sin ref bancaria</span>
                          )}
                        </div>
                        
                        <div className={styles.orderActionsRow}>
                          <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                            {order.status}
                          </span>
                          
                          {order.paymentRef && (
                            <button 
                              onClick={() => setSelectedCapture(order)}
                              className={styles.viewCaptureBtn}
                            >
                              Ver Detalle
                            </button>
                          )}
                          
                          {(order.status === 'PENDIENTE' || order.status === 'Pendiente') && (
                            <button 
                              className={styles.verifyBtn}
                              onClick={() => verifyOrder(order.id)}
                            >
                              Verificar Pago
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

        </div>
      </main>

      {/* PAYMENT DETAIL & REFERENCE MODAL */}
      {selectedCapture && (
        <div className={styles.modalOverlay} onClick={() => setSelectedCapture(null)}>
          <div className={`${styles.modalContent} glass`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Verificación de Pago</h3>
              <button className={styles.closeModalBtn} onClick={() => setSelectedCapture(null)}>✕</button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.receiptDetails}>
                <div className={styles.receiptRow}>
                  <span>Orden ID:</span>
                  <strong>{selectedCapture.id}</strong>
                </div>
                <div className={styles.receiptRow}>
                  <span>Cliente:</span>
                  <strong>{selectedCapture.user?.name} ({selectedCapture.user?.email})</strong>
                </div>
                <div className={styles.receiptRow}>
                  <span>Fecha:</span>
                  <strong>{new Date(selectedCapture.createdAt || selectedCapture.date).toLocaleString()}</strong>
                </div>
                <div className={styles.receiptRow}>
                  <span>Monto Total USD:</span>
                  <strong className={styles.cyanText}>{formatPrice(selectedCapture.total)}</strong>
                </div>
                <div className={styles.receiptRow}>
                  <span>Monto Total VES (Tasa {exchangeRate}):</span>
                  <strong className={styles.cyanText}>Bs. {(selectedCapture.total * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div className={styles.receiptRow}>
                  <span>Referencia / Detalles de Pago:</span>
                  <strong className={styles.greenText}>{selectedCapture.paymentRef || 'No proveído'}</strong>
                </div>
                <div className={styles.receiptRow}>
                  <span>Agencia de Envío / Destino:</span>
                  <strong>{selectedCapture.agency || 'Retiro Personal (Mérida)'}</strong>
                </div>
              </div>

              <div className={styles.simulatedReceipt}>
                <div className={styles.receiptWatermark}>COMPROBANTE BANCARIO</div>
                <p>Transferencia / Pago Móvil</p>
                <div className={styles.receiptRefLarge}>REF: {selectedCapture.paymentRef}</div>
                <div className={styles.receiptStatusLabel}>{selectedCapture.status}</div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              {(selectedCapture.status === 'PENDIENTE' || selectedCapture.status === 'Pendiente') ? (
                <button 
                  className={styles.modalVerifyBtn}
                  onClick={() => {
                    verifyOrder(selectedCapture.id);
                    setSelectedCapture(null);
                  }}
                >
                  Confirmar Conciliación Bancaria
                </button>
              ) : (
                <span className={styles.verifiedReceiptTag}>✓ Pago ya verificado y acreditado</span>
              )}
              <button className={styles.modalCloseBtn} onClick={() => setSelectedCapture(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
