'use client';

import React, { useState } from 'react';
import styles from './JoinTeam.module.css';

type JoinType = 'Coach' | 'Afiliado' | null;

export default function JoinTeamClient() {
  const [type, setType] = useState<JoinType>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('type', type || '');

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        body: formData, // Browser automatically sets multipart/form-data
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Hubo un error al enviar tu solicitud. Por favor intenta de nuevo.');
    }
  };

  if (submitted) {
    return (
      <main className={styles.main}>
        <div className={`${styles.successCard} glass neon-glow`}>
           <h2>¡SOLICITUD ENVIADA!</h2>
           <p>Gracias por enviar tu información. Estaremos trabajando para procesar tu propuesta y te responderemos al correo electrónico proporcionado a la brevedad posible.</p>
           <button className={styles.backBtn} onClick={() => setSubmitted(false)}>VOLVER</button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <h1>ÚNETE AL <span>EQUIPO</span></h1>
          <p>FORMA PARTE DE LA ÉLITE SUPPLEMAX</p>
        </header>

        {!type ? (
          <div className={styles.choiceGrid}>
            <div className={`${styles.choiceCard} glass`} onClick={() => setType('Coach')}>
              <div className={styles.icon}>🏆</div>
              <h2>COACH SUPPLY</h2>
              <p>Para profesionales del fitness que desean certificar su conocimiento y ganar por su impacto.</p>
              <button className={styles.selectBtn}>SER COACH</button>
            </div>
            <div className={`${styles.choiceCard} glass`} onClick={() => setType('Afiliado')}>
              <div className={styles.icon}>💰</div>
              <h2>AFILIADO SUPPLY</h2>
              <p>Para entusiastas y promotores con comunidad que buscan monetizar su recomendación.</p>
              <button className={styles.selectBtn}>SER AFILIADO</button>
            </div>
          </div>
        ) : (
          <div className={styles.formContainer}>
            <button className={styles.backLink} onClick={() => setType(null)}>← Volver a elegir</button>
            
            <section className={`${styles.benefits} glass`}>
              <h2>BENEFICIOS DE SER <span>{type.toUpperCase()} SUPPLY</span></h2>
              {type === 'Coach' ? (
                <div className={styles.benefitList}>
                   <div className={styles.benefitItem}>
                      <strong>Niveles de Coach:</strong>
                      <ul>
                        <li><strong>Plata:</strong> 8% de comisión + Descuento personal.</li>
                        <li><strong>Oro:</strong> 12% de comisión + Invitación a eventos exclusivos + Ropa gratis.</li>
                      </ul>
                   </div>
                   <p>✓ Descuentos especiales para tus clientes.</p>
                   <p>✓ Acceso a suplementos antes del lanzamiento oficial.</p>
                </div>
              ) : (
                <div className={styles.benefitList}>
                   <div className={styles.benefitItem}>
                      <strong>Estructura de Tres Niveles:</strong>
                      <ul>
                        <li><strong>Nivel 1:</strong> 5% de comisión por venta directa.</li>
                        <li><strong>Nivel 2:</strong> 7% + Bonos por metas mensuales.</li>
                        <li><strong>Nivel 3:</strong> 10% + Panel de control avanzado de tokens.</li>
                      </ul>
                   </div>
                   <p>✓ Enlaces únicos de seguimiento.</p>
                   <p>✓ Pagos rápidos en USD o VES.</p>
                </div>
              )}
            </section>

            <form className={`${styles.form} glass`} onSubmit={handleSubmit}>
              <h3>SOLICITUD DE {type.toUpperCase()}</h3>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                   <label>Nombre</label>
                   <input type="text" name="firstName" placeholder="Tu nombre" required />
                </div>
                <div className={styles.inputGroup}>
                   <label>Apellido</label>
                   <input type="text" name="lastName" placeholder="Tu apellido" required />
                </div>
                <div className={styles.inputGroup}>
                   <label>Correo Electrónico</label>
                   <input type="email" name="email" placeholder="email@ejemplo.com" required />
                </div>
                <div className={styles.inputGroup}>
                   <label>Teléfono</label>
                   <input type="tel" name="phone" placeholder="0424-0000000" required />
                </div>
                <div className={styles.inputGroup}>
                   <label>Cuenta de Instagram</label>
                   <input type="text" name="instagram" placeholder="@usuario (Debe ser activa)" required />
                </div>
                <div className={styles.inputGroup}>
                   <label>TikTok (Opcional)</label>
                   <input type="text" name="tiktok" placeholder="@usuario" />
                </div>

                {type === 'Coach' ? (
                  <>
                    <div className={styles.inputGroup}>
                      <label>¿Posees títulos profesionales?</label>
                      <input type="file" name="degrees" className={styles.fileInput} />
                      <span className={styles.note}>Si no posees títulos, no hay problema, puedes adjuntar otros comprobantes.</span>
                    </div>
                    <div className={styles.inputGroup}>
                       <label>¿Cuántos afiliados / alumnos posees?</label>
                       <input type="number" name="affiliatesCount" placeholder="Ej: 10" required />
                    </div>
                  </>
                ) : (
                   <div className={styles.fullWidth}>
                      <p className={styles.noticia}>
                        * Se requiere una cantidad mínima de seguidores para ser aprobado como afiliado nivel 2+.
                      </p>
                   </div>
                )}
              </div>
              
              <button type="submit" className={styles.submitBtn}>ENVIAR PROPUESTA</button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
