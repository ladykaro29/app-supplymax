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

interface ExpenseItem {
  id: string;
  type: 'GASTO' | 'RECOMPRA' | 'PDV_VENTA' | 'VENTA_WEB' | 'RETIRO';
  description: string;
  amount: number;
  amountVes?: number;
  category?: string;
  supplier?: string;
  paymentMethod?: string;
  createdAt: string;
}

export default function PerformancePage() {
  const { user, formatPrice, exchangeRate, authLoading } = useAppContext();
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Date filters (Del / Hasta)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [feedSearch, setFeedSearch] = useState('');

  // Register Expense Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    type: 'GASTO' as 'GASTO' | 'RECOMPRA',
    category: 'Operativo',
    paymentMethod: 'Efectivo / Transferencia',
  });
  const [submittingExpense, setSubmittingExpense] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, statsRes, expRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/stats'),
        fetch('/api/admin/expenses'),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(Array.isArray(prodData) ? prodData : []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setLocalOrders(statsData.orders || []);
      }

      if (expRes.ok) {
        const expData = await expRes.json();
        setExpenses(expData.expenses || []);
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

  // Authorization Check
  const allowedRoles = ['admin', 'administrador', 'subgerente'];

  // Handle Create Expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description || !expenseForm.amount) return;

    setSubmittingExpense(true);
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: expenseForm.description,
          amount: parseFloat(expenseForm.amount),
          type: expenseForm.type,
          category: expenseForm.category,
          paymentMethod: expenseForm.paymentMethod,
          amountVes: parseFloat(expenseForm.amount) * (exchangeRate || 0),
        }),
      });

      if (res.ok) {
        const newExp = await res.json();
        setExpenses(prev => [newExp, ...prev]);
        setIsExpenseModalOpen(false);
        setExpenseForm({
          description: '',
          amount: '',
          type: 'GASTO',
          category: 'Operativo',
          paymentMethod: 'Efectivo / Transferencia',
        });
      }
    } catch (err) {
      console.error('Error saving expense:', err);
    } finally {
      setSubmittingExpense(false);
    }
  };

  // ----------------------------------------------------
  // FILTERING LOGIC BY DATES
  // ----------------------------------------------------
  const filteredOrders = useMemo(() => {
    return localOrders.filter(order => {
      const orderDate = new Date(order.createdAt || order.date);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (orderDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }
      return true;
    });
  }, [localOrders, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.createdAt);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (expDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (expDate > end) return false;
      }
      return true;
    });
  }, [expenses, startDate, endDate]);

  // ----------------------------------------------------
  // TRIAD & PROFIT METRICS
  // ----------------------------------------------------
  const metrics = useMemo(() => {
    let ventasContado = 0;
    let ventasCredito = 0;
    let ventasPdv = 0;
    let totalIngresos = 0;
    let totalGastos = 0;

    // Process orders
    filteredOrders.forEach(order => {
      const total = Number(order.total) || 0;
      totalIngresos += total;

      const isPos = order.agency?.toLowerCase().includes('punto de venta') ||
                    order.agency?.toLowerCase().includes('mostrador') ||
                    order.paymentRef?.toLowerCase().includes('pos:');

      const isCredito = (order.paymentRef && order.paymentRef.toLowerCase().includes('credito')) ||
                        (order.paymentMethod && order.paymentMethod.toLowerCase().includes('credito'));

      if (isPos) {
        ventasPdv += total;
      }

      if (isCredito) {
        ventasCredito += total;
      } else {
        ventasContado += total;
      }
    });

    // Process expenses
    filteredExpenses.forEach(exp => {
      totalGastos += Number(exp.amount) || 0;
    });

    // Net Profit: Revenue - Expenses (and product cost proportion)
    const utilidadesNetas = totalIngresos - totalGastos;

    return {
      ventasContado,
      ventasCredito,
      ventasPdv,
      totalIngresos,
      totalGastos,
      utilidadesNetas,
    };
  }, [filteredOrders, filteredExpenses]);

  // ----------------------------------------------------
  // UNIFIED TRANSACTIONS FEED
  // ----------------------------------------------------
  interface UnifiedTx {
    id: string;
    type: 'VENTA' | 'GASTO' | 'RECOMPRA';
    subType: string;
    description: string;
    amount: number;
    amountVes?: number;
    date: Date;
    isInflow: boolean;
  }

  const transactionFeed = useMemo((): UnifiedTx[] => {
    const list: UnifiedTx[] = [];

    // Map orders as inflows
    filteredOrders.forEach(o => {
      const isPos = o.agency?.toLowerCase().includes('punto de venta') ||
                    o.agency?.toLowerCase().includes('mostrador') ||
                    o.paymentRef?.toLowerCase().includes('pos:');
      const isCredito = o.paymentRef?.toLowerCase().includes('credito') ||
                        o.paymentMethod?.toLowerCase().includes('credito');

      list.push({
        id: o.id,
        type: 'VENTA',
        subType: isPos ? (isCredito ? 'PDV Ventas | Crédito' : 'PDV Ventas | Contado') : (isCredito ? 'Tienda Web | Crédito' : 'Tienda Web | Contado'),
        description: o.customerName ? `Venta a ${o.customerName}` : (o.user?.name ? `Venta a ${o.user.name}` : `Venta #${o.id.slice(-6).toUpperCase()}`),
        amount: o.total,
        amountVes: o.totalVes || (o.total * (exchangeRate || 0)),
        date: new Date(o.createdAt || o.date),
        isInflow: true,
      });
    });

    // Map expenses as outflows
    filteredExpenses.forEach(e => {
      list.push({
        id: e.id,
        type: e.type === 'RECOMPRA' ? 'RECOMPRA' : 'GASTO',
        subType: e.type === 'RECOMPRA' ? 'Recompra | Contado' : `${e.category || 'Gasto'} | Contado`,
        description: e.description,
        amount: e.amount,
        amountVes: e.amountVes || (e.amount * (exchangeRate || 0)),
        date: new Date(e.createdAt),
        isInflow: false,
      });
    });

    // Sort newest first
    list.sort((a, b) => b.date.getTime() - a.date.getTime());

    if (!feedSearch.trim()) return list;

    const term = feedSearch.toLowerCase();
    return list.filter(item =>
      item.description.toLowerCase().includes(term) ||
      item.subType.toLowerCase().includes(term)
    );
  }, [filteredOrders, filteredExpenses, exchangeRate, feedSearch]);

  // Product performance calculation
  const productPerformance = useMemo((): ProductPerformance[] => {
    if (products.length === 0) return [];
    const statsMap: Record<number, { unitsSold: number; totalRevenue: number; totalProfit: number }> = {};
    products.forEach(p => {
      statsMap[p.id] = { unitsSold: 0, totalRevenue: 0, totalProfit: 0 };
    });

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
  }, [products, filteredOrders]);

  if (authLoading || loading || !isMounted) {
    return (
      <div className={styles.premiumLoaderContainer}>
        <div className={styles.premiumLoader}>
          <div className={styles.doublePulse}></div>
          <div className={styles.doublePulseInner}></div>
        </div>
        <p className={styles.loadingText}>Compilando Métricas Contables...</p>
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
          <p>Solo miembros de la gerencia corporativa pueden auditar el rendimiento.</p>
          <Link href="/" className={styles.goHomeBtn}>Volver a la Tienda</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* ========================================================
            CAPTURE 1: BIG UTILIDADES HEADER & ACTIONS
            ======================================================== */}
        <section className={styles.profitHeaderSection}>
          <div className={styles.profitTitleWrap}>
            <h2>Utilidades</h2>
            <div className={styles.profitNumberWrap}>
              <span className={styles.profitBigAmount}>
                {formatPrice(metrics.utilidadesNetas)}
              </span>
              <span className={styles.profitBigVes}>
                Bs. {(metrics.utilidadesNetas * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className={styles.headerActionButtons}>
            <button
              type="button"
              className={styles.btnRegisterExpense}
              onClick={() => setIsExpenseModalOpen(true)}
            >
              <span>+</span> Registrar Gasto / Salida
            </button>
            <Link href="/admin/pos" className={styles.btnPosQuick}>
              <span>📟</span> Cobrar en POS
            </Link>
          </div>
        </section>

        {/* ========================================================
            CAPTURE 1: DATE RANGE FILTER (DEL / HASTA)
            ======================================================== */}
        <div className={styles.dateFilterBar}>
          <div className={styles.dateInputGroup}>
            <span className={styles.dateLabel}>Del</span>
            <input 
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>

          <div className={styles.dateInputGroup}>
            <span className={styles.dateLabel}>Hasta</span>
            <input 
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>

          {(startDate || endDate) && (
            <button 
              type="button" 
              className={styles.dateClearBtn}
              onClick={() => { setStartDate(''); setEndDate(''); }}
              title="Limpiar fechas"
            >
              ✕
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#9ca3af' }}>
            Tasa BCV Referencial: <strong>Bs. {exchangeRate}</strong>
          </div>
        </div>

        {/* ========================================================
            CAPTURE 1: 3 METRIC CARDS (CONTADO, CRÉDITO, PDV)
            ======================================================== */}
        <div className={styles.metricsTriadGrid}>
          <div className={styles.metricTriadCard}>
            <div className={styles.triadLabel}>
              <span>Ventas al contado</span>
              <span>💵</span>
            </div>
            <div className={`${styles.triadAmount} ${styles.triadAmountContado}`}>
              {formatPrice(metrics.ventasContado)}
            </div>
            <span className={styles.triadSub}>
              Ingresos cobrados de inmediato
            </span>
          </div>

          <div className={styles.metricTriadCard}>
            <div className={styles.triadLabel}>
              <span>Ventas al crédito</span>
              <span>⏳</span>
            </div>
            <div className={`${styles.triadAmount} ${styles.triadAmountCredito}`}>
              {formatPrice(metrics.ventasCredito)}
            </div>
            <span className={styles.triadSub}>
              Cuentas por cobrar a clientes
            </span>
          </div>

          <div className={styles.metricTriadCard}>
            <div className={styles.triadLabel}>
              <span>Ventas PDV</span>
              <span>📟</span>
            </div>
            <div className={`${styles.triadAmount} ${styles.triadAmountPos}`}>
              {formatPrice(metrics.ventasPdv)}
            </div>
            <span className={styles.triadSub}>
              Mostrador físico directo
            </span>
          </div>
        </div>

        {/* ========================================================
            CAPTURES 1 & 2: TRANSACTIONS FEED
            ======================================================== */}
        <section className={styles.transactionFeedSection}>
          <div className={styles.feedHeaderRow}>
            <h3>
              <span>📋</span> Detalle de Transacciones
            </h3>
            <div className={styles.feedSearchWrap}>
              <span>🔍</span>
              <input 
                type="text"
                placeholder="Buscar transacción..."
                value={feedSearch}
                onChange={e => setFeedSearch(e.target.value)}
              />
              {feedSearch && (
                <button
                  type="button"
                  onClick={() => setFeedSearch('')}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className={styles.transactionList}>
            {transactionFeed.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
                No hay movimientos registrados en el período seleccionado.
              </div>
            ) : (
              transactionFeed.map(tx => (
                <div key={tx.id} className={styles.txItemRow}>
                  <div className={styles.txLeftCol}>
                    <div className={`${styles.txDirectionIcon} ${tx.isInflow ? styles.txInflow : styles.txOutflow}`}>
                      {tx.isInflow ? '↑' : '↓'}
                    </div>
                    <div className={styles.txInfo}>
                      <span className={styles.txDesc}>{tx.description}</span>
                      <div className={styles.txMeta}>
                        <span className={styles.txTag}>{tx.subType}</span>
                        <span>•</span>
                        <span>
                          {tx.date.toLocaleDateString('es-VE')} {tx.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.txRightCol}>
                    <span className={tx.isInflow ? styles.txAmountIn : styles.txAmountOut}>
                      {tx.isInflow ? `+ ${formatPrice(tx.amount)}` : `- ${formatPrice(tx.amount)}`}
                    </span>
                    <span className={styles.txAmountVes}>
                      Bs. {((tx.amountVes || tx.amount * exchangeRate)).toLocaleString('es-VE', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ========================================================
            PRODUCT PERFORMANCE TABLE
            ======================================================== */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <h2>Rentabilidad por Producto</h2>
            <span className={styles.badge}>Catálogo Activo</span>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio Venta</th>
                  <th>Vendidos</th>
                  <th>Ingresos</th>
                  <th>Utilidad Neta</th>
                  <th>Margen</th>
                </tr>
              </thead>
              <tbody>
                {productPerformance.slice(0, 10).map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.category}</td>
                    <td>{formatPrice(p.price)}</td>
                    <td><strong>{p.unitsSold}</strong> uds</td>
                    <td>{formatPrice(p.totalRevenue)}</td>
                    <td style={{ color: '#25d366', fontWeight: 700 }}>{formatPrice(p.totalProfit)}</td>
                    <td>{p.profitMargin.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ========================================================
          MODAL: REGISTRAR GASTO
          ======================================================== */}
      {isExpenseModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsExpenseModalOpen(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Registrar Salida / Gasto</h3>
              <button 
                type="button" 
                className={styles.modalClose}
                onClick={() => setIsExpenseModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpense} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Concepto o Descripción</label>
                <input 
                  type="text"
                  required
                  placeholder="Ej. Cinta de embalaje, Pago de envío, Alquiler..."
                  value={expenseForm.description}
                  onChange={e => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Monto en Dólares ($ USD)</label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Tipo de Movimiento</label>
                <select
                  value={expenseForm.type}
                  onChange={e => setExpenseForm(prev => ({ ...prev, type: e.target.value as any }))}
                  className={styles.formInput}
                >
                  <option value="GASTO">Gasto Operativo / Servicio</option>
                  <option value="RECOMPRA">Recompra de Mercancía / Stock</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Categoría</label>
                <input 
                  type="text"
                  placeholder="Ej. Logística, Inventario, Servicios..."
                  value={expenseForm.category}
                  onChange={e => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}
                  className={styles.formInput}
                />
              </div>

              <button 
                type="submit" 
                className={styles.modalSubmitBtn}
                disabled={submittingExpense}
              >
                {submittingExpense ? 'Guardando...' : 'Confirmar Egreso'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
