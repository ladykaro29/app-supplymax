'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Ropa.module.css';

interface RopaClientProps {
  products: any[];
}

export default function RopaClient({ products }: RopaClientProps) {
  const { formatPrice, addToCart } = useAppContext();
  
  // Hero Slider for Clothing Model Photos (3 slides)
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroImages = [
    '/sliders/ropa/1.png',
    '/sliders/ropa/2.png',
    '/sliders/ropa/3.png'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Filter sections
  const coleccionBlanca = products.filter(p => 
    p.stock > 0 && (
      p.goal === 'COLECCIÓN BLANCA' || 
      p.name.toLowerCase().includes('blanca') || 
      p.name.toLowerCase().includes('blanco') || 
      p.name.toLowerCase().includes('white')
    )
  );

  const coleccionNegra = products.filter(p => 
    p.stock > 0 && (
      p.goal === 'COLECCIÓN NEGRA' || 
      p.name.toLowerCase().includes('negra') || 
      p.name.toLowerCase().includes('negro') || 
      p.name.toLowerCase().includes('black') ||
      p.name.toLowerCase().includes('jogger')
    )
  );

  const accesorios = products.filter(p => 
    p.stock > 0 && (
      p.name.toLowerCase().includes('bolso') || 
      p.name.toLowerCase().includes('mochila') || 
      p.name.toLowerCase().includes('bag') || 
      p.goal === 'ACCESORIO'
    )
  );

  // Scroll to Bolso support
  const bolsoRef = useRef<HTMLDivElement>(null);
  const [highlightBolso, setHighlightBolso] = useState(false);

  useEffect(() => {
    // Check hash on mount or hash change
    const checkHash = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#bolso') {
        setTimeout(() => {
          bolsoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightBolso(true);
          // Remove glow after 3 seconds
          setTimeout(() => setHighlightBolso(false), 3000);
        }, 500); // Small delay to ensure render is completed
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const renderProductGrid = (rowProducts: any[], isAccesoris = false) => (
    <div className={styles.productGrid}>
      {rowProducts.map(product => {
        const isBolsoItem = product.name.toLowerCase().includes('bolso');
        return (
          <div 
            key={product.id} 
            ref={isBolsoItem ? bolsoRef : null}
            className={`${styles.productCard} ${isBolsoItem && highlightBolso ? styles.highlightedCard : ''}`}
          >
            <Link href={`/producto/${product.id}`} className={styles.cardLink}>
              <div className={styles.productImageArea}>
                 {product.goal && <div className={styles.cardBadge}>{product.goal}</div>}
                 <div className={styles.imgContainer}>
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    width={280} 
                    height={280} 
                    className={styles.productImage}
                  />
                 </div>
              </div>
              <div className={styles.productInfo}>
                <span className={styles.category}>{product.category}</span>
                <h3>{product.name}</h3>
                <div className={styles.priceRow}>
                  {product.isOffer && product.discount ? (
                    <>
                      <span className={styles.price}>{formatPrice(product.price - product.discount)}</span>
                      <span className={styles.oldPrice}>{formatPrice(product.price)}</span>
                    </>
                  ) : (
                    <div className={styles.price}>{formatPrice(product.price)}</div>
                  )}
                </div>
              </div>
            </Link>
            <div className={styles.infoAction}>
              <button 
                className={styles.addBtn}
                onClick={() => addToCart(product)}
              >
                + AÑADIR AL CARRITO
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <main className={styles.main}>
      {/* 1. Dedicated Slider: Hero Clothing (Full-Width) */}
      <section className={styles.clothingHero}>
        {heroImages.map((img, idx) => (
          <div 
            key={idx} 
            className={`${styles.clothingSlide} ${currentSlide === idx ? styles.activeSlide : ''}`}
          >
            <div className={styles.clothingSlideOverlay} />
            <Image 
              src={img} 
              alt="Colección SupplyMax" 
              fill 
              className={styles.clothingSlideImg} 
              priority={idx === 0}
            />
            <div className={styles.clothingSlideContent}>
              <span className={styles.clothingSlideBadge}>COLECCIÓN PREMIUM 2026</span>
              <h2>ENTRENA CON <span>ESTILO</span></h2>
              <p>Hormas oversized e indumentaria de alto rendimiento para atletas comprometidos.</p>
              <button 
                onClick={() => {
                  window.scrollTo({
                    top: window.innerHeight - 80,
                    behavior: 'smooth'
                  });
                }}
                className={styles.clothingSlideBtn}
              >
                Ver Colecciones
              </button>
            </div>
          </div>
        ))}
        
        <div className={styles.slideDots}>
          {heroImages.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`${styles.slideDot} ${currentSlide === idx ? styles.activeDot : ''}`}
              aria-label={`Ver slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. Catálogo de Artículos por Hileras */}
      <div className={styles.catalogContent}>
        {/* Row 1: Colección Blanca */}
        {coleccionBlanca.length > 0 && (
          <section className={styles.rowSection}>
            <div className={styles.rowHeader}>
              <h2>COLECCIÓN <span>BLANCA</span></h2>
              <p>Indumentaria minimalista premium en tonos blancos y crema</p>
            </div>
            {renderProductGrid(coleccionBlanca)}
          </section>
        )}

        {/* Row 2: Colección Negra */}
        {coleccionNegra.length > 0 && (
          <section className={styles.rowSection}>
            <div className={styles.rowHeader}>
              <h2>COLECCIÓN <span>NEGRA</span></h2>
              <p>Prendas oscuras de alto rendimiento y lifestyle de algodón pesado</p>
            </div>
            {renderProductGrid(coleccionNegra)}
          </section>
        )}

        {/* Row 3: Accesorios de Transporte (El Bolso SupplyMax) */}
        {accesorios.length > 0 && (
          <section className={styles.rowSection}>
            <div className={styles.rowHeader}>
              <h2>ACCESORIOS DE <span>TRANSPORTE</span></h2>
              <p>Equipamiento premium para llevar tus suplementos y pertenencias deportivas</p>
            </div>
            {renderProductGrid(accesorios, true)}
          </section>
        )}

        {/* Fallback if all lists collapsed */}
        {coleccionBlanca.length === 0 && coleccionNegra.length === 0 && accesorios.length === 0 && (
          <div className={styles.emptyState}>
            <h2>Colección agotada</h2>
            <p>Disculpe las molestias. Estamos confeccionando nuestro próximo drop de indumentaria deportiva de alta calidad.</p>
            <Link href="/" className={styles.backHome}>
              Regresar al Inicio
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
