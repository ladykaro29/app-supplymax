'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Suplementos.module.css';

interface SuplementosClientProps {
  products: any[];
}

export default function SuplementosClient({ products }: SuplementosClientProps) {
  const { formatPrice, addToCart } = useAppContext();
  
  // Hero Slider for Creatines (we have 4 seeded)
  const creatinas = products.filter(p => p.category === 'Creatinas');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (creatinas.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(4, creatinas.length));
    }, 5000);
    return () => clearInterval(interval);
  }, [creatinas.length]);

  // Filters for separate rows
  const proteinas = products.filter(p => p.category === 'Proteínas' && p.stock > 0);
  const creatinasStock = products.filter(p => p.category === 'Creatinas' && p.stock > 0);
  const masSuplementos = products.filter(p => p.category !== 'Proteínas' && p.category !== 'Creatinas' && p.stock > 0);

  const renderProductGrid = (rowProducts: any[]) => (
    <div className={styles.productGrid}>
      {rowProducts.map(product => (
        <div key={product.id} className={styles.productCard}>
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
      ))}
    </div>
  );

  return (
    <main className={styles.main}>
      {/* 1. Slider de Creatinas (Hero dedicated full width) */}
      {creatinas.length > 0 && (
        <section className={styles.creatineHero}>
          {creatinas.slice(0, 4).map((c, idx) => (
            <div 
              key={c.id} 
              className={`${styles.creatineSlide} ${currentSlide === idx ? styles.activeSlide : ''}`}
            >
              <div className={styles.creatineSlideOverlay} />
              <Image 
                src={c.image} 
                alt={c.name} 
                fill 
                className={styles.creatineSlideImg} 
                priority={idx === 0}
              />
              <div className={styles.creatineSlideContent}>
                <span className={styles.creatineSlideBadge}>CREATINA SUPREME</span>
                <h2>{c.name}</h2>
                <p>{c.description}</p>
                <div className={styles.creatineSlidePrice}>{formatPrice(c.price)}</div>
                <Link href={`/producto/${c.id}`} className={styles.creatineSlideBtn}>
                  Ver Detalle
                </Link>
              </div>
            </div>
          ))}
          
          <div className={styles.slideDots}>
            {creatinas.slice(0, 4).map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`${styles.slideDot} ${currentSlide === idx ? styles.activeDot : ''}`}
                aria-label={`Ver slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. Catálogo de Artículos por Hileras */}
      <div className={styles.catalogContent}>
        {/* Row 1: Proteínas */}
        {proteinas.length > 0 && (
          <section className={styles.rowSection}>
            <div className={styles.rowHeader}>
              <h2>PROTEÍNAS <span>Premium</span></h2>
              <p>Fórmulas limpias para regeneración y ganancia muscular</p>
            </div>
            {renderProductGrid(proteinas)}
          </section>
        )}

        {/* Row 2: Creatinas */}
        {creatinasStock.length > 0 && (
          <section className={styles.rowSection}>
            <div className={styles.rowHeader}>
              <h2>CREATINAS <span>Científicas</span></h2>
              <p>Fuerza explosiva, potencia e hidratación muscular</p>
            </div>
            {renderProductGrid(creatinasStock)}
          </section>
        )}

        {/* Row 3: Más Suplementos */}
        {masSuplementos.length > 0 && (
          <section className={styles.rowSection}>
            <div className={styles.rowHeader}>
              <h2>MÁS <span>SUPLEMENTOS</span></h2>
              <p>Pre-entrenos, aminoácidos y rendimiento celular completo</p>
            </div>
            {renderProductGrid(masSuplementos)}
          </section>
        )}

        {/* Fallback if all lists collapsed */}
        {proteinas.length === 0 && creatinasStock.length === 0 && masSuplementos.length === 0 && (
          <div className={styles.emptyState}>
            <h2>Catálogo temporalmente vacío</h2>
            <p>Disculpe las molestias. Estamos reabasteciendo nuestro stock de suplementos premium.</p>
            <Link href="/" className={styles.backHome}>
              Regresar al Inicio
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
