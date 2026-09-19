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
  
  // Catálogo Slider de Suplementos (6 banners oficiales)
  const suplementoBanners = [
    '/sliders/suplementos/1.png',
    '/sliders/suplementos/2.png',
    '/sliders/suplementos/3.png',
    '/sliders/suplementos/4.png',
    '/sliders/suplementos/5.png',
    '/sliders/suplementos/6.png'
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % suplementoBanners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [suplementoBanners.length]);

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
      {/* 1. Slider Oficial Catálogo de Suplementos */}
      <section className={styles.creatineHero}>
        {suplementoBanners.map((banner, idx) => (
          <div 
            key={idx} 
            className={`${styles.creatineSlide} ${currentSlide === idx ? styles.activeSlide : ''}`}
          >
            <Image 
              src={banner} 
              alt={`Catálogo Suplementos ${idx + 1}`} 
              fill 
              className={styles.creatineSlideImg} 
              priority={idx === 0}
            />
          </div>
        ))}
        
        <div className={styles.slideDots}>
          {suplementoBanners.map((_, idx) => (
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
