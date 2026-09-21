'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import styles from './Pos.module.css';

interface ProductItem {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  stock: number;
}

interface CartItem {
  product: ProductItem;
  quantity: number;
}

export default function PosPage() {
  const { exchangeRate, formatPrice } = useAppContext();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Checkout inputs
  const [customerName, setCustomerName] = useState('');
  const [paymentType, setPaymentType] = useState<'CONTADO' | 'CREDITO'>('CONTADO');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo USD / Bs');
  const [paymentRef, setPaymentRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch(err => console.error('Error fetching products for POS:', err))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                            p.category.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCat === 'ALL' || p.category === selectedCat;
      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCat]);

  // Cart operations
  const addToCart = (prod: ProductItem) => {
    if (prod.stock <= 0) return;
    setCart(prev => {
      const exist = prev.find(item => item.product.id === prod.id);
      if (exist) {
        if (exist.quantity >= prod.stock) return prev; // max stock limit
        return prev.map(item =>
          item.product.id === prod.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product: prod, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === id) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(item => item.quantity > 0);
    });
  };

  const clearCart = () => setCart([]);

  const totalUSD = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const totalVES = useMemo(() => {
    return totalUSD * (exchangeRate || 0);
  }, [totalUSD, exchangeRate]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setSuccessMsg('');

    try {
      const payload = {
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        customerName: customerName || 'Cliente Mostrador (POS)',
        paymentMethod: `${paymentMethod} (${paymentType})`,
        paymentRef: paymentRef || undefined,
        totalVes: totalVES,
        bcvRate: exchangeRate,
      };

      const res = await fetch('/api/admin/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al procesar la venta');
        return;
      }

      // Decrement local product stock
      setProducts(prev =>
        prev.map(p => {
          const inCart = cart.find(ci => ci.product.id === p.id);
          if (inCart) {
            return { ...p, stock: Math.max(0, p.stock - inCart.quantity) };
          }
          return p;
        })
      );

      clearCart();
      setCustomerName('');
      setPaymentRef('');
      setSuccessMsg(`¡Venta #${data.id.slice(-6).toUpperCase()} cobrada con éxito! Total: ${formatPrice(totalUSD)}`);
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err: any) {
      alert('Error de conexión al procesar venta: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.posContainer}>
      <main className={styles.posMain}>
        {/* Left Column: Product Catalog */}
        <section className={styles.catalogSection}>
          <div className={styles.posHeader}>
            <div className={styles.posTitle}>
              <h1>Punto de Venta <span>(POS)</span></h1>
              <p>Venta directa y mostrador físico • Tasa BCV: <strong>Bs. {exchangeRate}</strong></p>
            </div>
            {successMsg && (
              <div style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#25d366', padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(37, 211, 102, 0.3)' }}>
                {successMsg}
              </div>
            )}
          </div>

          {/* Search bar */}
          <div className={styles.searchBarWrap}>
            <span>🔍</span>
            <input 
              type="text"
              placeholder="Buscar por nombre de producto o categoría..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch('')} 
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className={styles.categoryFilterRow}>
            {categories.map(c => (
              <button
                key={c}
                className={`${styles.catBtn} ${selectedCat === c ? styles.catBtnActive : ''}`}
                onClick={() => setSelectedCat(c)}
              >
                {c === 'ALL' ? 'Todos los Productos' : c}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Cargando catálogo POS...</div>
          ) : (
            <div className={styles.productsGrid}>
              {filteredProducts.map(p => {
                const isOutOfStock = p.stock <= 0;
                return (
                  <div 
                    key={p.id} 
                    className={styles.productCard}
                    onClick={() => !isOutOfStock && addToCart(p)}
                    style={{ opacity: isOutOfStock ? 0.45 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                  >
                    <div className={styles.productImgWrap}>
                      <Image 
                        src={p.image || '/placeholder-product.png'} 
                        alt={p.name}
                        fill
                        className={styles.productImg}
                        sizes="180px"
                      />
                    </div>
                    <h4 className={styles.productName} title={p.name}>{p.name}</h4>
                    <div className={styles.productFooter}>
                      <div>
                        <span className={styles.productPrice}>{formatPrice(p.price)}</span>
                        <span className={styles.productPriceVes}>
                          Bs. {(p.price * exchangeRate).toLocaleString('es-VE', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <span className={`${styles.stockBadge} ${p.stock <= 3 ? styles.lowStock : ''}`}>
                        {isOutOfStock ? 'Agotado' : `${p.stock} disp.`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Checkout Ticket */}
        <section className={styles.ticketSection}>
          <div className={styles.ticketHeader}>
            <h2>🧾 Ticket Mostrador</h2>
            {cart.length > 0 && (
              <button className={styles.clearBtn} onClick={clearCart}>
                Vaciar
              </button>
            )}
          </div>

          {/* Cart list */}
          <div className={styles.ticketItemsList}>
            {cart.length === 0 ? (
              <div className={styles.ticketEmpty}>
                Haz clic en cualquier producto de la izquierda para agregarlo al ticket.
              </div>
            ) : (
              cart.map(ci => (
                <div key={ci.product.id} className={styles.ticketItemRow}>
                  <div className={styles.ticketItemInfo}>
                    <span className={styles.ticketItemName}>{ci.product.name}</span>
                    <span className={styles.ticketItemSub}>
                      {formatPrice(ci.product.price)} c/u
                    </span>
                  </div>

                  <div className={styles.quantityControls}>
                    <button className={styles.qtyBtn} onClick={() => updateQuantity(ci.product.id, -1)}>-</button>
                    <span className={styles.qtyVal}>{ci.quantity}</span>
                    <button className={styles.qtyBtn} onClick={() => updateQuantity(ci.product.id, 1)}>+</button>
                  </div>

                  <div className={styles.ticketItemTotal}>
                    {formatPrice(ci.product.price * ci.quantity)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer & Payment fields */}
          <div className={styles.clientFields}>
            <input 
              type="text"
              placeholder="Nombre del Cliente (Opcional)"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className={styles.clientInput}
            />

            <div className={styles.paymentTypeSelector}>
              <button
                type="button"
                className={`${styles.payTypeBtn} ${paymentType === 'CONTADO' ? styles.payTypeActive : ''}`}
                onClick={() => setPaymentType('CONTADO')}
              >
                💵 Al Contado
              </button>
              <button
                type="button"
                className={`${styles.payTypeBtn} ${paymentType === 'CREDITO' ? styles.payTypeActive : ''}`}
                onClick={() => setPaymentType('CREDITO')}
              >
                ⏳ Al Crédito
              </button>
            </div>

            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className={styles.clientInput}
            >
              <option value="Efectivo USD">Efectivo USD ($)</option>
              <option value="Pago Móvil / Transferencia">Pago Móvil / Transferencia (Bs)</option>
              <option value="Punto de Venta Tarjeta">Punto de Venta Débito/Crédito</option>
              <option value="Zelle / Zinli">Zelle / Zinli</option>
              <option value="Mixto (USD + Bs)">Pago Mixto</option>
            </select>

            <input 
              type="text"
              placeholder="Referencia de pago o notas..."
              value={paymentRef}
              onChange={e => setPaymentRef(e.target.value)}
              className={styles.clientInput}
            />
          </div>

          {/* Totals */}
          <div className={styles.totalsBox}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total a Cobrar USD:</span>
              <span className={styles.totalBigUSD}>{formatPrice(totalUSD)}</span>
            </div>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Equivalente Oficial BCV:</span>
              <span className={styles.totalBigVES}>
                Bs. {totalVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Action button */}
          <button 
            type="button" 
            className={styles.checkoutBtn}
            disabled={cart.length === 0 || submitting}
            onClick={handleCheckout}
          >
            {submitting ? 'Procesando Venta...' : '⚡ Cobrar y Emitir Venta'}
          </button>
        </section>
      </main>
    </div>
  );
}
