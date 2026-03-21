'use client';

import React, { useEffect, useState } from 'react';
import styles from './ApplicationsAdmin.module.css';

export default function ApplicationsAdminClient() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/applications')
      .then(res => res.json())
      .then(data => {
        setApps(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/applications/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (response.ok) {
        setApps(apps.map(a => a.id === id ? { ...a, status } : a));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const [activeTab, setActiveTab] = useState<'Afiliado' | 'Coach'>('Afiliado');

  const filteredApps = apps.filter(app => {
    const type = app.type?.toLowerCase();
    if (activeTab === 'Afiliado') return type === 'afiliado';
    if (activeTab === 'Coach') return type === 'coach';
    return true;
  });

  if (!mounted || loading) return <div className={styles.loading}>Cargando solicitudes...</div>;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>GESTIÓN DE <span>SOLICITUDES</span></h1>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'Afiliado' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('Afiliado')}
            >
              Solicitudes de Afiliados
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'Coach' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('Coach')}
            >
              Solicitudes de Coach
            </button>
          </div>
        </header>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>FECHA</th>
                <th>NOMBRE</th>
                <th>CONTACTO</th>
                <th>SOCIAL / INFO</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.id}>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>{app.firstName} {app.lastName}</td>
                  <td className={styles.contactCell}>
                    <p>{app.email}</p>
                    <p>{app.phone}</p>
                  </td>
                  <td className={styles.socialCell}>
                    <p>IG: {app.instagram}</p>
                    {app.tiktok && <p>TT: {app.tiktok}</p>}
                    {app.affiliatesCount && <p>Referidos: {app.affiliatesCount}</p>}
                    {app.degrees && (
                      <a href={app.degrees} target="_blank" rel="noopener noreferrer" className={styles.degreeLink}>
                         📄 Ver Títulos
                      </a>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[app.status.toLowerCase()]}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button 
                        className={styles.approveBtn}
                        onClick={() => updateStatus(app.id, 'ACEPTADA')}
                        title="Aceptar Solicitud"
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
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.noData}>No hay solicitudes de {activeTab} pendientes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
