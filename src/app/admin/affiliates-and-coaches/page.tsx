'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import styles from './AffiliatesAndCoaches.module.css';
import Link from 'next/link';

interface SalesHistoryItem {
  id: string;
  clientName: string;
  productsBought: string;
  total: number;
  date: string;
  isSelfPurchase: boolean;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role_id: 'Influencer' | 'Coach' | 'Delivery';
  level: string;
  affiliate_code: string;
  avatar: string;
  totalSalesUSD: number;
  accumulatedCommissions: number;
  brandNetProfit: number;
  salesHistory: SalesHistoryItem[];
}

export default function AffiliatesAndCoachesPage() {
  const { user, formatPrice, exchangeRate, authLoading } = useAppContext();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/staff');
      if (res.ok) {
        const data = await res.json();
        setStaffList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted) {
      fetchStaff();
    }
  }, [isMounted]);

  const handleLevelChange = async (userId: string, newLevel: string) => {
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, level: newLevel })
      });

      if (res.ok) {
        // Refresh staff stats and recalculate commission and brand net dynamic profits
        await fetchStaff();
      } else {
        const errorData = await res.json();
        alert(`Error al actualizar rango: ${errorData.error || 'Intente de nuevo.'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al actualizar el nivel del staff.');
    }
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Group staff members by role
  const segmentedStaff = useMemo(() => {
    const coaches = staffList.filter(s => s.role_id === 'Coach');
    const influencers = staffList.filter(s => s.role_id === 'Influencer');
    const delivery = staffList.filter(s => s.role_id === 'Delivery');
    return { coaches, influencers, delivery };
  }, [staffList]);

  // Authorization Check
  const allowedRoles = ['Admin', 'Subgerente'];

  // Loading gatekeeper
  if (authLoading || loading || !isMounted) {
    return (
      <div className={styles.premiumLoaderContainer}>
        <div className={styles.premiumLoader}>
          <div className={styles.doublePulse}></div>
          <div className={styles.doublePulseInner}></div>
        </div>
        <p className={styles.loadingText}>Cargando Perfiles de Staff y Finanzas...</p>
      </div>
    );
  }

  // Access check
  if (!user || !allowedRoles.includes(user.role_id)) {
    return (
      <div className={styles.unauthorized}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>⚠️</div>
          <h1>Acceso Restringido</h1>
          <p>Esta sección contiene información financiera confidencial. Solo la junta directiva corporativa puede auditar.</p>
          <Link href="/" className={styles.goHomeBtn}>Volver a la Tienda</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* EXECUTIVE PAGE HEADER */}
        <header className={styles.header}>
          <div className={styles.headerTitleWrap}>
            <span className={styles.sectionBadge}>Nómina de Comisiones</span>
            <h1>Miembros, <span>Coaches & Equipo</span></h1>
            <p>Control de rangos de atletas, ganancias de marca y distribución de comisiones bimonetarias</p>
          </div>
        </header>

        {/* SECTION 1: COACHES */}
        <section className={styles.teamSection}>
          <div className={styles.teamSectionHeader}>
            <h2>Equipo Entrenadores y Coaches</h2>
            <span className={`${styles.roleIndicatorBadge} ${styles.coach}`}>
              {segmentedStaff.coaches.length} Activos
            </span>
          </div>

          <div className={styles.grid}>
            {segmentedStaff.coaches.length === 0 ? (
              <div className={styles.emptySalesMsg}>No hay Coaches activos registrados en el sistema.</div>
            ) : (
              segmentedStaff.coaches.map(member => (
                <MemberCard 
                  key={member.id}
                  member={member}
                  formatPrice={formatPrice}
                  exchangeRate={exchangeRate}
                  isAccordionOpen={!!openAccordions[member.id]}
                  onToggleAccordion={() => toggleAccordion(member.id)}
                  onLevelChange={handleLevelChange}
                />
              ))
            )}
          </div>
        </section>

        {/* SECTION 2: ATHLETES & INFLUENCERS */}
        <section className={styles.teamSection}>
          <div className={styles.teamSectionHeader}>
            <h2>Equipo Atletas y Afiliados</h2>
            <span className={`${styles.roleIndicatorBadge} ${styles.influencer}`}>
              {segmentedStaff.influencers.length} Activos
            </span>
          </div>

          <div className={styles.grid}>
            {segmentedStaff.influencers.length === 0 ? (
              <div className={styles.emptySalesMsg}>No hay Atletas de afiliados registrados.</div>
            ) : (
              segmentedStaff.influencers.map(member => (
                <MemberCard 
                  key={member.id}
                  member={member}
                  formatPrice={formatPrice}
                  exchangeRate={exchangeRate}
                  isAccordionOpen={!!openAccordions[member.id]}
                  onToggleAccordion={() => toggleAccordion(member.id)}
                  onLevelChange={handleLevelChange}
                />
              ))
            )}
          </div>
        </section>

        {/* SECTION 3: DELIVERY */}
        <section className={styles.teamSection}>
          <div className={styles.teamSectionHeader}>
            <h2>Equipo de Logística y Delivery</h2>
            <span className={`${styles.roleIndicatorBadge} ${styles.delivery}`}>
              {segmentedStaff.delivery.length} Activos
            </span>
          </div>

          <div className={styles.grid}>
            {segmentedStaff.delivery.length === 0 ? (
              <div className={styles.emptySalesMsg}>No hay personal de Delivery registrado.</div>
            ) : (
              segmentedStaff.delivery.map(member => (
                <MemberCard 
                  key={member.id}
                  member={member}
                  formatPrice={formatPrice}
                  exchangeRate={exchangeRate}
                  isAccordionOpen={!!openAccordions[member.id]}
                  onToggleAccordion={() => toggleAccordion(member.id)}
                  onLevelChange={handleLevelChange}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

// ----------------------------------------------------
// DYNAMIC COMPONENT: MEMBER CARD
// ----------------------------------------------------
interface MemberCardProps {
  member: StaffMember;
  formatPrice: (val: number) => string;
  exchangeRate: number;
  isAccordionOpen: boolean;
  onToggleAccordion: () => void;
  onLevelChange: (userId: string, newLevel: string) => void;
}

function MemberCard({
  member,
  formatPrice,
  exchangeRate,
  isAccordionOpen,
  onToggleAccordion,
  onLevelChange
}: MemberCardProps) {
  const initials = member.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={styles.card}>
      <div className={styles.cardMainRow}>
        
        {/* Left Side: Avatar and general info */}
        <div className={styles.memberLeft}>
          <div className={styles.avatar}>
            {member.avatar ? (
              <img src={member.avatar} alt={member.name} className={styles.avatarImg} />
            ) : (
              initials
            )}
          </div>
          
          <div className={styles.memberInfo}>
            <h3>{member.name}</h3>
            <p>
              <span>{member.email}</span>
              {member.affiliate_code && (
                <>
                  <span style={{ opacity: 0.4 }}>•</span>
                  <span className={styles.codeLabel}>Ref: {member.affiliate_code}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Middle Side: Performance stats summaries */}
        <div className={styles.memberStatsSummary}>
          <div className={styles.summaryStat}>
            <label>Bruto Referido</label>
            <span className={styles.cyan}>{formatPrice(member.totalSalesUSD)}</span>
          </div>
          <div className={styles.summaryStat}>
            <label>Comisión Acumulada</label>
            <span className={styles.green}>{formatPrice(member.accumulatedCommissions)}</span>
          </div>
        </div>

        {/* Right Side: Configuration controls */}
        <div className={styles.memberRight}>
          
          {/* Level Dropdown */}
          <div className={styles.dropdownControl}>
            <label>Rango Manual</label>
            <select
              className={styles.levelDropdown}
              value={member.level}
              onChange={(e) => onLevelChange(member.id, e.target.value)}
            >
              <option value="Nivel 3">Nivel 3 (5%)</option>
              <option value="Nivel 2">Nivel 2 (8%)</option>
              <option value="Nivel 1 (Oro)">Nivel 1 Oro (10%)</option>
            </select>
          </div>

          {/* Toggle Accordion */}
          <button 
            className={`${styles.accordionToggleBtn} ${isAccordionOpen ? styles.active : ''}`}
            onClick={onToggleAccordion}
          >
            {isAccordionOpen ? '✕ Ocultar' : '📊 Radiografía'}
          </button>
        </div>

      </div>

      {/* COLLAPSIBLE ACCORDION BLOCK */}
      <div className={`${styles.accordionContainer} ${isAccordionOpen ? styles.accordionOpen : ''}`}>
        <h4 className={styles.radiografiaTitle}>Radiografía Comercial de {member.name}</h4>
        
        {/* Financial Details Grid */}
        <div className={styles.financialGrid}>
          <div className={styles.finCard}>
            <label>Volumen Bruto de Ventas</label>
            <h4 className={styles.cyan}>{formatPrice(member.totalSalesUSD)}</h4>
            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
              ≈ Bs. {(member.totalSalesUSD * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className={styles.finCard}>
            <label>Comisión del Atleta ({member.level.includes('Oro') || member.level.includes('1') ? '10%' : member.level.includes('2') ? '8%' : '5%'})</label>
            <h4 className={styles.purple}>{formatPrice(member.accumulatedCommissions)}</h4>
            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
              ≈ Bs. {(member.accumulatedCommissions * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className={styles.finCard}>
            <label>Ganancia Neta para la Marca</label>
            <h4 className={styles.green}>{formatPrice(member.brandNetProfit)}</h4>
            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
              COGS e incentivo deducidos
            </span>
          </div>
        </div>

        {/* Detailed Sales History Accordion Table */}
        <div className={styles.salesHistoryBlock}>
          <h5>Historial Detallado de Ventas</h5>
          
          <div className={styles.tableWrapper}>
            {member.salesHistory.length === 0 ? (
              <div className={styles.emptySalesMsg}>Este miembro no tiene ventas registradas en el historial.</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID Venta</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Productos Suministrados</th>
                    <th>Total USD</th>
                    <th>Total VES</th>
                  </tr>
                </thead>
                <tbody>
                  {member.salesHistory.map((sale) => (
                    <tr key={sale.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#00d1ff' }}>
                        # {sale.id.slice(-6).toUpperCase()}
                      </td>
                      <td>
                        {new Date(sale.date).toLocaleDateString()}
                      </td>
                      <td>
                        <strong>{sale.clientName}</strong>
                        {sale.isSelfPurchase && (
                          <span className={styles.selfPurchaseTag}>Coach Auto-Compra</span>
                        )}
                      </td>
                      <td style={{ opacity: 0.85 }}>
                        {sale.productsBought}
                      </td>
                      <td style={{ fontWeight: 'bold' }}>
                        {formatPrice(sale.total)}
                      </td>
                      <td style={{ opacity: 0.7 }}>
                        Bs. {(sale.total * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
