'use client';

import React, { useState } from 'react';
import Header from '@/components/Header/Header';
import { useAppContext } from '@/context/AppContext';
import styles from './Checkout.module.css';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, cartTotal, formatPrice, currency, exchangeRate, completeOrder } = useAppContext();
  const router = useRouter();
  
  const [shippingType, setShippingType] = useState<'Libertador' | 'Nacional'>('Libertador');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Manual'>('Manual');
  const [fileUploaded, setFileUploaded] = useState(false);

  const shippingCost = shippingType === 'Libertador' ? 0 : 'Cobro a destino';
  const totalInVES = cartTotal * exchangeRate;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileUploaded(true);
    }
  };

  const handleOrder = () => {
    completeOrder();
    alert('Orden recibida. Un administrador verificará tu pago.');
    router.push('/profile');
  };

  if (cart.length === 0) {
    return (
      <div className={styles.container}>
        <Header />
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <h1>Tu carrito está vacío</h1>
          <button onClick={() => router.push('/catalog')} className={styles.uploadBtn}>Volver al catálogo</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.layout}>
        {/* Left Side: Form */}
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. Información de Envío</h2>
            <div className={`${styles.formGroup} glass`} style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <label>Municipio de Entrega</label>
              <select 
                value={shippingType} 
                onChange={(e) => setShippingType(e.target.value as any)}
              >
                <option value="Libertador">Libertador (Mérida)</option>
                <option value="Nacional">Nacional (Resto del país)</option>
              </select>

              {shippingType === 'Libertador' ? (
                <div className={styles.shippingInfo}>
                  <p>✅ <strong>Envío Gratis ($0)</strong></p>
                  <p className={styles.localNotice}>⏰ Entregas programadas solo de 3:00 PM a 6:00 PM</p>
                </div>
              ) : (
                <div className={styles.shippingInfo}>
                  <p>📦 <strong>Cobro a Destino</strong></p>
                  <p>Agencias disponibles: MRW, Tealca, Zoom.</p>
                </div>
              )}
            </div>
          </section>

          <section className={styles.section}>
            <h2>2. Método de Pago</h2>
            <div className={styles.paymentGrid}>
              <div 
                className={`${styles.paymentOption} glass ${paymentMethod === 'Card' ? styles.active : ''}`}
                onClick={() => setPaymentMethod('Card')}
              >
                <h4>Tarjeta Internacional</h4>
                <p>Débito / Crédito (USD)</p>
              </div>
              <div 
                className={`${styles.paymentOption} glass ${paymentMethod === 'Manual' ? styles.active : ''}`}
                onClick={() => setPaymentMethod('Manual')}
              >
                <h4>Pago Móvil / Transferencia</h4>
                <p>Bimonetario ($ / Bs)</p>
              </div>
            </div>

            {paymentMethod === 'Manual' && (
              <div className={`${styles.manualPaymentBody} glass`}>
                <div className={styles.bankData}>
                  <h4>Datos de Pago Supplymax:</h4>
                  <p><strong>Banesco</strong></p>
                  <p>RIF: J-12345678-9</p>
                  <p>Tel: 0412-1234567</p>
                  <p>Tasa del día: {exchangeRate} Bs/$</p>
                  <p className={styles.accentText}>
                    Total a pagar: {formatPrice(cartTotal)}
                  </p>
                </div>

                <div className={styles.uploadSection}>
                  <p>Sube una captura de tu comprobante:</p>
                  <label className={styles.uploadBtn}>
                    {fileUploaded ? '✅ Comprobante Cargado' : 'Subir Captura'}
                    <input type="file" className={styles.hiddenInput} onChange={handleFileChange} accept="image/*" />
                  </label>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Side: Summary */}
        <aside className={`${styles.summaryCard} glass`}>
          <h2>Resumen del Pedido</h2>
          {cart.map(item => (
            <div key={item.id} className={styles.summaryItem}>
              <span>{item.name} x{item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}

          <div className={styles.summaryItem} style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>
            <span>Envío</span>
            <span>{shippingType === 'Libertador' ? '$0.00' : 'Por cobrar'}</span>
          </div>

          <div className={styles.total}>
            <span>TOTAL</span>
            <div style={{ textAlign: 'right' }}>
              <div>{formatPrice(cartTotal)}</div>
              {currency === 'USD' && (
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  ≈ Bs. {totalInVES.toLocaleString('es-VE')}
                </div>
              )}
            </div>
          </div>

          <button 
            className={styles.checkoutBtn}
            disabled={paymentMethod === 'Manual' && !fileUploaded}
            onClick={handleOrder}
          >
            FINALIZAR COMPRA
          </button>
        </aside>
      </div>
    </div>
  );
}
