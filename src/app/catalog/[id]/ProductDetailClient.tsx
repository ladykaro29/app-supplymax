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
  const [activeThumb, setActiveThumb] = useState(0);
  
  // Normalize flavors and sizes to arrays
  const flavorsArr = Array.isArray(product.flavors) 
    ? product.flavors 
    : (product.flavor ? product.flavor.split(',').map((s: string) => s.trim()) : []);
    
  const sizesArr = Array.isArray(product.sizes)
    ? product.sizes
    : (typeof product.sizes === 'string' ? product.sizes.split(',').map((s: string) => s.trim()) : []);

  const [selectedFlavor, setSelectedFlavor] = useState(flavorsArr[0] || '');
  const [selectedSize, setSelectedSize] = useState(sizesArr[0] || '');

  // Full gallery of up to 10 product images
  const galleryImages: string[] = (() => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.filter(Boolean);
    }
    if (typeof product.images === 'string' && product.images.trim()) {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(Boolean);
        }
      } catch {
        const parts = product.images.split(',').map((s: string) => s.trim()).filter(Boolean);
        if (parts.length > 0) return parts;
      }
    }
    return [product.image || '/protein.png'];
  })();

  const currentDisplayImage = galleryImages[activeThumb] || galleryImages[0] || product.image || '/protein.png';

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
            <img 
              src={currentDisplayImage} 
              alt={product.name} 
              className={styles.mainImage}
              onError={(e) => { (e.target as HTMLImageElement).src = '/protein.png'; }}
            />
          </div>
          {galleryImages.length > 1 && (
            <div className={styles.thumbnails}>
              {galleryImages.map((imgSrc: string, idx: number) => (
                <div 
                  key={`${imgSrc}-${idx}`} 
                  className={`${styles.thumb} ${activeThumb === idx ? styles.active : ''}`}
                  onClick={() => setActiveThumb(idx)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={imgSrc} 
                    alt={`${product.name} miniatura ${idx + 1}`} 
                    width={80} 
                    height={80} 
                    style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/protein.png'; }}
                  />
                </div>
              ))}
            </div>
          )}
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
            {flavorsArr.length > 0 && (
              <div>
                <span className={styles.variationTitle}>SABOR SELECCIONADO: {selectedFlavor}</span>
                <div className={styles.variationGrid}>
                  {flavorsArr.map(f => (
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

            {sizesArr.length > 0 && (
              <div>
                <span className={styles.variationTitle}>PRESENTACIÓN: {selectedSize}</span>
                <div className={styles.variationGrid}>
                  {sizesArr.map(s => (
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
