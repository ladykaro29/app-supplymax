'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import styles from './Orders.module.css';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    image: string;
    category: string;
  };
}

interface Order {
  id: string;
  total: number;
  totalVes?: number | null;
  bcvRate?: number | null;
  status: string;
  createdAt: string;
  customerName?: string | null;
  customerIdNumber?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  agency?: string | null;
  paymentRef?: string | null;
  referralCode?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    idNumber?: string | null;
  } | null;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const { exchangeRate, formatPrice } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: nextStatus }),
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: nextStatus } : null);
        }
      } else {
        alert('Error al actualizar el estado del pedido');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'ALL' || o.status.toUpperCase() === statusFilter.toUpperCase();
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch = !search ||
      o.id.toLowerCase().includes(search) ||
      (o.customerName || o.user?.name || '').toLowerCase().includes(search) ||
      (o.customerEmail || o.user?.email || '').toLowerCase().includes(search) ||
      (o.customerPhone || o.user?.phone || '').toLowerCase().includes(search) ||
      (o.paymentRef || '').toLowerCase().includes(search);

    return matchesStatus && matchesSearch;
  });

  // Calculate statistics
  const totalCount = orders.length;
  const pendingCount = orders.filter(o => o.status.toUpperCase() === 'PENDIENTE').length;
  const verifiedCount = orders.filter(o => o.status.toUpperCase() === 'VERIFICADO').length;
  const deliveredCount = orders.filter(o => o.status.toUpperCase() === 'ENTREGADO').length;
  const totalVolumeUSD = orders
    .filter(o => o.status.toUpperCase() !== 'CANCELADO')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.titleWrapper}>
            <h1>Gestión de <span>Pedidos & Ventas</span></h1>
            <p className={styles.subtitle}>Verificación de pagos, despacho de encomiendas y seguimiento de envíos</p>
          </div>
        </header>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🛍️</div>
            <div className={styles.statData}>
              <span className={styles.statValue}>{totalCount}</span>
              <span className={styles.statLabel}>Total Pedidos</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
              ⏳
            </div>
            <div className={styles.statData}>
              <span className={styles.statValue} style={{ color: '#fbbf24' }}>{pendingCount}</span>
              <span className={styles.statLabel}>Pendientes de Pago</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(0, 255, 135, 0.1)', borderColor: 'rgba(0, 255, 135, 0.3)' }}>
              ✅
            </div>
            <div className={styles.statData}>
              <span className={styles.statValue} style={{ color: '#00FF87' }}>{verifiedCount}</span>
              <span className={styles.statLabel}>Pagos Verificados</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>💵</div>
            <div className={styles.statData}>
              <span className={styles.statValue}>{formatPrice(totalVolumeUSD)}</span>
              <span className={styles.statLabel}>Facturado Histórico</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Buscar por cliente, ID de orden, teléfono o referencia..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className={styles.statusFilterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Todos los Estados</option>
            <option value="PENDIENTE">⏳ Pendientes</option>
            <option value="VERIFICADO">✅ Verificados</option>
            <option value="ENVIADO">🚚 Enviados</option>
            <option value="ENTREGADO">📦 Entregados</option>
            <option value="CANCELADO">✕ Cancelados</option>
          </select>
        </div>

        {/* Orders Table */}
        <section className={styles.section}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th># ORDEN</th>
                  <th>CLIENTE / CONTACTO</th>
                  <th>TOTAL</th>
                  <th>REFERENCIA</th>
                  <th>ESTADO</th>
                  <th>FECHA</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>
                      Cargando pedidos...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyState}>
                      No se encontraron pedidos con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => {
                    const clientName = order.customerName || order.user?.name || 'Cliente SupplyMax';
                    const clientPhone = order.customerPhone || order.user?.phone || 'Sin tlf';
                    const statusClass = styles['status_' + order.status.toUpperCase()] || styles.status_PENDIENTE;
                    const orderDate = new Date(order.createdAt).toLocaleDateString();
                    const orderTime = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    const totalVesAmount = order.totalVes || (order.total * (order.bcvRate || exchangeRate));

                    return (
                      <tr key={order.id}>
                        <td>
                          <span className={styles.orderIdBadge}>
                            #{order.id.slice(-6).toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={styles.clientName}>{clientName}</span>
                          <span className={styles.clientSub}>
                            📞 {clientPhone} {order.agency ? `• Envío: ${order.agency}` : ''}
                          </span>
                        </td>
                        <td>
                          <span className={styles.amountUsd}>{formatPrice(order.total)}</span>
                          <span className={styles.amountVes}>
                            ≈ Bs. {totalVesAmount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td>
                          {order.paymentRef ? (
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#00F0FF' }}>
                              Ref: #{order.paymentRef}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                              Sin referencia
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${statusClass}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>
                            {orderDate}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', display: 'block' }}>
                            {orderTime}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button
                              type="button"
                              className={styles.viewBtn}
                              onClick={() => setSelectedOrder(order)}
                            >
                              Ver Detalle
                            </button>

                            {order.status.toUpperCase() === 'PENDIENTE' && (
                              <button
                                type="button"
                                className={styles.statusNextBtn}
                                disabled={updatingId === order.id}
                                onClick={() => handleUpdateStatus(order.id, 'VERIFICADO')}
                              >
                                {updatingId === order.id ? '...' : '✓ Verificar'}
                              </button>
                            )}

                            {order.status.toUpperCase() === 'VERIFICADO' && (
                              <button
                                type="button"
                                className={styles.statusNextBtn}
                                disabled={updatingId === order.id}
                                onClick={() => handleUpdateStatus(order.id, 'ENVIADO')}
                              >
                                {updatingId === order.id ? '...' : '🚚 Enviar'}
                              </button>
                            )}

                            {order.status.toUpperCase() === 'ENVIADO' && (
                              <button
                                type="button"
                                className={styles.statusNextBtn}
                                disabled={updatingId === order.id}
                                onClick={() => handleUpdateStatus(order.id, 'ENTREGADO')}
                              >
                                {updatingId === order.id ? '...' : '📦 Entregado'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Modal: Detalle del Pedido */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                Pedido #{selectedOrder.id.slice(-6).toUpperCase()}
              </h2>
              <button 
                type="button" 
                className={styles.modalCloseBtn}
                onClick={() => setSelectedOrder(null)}
              >
                ✕
              </button>
            </div>

            {/* Datos del Cliente */}
            <div className={styles.orderSection}>
              <h3>Información del Cliente</h3>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Nombre y Apellido:</span>
                <span className={styles.detailVal}>
                  {selectedOrder.customerName || selectedOrder.user?.name || 'Cliente SupplyMax'}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Cédula / Documento:</span>
                <span className={styles.detailVal}>
                  {selectedOrder.customerIdNumber || selectedOrder.user?.idNumber || 'No especificada'}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Teléfono / WhatsApp:</span>
                <span className={styles.detailVal}>
                  {selectedOrder.customerPhone || selectedOrder.user?.phone || 'No especificado'}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Correo Electrónico:</span>
                <span className={styles.detailVal}>
                  {selectedOrder.customerEmail || selectedOrder.user?.email || 'No especificado'}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Agencia de Envío / Destino:</span>
                <span className={styles.detailVal}>
                  {selectedOrder.agency || 'Retiro en Sede / A convenir'}
                </span>
              </div>
            </div>

            {/* Datos del Pago */}
            <div className={styles.orderSection}>
              <h3>Detalles del Pago & Transacción</h3>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Total en Dólares (USD):</span>
                <span className={styles.amountUsd}>{formatPrice(selectedOrder.total)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Total en Bolívares (VES):</span>
                <span className={styles.detailVal} style={{ color: '#00F0FF' }}>
                  Bs. {(selectedOrder.totalVes || (selectedOrder.total * (selectedOrder.bcvRate || exchangeRate))).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Tasa BCV Aplicada:</span>
                <span className={styles.detailVal}>
                  {selectedOrder.bcvRate ? `${selectedOrder.bcvRate.toFixed(2)} VES` : `${exchangeRate.toFixed(2)} VES`}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Referencia de Pago:</span>
                <span className={styles.detailVal} style={{ color: '#ffd700', fontFamily: 'monospace' }}>
                  {selectedOrder.paymentRef ? `#${selectedOrder.paymentRef}` : 'Sin referencia'}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Estado Actual:</span>
                <span className={`${styles.statusBadge} ${styles['status_' + selectedOrder.status.toUpperCase()] || styles.status_PENDIENTE}`}>
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            {/* Productos Comprados */}
            <div className={styles.orderSection}>
              <h3>Productos del Pedido ({selectedOrder.items.length})</h3>
              <div className={styles.itemsList}>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <div className={styles.itemThumb}>
                      <Image 
                        src={item.product?.image || '/protein.png'} 
                        alt={item.product?.name || 'Producto'} 
                        width={40} 
                        height={40} 
                      />
                    </div>
                    <div className={styles.itemDetails}>
                      <h4 className={styles.itemName}>{item.product?.name || 'Producto'}</h4>
                      <p className={styles.itemSub}>
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className={styles.itemTotal}>
                      {formatPrice(item.quantity * item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Status Action in Modal */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className={styles.viewBtn}
                style={{ flex: 1 }}
                onClick={() => setSelectedOrder(null)}
              >
                Cerrar
              </button>

              {selectedOrder.status.toUpperCase() === 'PENDIENTE' && (
                <button
                  type="button"
                  className={styles.statusNextBtn}
                  style={{ flex: 2, padding: '12px', fontSize: '0.9rem' }}
                  disabled={updatingId === selectedOrder.id}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'VERIFICADO')}
                >
                  ✓ Verificar Pago
                </button>
              )}

              {selectedOrder.status.toUpperCase() === 'VERIFICADO' && (
                <button
                  type="button"
                  className={styles.statusNextBtn}
                  style={{ flex: 2, padding: '12px', fontSize: '0.9rem' }}
                  disabled={updatingId === selectedOrder.id}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'ENVIADO')}
                >
                  🚚 Marcar como Enviado
                </button>
              )}

              {selectedOrder.status.toUpperCase() === 'ENVIADO' && (
                <button
                  type="button"
                  className={styles.statusNextBtn}
                  style={{ flex: 2, padding: '12px', fontSize: '0.9rem' }}
                  disabled={updatingId === selectedOrder.id}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'ENTREGADO')}
                >
                  📦 Marcar como Entregado
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
