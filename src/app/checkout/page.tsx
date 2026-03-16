'use client';

import React, { useState } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { useAppContext } from '@/context/AppContext';
import styles from './Checkout.module.css';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, cartTotal, formatPrice, currency, exchangeRate, completeOrder } = useAppContext();
  const router = useRouter();
  
  const [shippingLevel, setShippingLevel] = useState<1 | 2 | 3>(1);
  const [agency, setAgency] = useState<string>('MRW');
  const [paymentMethod, setPaymentMethod] = useState<'Manual' | 'Card'>('Manual');
  const [fileUploaded, setFileUploaded] = useState(false);

  const totalInVES = cartTotal * exchangeRate;

  const handleOrder = () => {
    completeOrder();
    alert('Orden recibida. Un administrador verificará tu pago.');
    router.push('/');
  };

  if (cart.length === 0) return null; // Simplified for this update

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

            {shippingLevel > 1 && (
              <div className={`${styles.agencyData} glass`}>
                <h4>DATOS DE LA AGENCIA</h4>
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
                <input 
                  type="text" 
                  placeholder="Indica el nombre/dirección de la oficina donde retirarás" 
                  className={styles.input} 
                />
                <p className={styles.note}>Nota: El flete es Cobro en Destino (C.O.D).</p>
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
