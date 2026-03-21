'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

interface HomeClientProps {
  featuredProducts: any[];
}

export default function HomeClient({ featuredProducts }: HomeClientProps) {
  const { formatPrice, addToCart } = useAppContext();

  return (
    <main>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.capsule}>
             ● Envíos a agencias MRW, Zoom y Tealca
          </div>
          <h1>SUPPLY MAX: <br /><span>TU ALIADO EN EL RENDIMIENTO.</span></h1>
          <p>POTENCIA TU RENDIMIENTO. Suplementos de calidad premium para atletas que buscan resultados reales.</p>
          
          <div className={styles.statsGrid}>
             <div className={styles.statItem}>
                <strong>21+</strong>
                <span>Productos</span>
             </div>
             <div className={styles.statItem}>
                <strong>100%</strong>
                <span>Originales</span>
             </div>
             <div className={styles.statItem}>
                <strong>BCV+</strong>
                <span>Tasa del día</span>
             </div>
          </div>

          <div className={styles.heroActions}>
            <Link href="/catalog">
              <button className={`${styles.btnLarge} ${styles.btnPrimary}`}>VER CATÁLOGO</button>
            </Link>
            <button className={`${styles.btnLarge} ${styles.btnSecondary}`}>ATENCIÓN AL CLIENTE</button>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className={styles.featured}>
        <div className={styles.sectionHeader}>
          <p>Lo más TOP para tu entrenamiento</p>
          <h2>Productos <span>Destacados</span></h2>
        </div>

        <div className={styles.productGrid}>
          {featuredProducts.length > 0 ? featuredProducts.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <Link href={`/catalog/${product.id}`} className={styles.cardLink}>
                <div className={styles.productImageArea}>
                   <div className={styles.cardBadge}>{product.goal}</div>
                   <Image 
                    src={product.image} 
                    alt={product.name} 
                    width={280} 
                    height={280} 
                    className={styles.productImage}
                   />
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
          )) : (
            <p className={styles.noResults}>No hay productos destacados en este momento.</p>
          )}
        </div>
      </section>
    </main>
  );
}
