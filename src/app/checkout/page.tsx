'use client';

import React, { useState } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { useAppContext } from '@/context/AppContext';
import styles from './Checkout.module.css';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, cartTotal, formatPrice, currency, exchangeRate, completeOrder, setCartOpen } = useAppContext();
  const router = useRouter();
  
  const [shippingLevel, setShippingLevel] = useState<1 | 2 | 3>(1);
  const [agency, setAgency] = useState<string>('MRW');
  const [fileUploaded, setFileUploaded] = useState(false);
  
  // New States
  const [discountCode, setDiscountCode] = useState('');
  const [localAddress, setLocalAddress] = useState('');
  const [localTime, setLocalTime] = useState('');
  const [muniLocation, setMuniLocation] = useState('');
  const [nationalState, setNationalState] = useState('');
  const [nationalAgency, setNationalAgency] = useState('');

  const totalInVES = cartTotal * exchangeRate;

  const handleOrder = () => {
    completeOrder();
    alert('Orden recibida. Un administrador verificará tu pago.');
    router.push('/');
  };

  const statesOfVenezuelaByAgency = [
    "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar", "Carabobo", "Cojedes", 
    "Delta Amacuro", "Distrito Capital", "Falcón", "Guárico", "Lara", "Mérida", "Miranda", 
    "Monagas", "Nueva Esparta", "Portuguesa", "Sucre", "Táchira", "Trujillo", "Vargas", "Yaracuy", "Zulia"
  ];

  if (cart.length === 0) {
    if (typeof window !== 'undefined') router.push('/catalog');
    return null;
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.layout}>
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>TU SELECCIÓN DE PODER</h2>
            
            <div className={styles.shippingToggles}>
               <button 
                className={`${styles.shippingBtn} ${shippingLevel === 1 ? styles.active : ''}`}
                onClick={() => setShippingLevel(1)}
               >
                 Entrega Personal
                 <span>Mérida - Libertador</span>
               </button>
               <button 
                className={`${styles.shippingBtn} ${shippingLevel === 2 ? styles.active : ''}`}
                onClick={() => setShippingLevel(2)}
               >
                 Otros Municipios
                 <span>Envío por Agencia</span>
               </button>
               <button 
                className={`${styles.shippingBtn} ${shippingLevel === 3 ? styles.active : ''}`}
                onClick={() => setShippingLevel(3)}
               >
                 Envíos Nacionales
                 <span>Resto de Venezuela</span>
               </button>
            </div>

            {/* Level 1: Entrega Personal */}
            {shippingLevel === 1 && (
              <div className={`${styles.agencyData} glass`}>
                <div className={styles.localNotice}>
                  <strong>⚡ AVISO IMPORTANTE:</strong>
                  Las entregas personales se realizan únicamente en el horario de 3:00 PM a 7:00 PM.
                </div>
                <div className={styles.formGroup}>
                   <label>Dirección de Entrega</label>
                   <textarea 
                    placeholder="Describe la dirección exacta a la cual quieres que llegue tu pedido..." 
                    className={styles.input}
                    value={localAddress}
                    onChange={(e) => setLocalAddress(e.target.value)}
                    rows={3}
                   />
                </div>
                <div className={styles.formGroup}>
                   <label>Hora de Entrega (Dentro del rango 3pm-7pm)</label>
                   <input 
                    type="text" 
                    placeholder="Ej: 4:30 PM" 
                    className={styles.input}
                    value={localTime}
                    onChange={(e) => setLocalTime(e.target.value)}
                   />
                </div>
              </div>
            )}

            {/* Level 2: Otros Municipios */}
            {shippingLevel === 2 && (
              <div className={`${styles.agencyData} glass`}>
                <h4>SELECCIONA TU AGENCIA</h4>
                <div className={styles.agencySelect}>
                   {['MRW', 'ZOOM', 'TEALCA'].map(a => (
                     <button 
                      key={a}
                      className={agency === a ? styles.activeAgency : ''}
                      onClick={() => setAgency(a)}
                     >
                       {a}
                     </button>
                   ))}
                </div>
                <div className={styles.formGroup}>
                  <label>Tu Ubicación / Municipio</label>
                  <input 
                    type="text" 
                    placeholder="Coloca tu ubicación o municipio aquí..." 
                    className={styles.input}
                    value={muniLocation}
                    onChange={(e) => setMuniLocation(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Level 3: Envíos Nacionales */}
            {shippingLevel === 3 && (
              <div className={`${styles.agencyData} glass`}>
                <h4>ENVIÓ NACIONAL (C.O.D)</h4>
                <div className={styles.agencySelect}>
                   {['MRW', 'ZOOM', 'TEALCA'].map(a => (
                     <button 
                      key={a}
                      className={agency === a ? styles.activeAgency : ''}
                      onClick={() => setAgency(a)}
                     >
                       {a}
                     </button>
                   ))}
                </div>
                <div className={styles.formGroup}>
                  <label>Seleccionar Estado</label>
                  <select 
                    className={styles.input}
                    value={nationalState}
                    onChange={(e) => setNationalState(e.target.value)}
                  >
                    <option value="">-- Elige un estado --</option>
                    {statesOfVenezuelaByAgency.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Dirección de la Agencia</label>
                  <input 
                    type="text" 
                    placeholder="Dirección exacta de la oficina para retirar..." 
                    className={styles.input}
                    value={nationalAgency}
                    onChange={(e) => setNationalAgency(e.target.value)}
                  />
                </div>
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h2>PAGA TU COMPRA</h2>
            <div className={`${styles.paymentBlock} glass`}>
               <p>💎 Tasa del día: 1$ = {exchangeRate} BS</p>
               <div className={styles.bankData}>
                  <p><strong>Pago Móvil:</strong> Banesco (0134)</p>
                  <p>RIF: J-29938833-0</p>
                  <p>Tlf: 0424-7000000</p>
               </div>
               <div className={styles.uploadArea}>
                  <button className={styles.uploadBtn} onClick={() => setFileUploaded(true)}>
                    {fileUploaded ? '✅ COMPROBANTE LISTO' : 'SUBIR COMPROBANTE'}
                  </button>
               </div>
            </div>
          </section>
        </div>

        <aside className={styles.summary}>
          <h3>RESUMEN DE ORDEN</h3>
          <div className={styles.summaryList}>
             {cart.map(i => (
               <div key={i.id} className={styles.summaryItem}>
                 <span>{i.name} x{i.quantity}</span>
                 <strong>{formatPrice(i.price * i.quantity)}</strong>
               </div>
             ))}
          </div>

          <div className={styles.finalTotal}>
             <span>TOTAL A PAGAR</span>
             <div className={styles.amount}>
                {formatPrice(cartTotal)} / {totalInVES.toLocaleString('es-VE')} BS
             </div>
          </div>

          <div className={styles.summaryActions}>
            <div className={styles.discountRow}>
               <input 
                type="text" 
                placeholder="Código de descuento..." 
                className={styles.discountInput}
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
               />
               <button className={styles.modifyCartBtn} onClick={() => setCartOpen(true)}>
                 MODIFICAR CARRITO
               </button>
            </div>
          </div>

          <button 
            className={styles.finishBtn} 
            disabled={!fileUploaded}
            onClick={handleOrder}
          >
            FINALIZAR PEDIDO Y REGISTRAR PAGO
          </button>
        </aside>
      </div>
      <Footer />
    </div>
  );
}
