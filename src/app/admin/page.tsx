'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import styles from './AdminHub.module.css';

export default function AdminDashboardPage() {
  const { user, formatPrice, exchangeRate } = useAppContext();
  const [stats, setStats] = useState<{ totalSalesUSD: number; pendingOrdersCount: number; ordersCount: number } | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setStats({
            totalSalesUSD: data.totalSalesUSD || 0,
            pendingOrdersCount: data.pendingOrdersCount || 0,
            ordersCount: (data.orders || []).length,
          });
        }
      })
      .catch(err => console.error('Failed to load stats:', err));
  }, []);

  const modules = [
    {
      title: 'Punto de Venta (POS)',
      description: 'Terminal de mostrador para registrar ventas rápidas, cobro en efectivo/pago móvil y emisión de tickets.',
      href: '/admin/pos',
      icon: '📟',
      iconClass: styles.posIcon,
      badge: 'Caja Rápida',
      cta: 'Abrir Terminal →'
    },
    {
      title: 'Contabilidad & Utilidades',
      description: 'Panel financiero detallado, utilidades netas, ventas al contado/crédito y libro diario de transacciones.',
      href: '/admin/performance',
      icon: '📘',
      iconClass: styles.contabIcon,
      badge: 'Finanzas',
      cta: 'Ver Balance →'
    },
    {
      title: 'Tienda en Línea',
      description: 'Vista previa de la tienda pública, catálogo activo y promociones en tiempo real vistas por clientes.',
      href: '/',
      icon: '🏪',
      iconClass: styles.shopIcon,
      badge: 'Web Pública',
      cta: 'Ir a Tienda ↗'
    },
    {
      title: 'Inventario & Catálogo',
      description: 'Gestión de productos, control de stock disponible, precios de compra, lotes a crédito y alertas de reposición.',
      href: '/admin/edit-products',
      icon: '📦',
      iconClass: styles.invIcon,
      badge: 'Productos',
      cta: 'Gestionar Stock →'
    },
    {
      title: 'Servicios & Afiliados',
      description: 'Coaches certificados, embajadores de marca, códigos de descuento de atletas y comisiones por ventas.',
      href: '/admin/affiliates-and-coaches',
      icon: '💼',
      iconClass: styles.servicesIcon,
      badge: 'Comunidad',
      cta: 'Ver Coaches →'
    },
    {
      title: 'Clientes, Proveedores & Equipo',
      description: 'Gestión de roles de administradores, vendedores de mostrador y administración de cuentas de usuarios.',
      href: '/admin/team',
      icon: '👥',
      iconClass: styles.teamIcon,
      badge: 'Equipo',
      cta: 'Administrar →'
    },
  ];

  return (
    <div className={styles.hubContainer}>
      <main className={styles.hubMain}>
        {/* Header Greeting */}
        <header className={styles.hubHeader}>
          <div className={styles.hubGreeting}>
            <h1>Panel <span>Administrador</span></h1>
            <p>Bienvenido de vuelta, {user?.name || 'Administrador'}. Selecciona un módulo para operar:</p>
          </div>
          <div className={styles.quickStatusBadge}>
            <span className={styles.liveDot} />
            Sistema en Línea • Tasa BCV: Bs. {exchangeRate || 'Cargando...'}
          </div>
        </header>

        {/* Top Summary Banner */}
        <section className={styles.summaryBanner}>
          <div className={styles.summaryCol}>
            <span className={styles.summaryLabel}>Total Ventas Registradas</span>
            <span className={`${styles.summaryValue} ${styles.summaryValueGreen}`}>
              {stats ? formatPrice(stats.totalSalesUSD) : '$0.00'}
            </span>
          </div>

          <div className={styles.summaryCol}>
            <span className={styles.summaryLabel}>Pedidos Pendientes</span>
            <span className={`${styles.summaryValue} ${styles.summaryValueOrange}`}>
              {stats ? `${stats.pendingOrdersCount} pedidos` : '0 pedidos'}
            </span>
          </div>

          <div className={styles.summaryCol}>
            <span className={styles.summaryLabel}>Transacciones Totales</span>
            <span className={styles.summaryValue}>
              {stats ? `${stats.ordersCount} operaciones` : '0 operaciones'}
            </span>
          </div>

          <Link href="/admin/pos" className={styles.quickStatusBadge} style={{ textDecoration: 'none', background: 'rgba(255, 107, 0, 0.15)', color: '#ff6b00', borderColor: 'rgba(255, 107, 0, 0.3)' }}>
            ⚡ Cobro Rápido POS
          </Link>
        </section>

        {/* 6 Modules Grid */}
        <h2 className={styles.gridTitle}>
          <span>Módulos de Gestión</span>
        </h2>

        <div className={styles.modulesGrid}>
          {modules.map((m, idx) => (
            <Link key={idx} href={m.href} className={styles.moduleCard}>
              <div className={`${styles.moduleIconWrap} ${m.iconClass}`}>
                <span>{m.icon}</span>
              </div>
              <h3 className={styles.moduleTitle}>{m.title}</h3>
              <p className={styles.moduleDesc}>{m.description}</p>
              <div className={styles.moduleAction}>
                <span>{m.cta}</span>
                <span className={styles.moduleBadge}>{m.badge}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
