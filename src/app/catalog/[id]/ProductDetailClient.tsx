'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ProductDetail.module.css';

import { Product } from '@/data/products';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart, formatPrice } = useAppContext();
  const [quantity, setQuantity] = useState(1);
  const [selectedFlavor, setSelectedFlavor] = useState(product.flavors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');

  const handleAddToCart = () => {
    // Construct variant name if applicable
    const variantName = [selectedFlavor, selectedSize].filter(Boolean).join(' - ');
    const productWithVariant = {
      ...product,
      name: variantName ? `${product.name} (${variantName})` : product.name
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(productWithVariant);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.breadcrumb}>
        <Link href="/catalog">CATÁLOGO</Link> / <span className={styles.activeBr}>{product.name.toUpperCase()}</span>
      </div>

      <div className={styles.productGrid}>
        {/* Left: Image Gallery */}
        <div className={styles.imageSection}>
          <div className={`${styles.mainImageWrapper} glass neon-glow`}>
            {product.goal && <div className={styles.goalBadge}>{product.goal.toUpperCase()}</div>}
            <Image 
              src={product.image} 
              alt={product.name} 
              width={500} 
              height={500} 
              className={styles.mainImage}
              priority
            />
          </div>
          <div className={styles.thumbnails}>
             <div className={`${styles.thumb} active`}>
               <Image src={product.image} alt="thumb" width={80} height={80} />
             </div>
             {/* Dynamic thumbnails would go here if available */}
          </div>
        </div>

        {/* Right: Info Area */}
        <div className={styles.infoSection}>
          <span className={styles.category}>{product.category.toUpperCase()}</span>
          <h1 className={styles.title}>{product.name.toUpperCase()}</h1>
          
          <div className={styles.priceContainer}>
            <div className={styles.mainPrice}>{formatPrice(product.price)}</div>
            {product.durationInDays && <div className={styles.vesConversion}>Rinde para aprox. {product.durationInDays} días</div>}
          </div>

          <div className={styles.highlights}>
            {product.highlights?.map((h, i) => (
              <div key={i} className={styles.hItem}>
                <span className={styles.hIcon}>✓</span>
                {h}
              </div>
            ))}
          </div>

          <p className={styles.description}>
            {product.description}
          </p>

          <div className={styles.variationSection}>
            {product.flavors && product.flavors.length > 0 && (
              <div>
                <span className={styles.variationTitle}>SABOR SELECCIONADO: {selectedFlavor}</span>
                <div className={styles.variationGrid}>
                  {product.flavors.map(f => (
                    <button 
                      key={f} 
                      className={`${styles.varBtn} ${selectedFlavor === f ? styles.active : ''}`}
                      onClick={() => setSelectedFlavor(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div>
                <span className={styles.variationTitle}>PRESENTACIÓN: {selectedSize}</span>
                <div className={styles.variationGrid}>
                  {product.sizes.map(s => (
                    <button 
                      key={s} 
                      className={`${styles.varBtn} ${selectedSize === s ? styles.active : ''}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.purchaseArea}>
            <div className={styles.quantitySelector}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            
            <button className={styles.addBtn} onClick={handleAddToCart}>
              + AÑADIR AL CARRITO
            </button>
          </div>

          <div className={styles.shippingInfo}>
            <div className={styles.shipItem}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
               <span>Envío Nacional (MRW, Zoom, Tealca)</span>
            </div>
            <div className={styles.shipItem}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
               <span>Entrega en Mérida (Personal / Agencia)</span>
            </div>
          </div>

          <div className={styles.trustBadges}>
             <div className={styles.badge}>100% ORIGINAL</div>
             <div className={styles.badge}>SELLADO DE FÁBRICA</div>
          </div>
        </div>
      </div>
    </main>
  );
}
