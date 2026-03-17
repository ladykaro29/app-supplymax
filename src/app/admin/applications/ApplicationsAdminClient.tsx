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

  if (!mounted || loading) return <div className={styles.loading}>Cargando solicitudes...</div>;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>GESTIÓN DE <span>SOLICITUDES</span></h1>
          <p>COACHES Y AFILIADOS PENDIENTES</p>
        </header>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>FECHA</th>
                <th>TIPO</th>
                <th>NOMBRE</th>
                <th>CONTACTO</th>
                <th>SOCIAL</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.id}>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`${styles.typeBadge} ${styles[app.type.toLowerCase()]}`}>
                      {app.type.toUpperCase()}
                    </span>
                  </td>
                  <td>{app.firstName} {app.lastName}</td>
                  <td className={styles.contactCell}>
                    <p>{app.email}</p>
                    <p>{app.phone}</p>
                  </td>
                  <td className={styles.socialCell}>
                    <p>IG: {app.instagram}</p>
                    {app.tiktok && <p>TT: {app.tiktok}</p>}
                    {app.affiliatesCount && <p>Alums: {app.affiliatesCount}</p>}
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
                      >
                        ✓
                      </button>
                      <button 
                        className={styles.rejectBtn}
                        onClick={() => updateStatus(app.id, 'RECHAZADA')}
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {apps.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.noData}>No hay solicitudes pendientes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
