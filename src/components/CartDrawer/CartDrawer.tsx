'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import Link from 'next/link';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { cart, updateQuantity, removeFromCart, cartTotal, formatPrice, isCartOpen, setCartOpen, exchangeRate, bcvInfo } = useAppContext();

  if (!isCartOpen) return null;

  const vesTotal = cartTotal * exchangeRate;

  const totalUnits = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className={styles.overlay} onClick={() => setCartOpen(false)}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2>TU CARRITO <span>({totalUnits})</span></h2>
          <button className={styles.closeBtn} onClick={() => setCartOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>

        <div className={styles.itemsList}>
          {cart.length === 0 ? (
            <div className={styles.empty}>
              <p>Tu carrito está vacío</p>
              <button className={styles.shopBtn} onClick={() => setCartOpen(false)}>EMPEZAR A COMPRAR</button>
            </div>
          ) : (
            cart.map((item) => {
              const itemKey = item.cartItemId || `${item.id}-${item.name}-${item.price}`;
              const itemImage = item.image && item.image.trim() ? item.image : '/protein.png';
              return (
                <div key={itemKey} className={styles.item}>
                  <div className={styles.imgWrapper}>
                    <Image 
                      src={itemImage} 
                      alt={item.name} 
                      width={70} 
                      height={70} 
                      unoptimized={itemImage.startsWith('http') || itemImage.startsWith('data:')}
                    />
                  </div>
                  <div className={styles.details}>
                    <h4>{item.name}</h4>
                    <div className={styles.priceRow}>
                      <div className={styles.qtyControls}>
                         <button onClick={() => updateQuantity(itemKey, -1)} className={styles.qtyBtn}>-</button>
                         <span className={styles.qtyNumber}>{item.quantity}</span>
                         <button onClick={() => updateQuantity(itemKey, 1)} className={styles.qtyBtn}>+</button>
                      </div>
                      <span className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                    <button onClick={() => removeFromCart(itemKey)} className={styles.removeBtn}>ELIMINAR</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <footer className={styles.footer}>
            <div className={styles.totalRow}>
              <span>TOTAL ESTIMADO</span>
              <div style={{ textAlign: 'right' }}>
                <span className={styles.totalAmount}>${cartTotal.toFixed(2)}</span>
                <div style={{ fontSize: '0.95rem', color: '#ffea79', fontWeight: 700, marginTop: '2px' }}>
                  Bs. {vesTotal.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: '#aaa',
              marginBottom: '14px'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                🏛️ Tasa BCV Oficial:
              </span>
              <strong style={{ color: '#fff' }}>
                Bs. {exchangeRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / $
              </strong>
            </div>

            <Link href="/checkout" onClick={() => setCartOpen(false)}>
              <button className={styles.checkoutBtn}>FINALIZAR PEDIDO</button>
            </Link>
            <button className={styles.continueBtn} onClick={() => setCartOpen(false)}>
              CONTINUAR COMPRANDO
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
