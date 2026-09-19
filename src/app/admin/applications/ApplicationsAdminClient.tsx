'use client';

import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import styles from './ApplicationsAdmin.module.css';
import Link from 'next/link';

export default function ApplicationsAdminClient() {
  const { user, authLoading } = useAppContext();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'Afiliado' | 'Coach'>('Afiliado');

  useEffect(() => {
    setIsMounted(true);
    fetch('/api/applications')
      .then(res => res.json())
      .then(data => {
        setApps(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching applications:', err);
        setLoading(false);
      });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const actionLabel = status === 'ACEPTADA' ? 'aprobar' : 'rechazar';
    if (!confirm(`¿Estás seguro de que deseas ${actionLabel} esta solicitud?`)) {
      return;
    }

    try {
      const response = await fetch('/api/applications/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (response.ok) {
        setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        alert(`Solicitud ${actionLabel === 'aprobar' ? 'aceptada' : 'rechazada'} exitosamente.`);
      } else {
        const errorData = await response.json();
        alert(`Error al actualizar estado: ${errorData.error || 'Intenta de nuevo.'}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error de red al actualizar la solicitud.');
    }
  };

  const filteredApps = apps.filter(app => {
    const type = app.type?.toLowerCase();
    if (activeTab === 'Afiliado') return type === 'afiliado';
    if (activeTab === 'Coach') return type === 'coach';
    return true;
  });

  // Allowed roles check
  const allowedRoles = ['Admin', 'Subgerente'];

  // Premium loader gatekeeper
  if (authLoading || loading || !isMounted) {
    return (
      <div className={styles.premiumLoaderContainer}>
        <div className={styles.premiumLoader}>
          <div className={styles.doublePulse}></div>
          <div className={styles.doublePulseInner}></div>
        </div>
        <p className={styles.loadingText}>Accediendo a Bandeja de Postulaciones...</p>
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
          <p>Solo personal del staff con rango de administrador puede revisar y auditar las solicitudes.</p>
          <Link href="/" className={styles.goHomeBtn}>Volver a la Tienda</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        {/* BANDEJA HEADER */}
        <header className={styles.header}>
          <div className={styles.headerTitleWrap}>
            <span className={styles.sectionBadge}>Reclutamiento de Talento</span>
            <h1>Bandeja de <span>Solicitudes</span></h1>
            <p>Auditoría y admisión de Atletas de alto rendimiento y Coaches certificados</p>
          </div>

          <div className={styles.tabs}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'Afiliado' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('Afiliado')}
            >
              Atletas y Afiliados
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'Coach' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('Coach')}
            >
              Entrenadores y Coaches
            </button>
          </div>
        </header>

        {/* TRAY OF HORIZONTAL CARDS */}
        <div className={styles.cardsTray}>
          {filteredApps.length > 0 ? (
            filteredApps.map((app) => {
              const initials = `${app.firstName?.[0] || ''}${app.lastName?.[0] || ''}`.toUpperCase();
              const formattedDate = new Date(app.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              return (
                <div key={app.id} className={styles.applicationCard}>
                  <div className={styles.cardLeft}>
                    {/* Visual Avatar with initials */}
                    <div className={`${styles.avatar} ${activeTab === 'Coach' ? styles.avatarCoach : ''}`}>
                      {initials}
                    </div>

                    <div className={styles.infoBlock}>
                      <div className={styles.applicantNameRow}>
                        <h3>{app.firstName} {app.lastName}</h3>
                        <span className={styles.dateBadge}>{formattedDate}</span>
                      </div>

                      {/* Contact row */}
                      <div className={styles.contactRow}>
                        <div className={styles.contactItem}>
                          <span className={styles.contactIcon}>✉</span>
                          <a href={`mailto:${app.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {app.email}
                          </a>
                        </div>
                        <div className={styles.contactItem}>
                          <span className={styles.contactIcon}>📞</span>
                          <a href={`tel:${app.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {app.phone}
                          </a>
                        </div>
                        <div className={styles.contactItem}>
                          <span className={styles.contactIcon}>⚡</span>
                          <a 
                            href={`https://wa.me/${app.phone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(app.firstName)}!%20Te%20escribimos%20de%20SupplyMax%20respecto%20a%20tu%20solicitud%20de%20ingreso...`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#00ff88', textDecoration: 'none', fontWeight: 'bold' }}
                          >
                            WhatsApp Directo
                          </a>
                        </div>
                      </div>

                      {/* Professional Info details */}
                      <div className={styles.motivationPitch}>
                        {activeTab === 'Coach' ? (
                          <>
                            <strong>Propuesta Profesional:</strong> Candidato solicita unirse a la plataforma como Entrenador Certificado (Coach). Cuenta con certificaciones de nutrición/entrenamiento para asesorías de alto rendimiento deportivo.
                          </>
                        ) : (
                          <>
                            <strong>Propuesta Deportiva:</strong> Atleta influencer de alto rendimiento interesado en promover suplementos y recomendar la marca a su comunidad de seguidores deportivos.
                          </>
                        )}
                      </div>

                      {/* Social handles rows */}
                      <div className={styles.socialRow}>
                        <a 
                          href={`https://instagram.com/${app.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.socialPill}
                        >
                          <span className={styles.instagramIcon}>📸</span> Instagram: @{app.instagram.replace('@', '')}
                        </a>

                        {app.tiktok && (
                          <a 
                            href={`https://tiktok.com/@${app.tiktok.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialPill}
                          >
                            <span className={styles.tiktokIcon}>🎵</span> TikTok: @{app.tiktok.replace('@', '')}
                          </a>
                        )}

                        {app.affiliatesCount && (
                          <div className={`${styles.socialPill} ${styles.referralPill}`}>
                            👥 Referidos Estimados: <strong>{app.affiliatesCount}</strong>
                          </div>
                        )}

                        {app.degrees && (
                          <a 
                            href={app.degrees} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={styles.degreeLink}
                          >
                            📄 Ver Credenciales y Títulos
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardRight}>
                    {/* Application Status Badge */}
                    <span className={`${styles.statusBadge} ${styles[app.status.toLowerCase()] || styles.pendiente}`}>
                      {app.status}
                    </span>

                    {/* Action buttons if PENDING */}
                    {app.status === 'PENDIENTE' && (
                      <div className={styles.actionsGroup}>
                        <button 
                          className={styles.approveBtn}
                          onClick={() => updateStatus(app.id, 'ACEPTADA')}
                          title="Aprobar Solicitud"
                        >
                          ✓
                        </button>
                        <button 
                          className={styles.rejectBtn}
                          onClick={() => updateStatus(app.id, 'RECHAZADA')}
                          title="Rechazar Solicitud"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyTray}>
              <div className={styles.emptyIcon}>📂</div>
              <h3>Bandeja de entrada vacía</h3>
              <p>No hay solicitudes de {activeTab === 'Coach' ? 'Entrenadores' : 'Atletas/Afiliados'} {apps.length > 0 ? 'pendientes' : 'en la base de datos'}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
