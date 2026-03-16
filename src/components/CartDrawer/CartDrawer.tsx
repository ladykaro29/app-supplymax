'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import Link from 'next/link';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { cart, removeFromCart, cartTotal, formatPrice, isCartOpen, setCartOpen } = useAppContext();

  if (!isCartOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => setCartOpen(false)}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2>TU CARRITO <span>({cart.length})</span></h2>
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
            cart.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.imgWrapper}>
                  <Image src={item.image} alt={item.name} width={70} height={70} />
                </div>
                <div className={styles.details}>
                  <h4>{item.name}</h4>
                  <div className={styles.priceRow}>
                    <span>{item.quantity} x {formatPrice(item.price)}</span>
                    <button onClick={() => removeFromCart(item.id)} className={styles.removeBtn}>ELIMINAR</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <footer className={styles.footer}>
            <div className={styles.totalRow}>
              <span>TOTAL ESTIMADO</span>
              <span className={styles.totalAmount}>{formatPrice(cartTotal)}</span>
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
