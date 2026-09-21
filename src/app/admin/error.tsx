'use client';

import React, { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ADMIN CLIENT EXCEPTION]:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      color: '#f3f4f6',
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '560px',
        width: '100%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444', margin: '0 0 10px 0' }}>
          Ocurrió un error al cargar este módulo
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
          {error.message || 'Se produjo una excepción inesperada en el cliente.'}
        </p>

        {error.digest && (
          <p style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '20px', fontFamily: 'monospace' }}>
            ID del error: {error.digest}
          </p>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: '#00d1ff',
              color: '#000000',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Reintentar
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Recargar Página
          </button>
        </div>
      </div>
    </div>
  );
}
