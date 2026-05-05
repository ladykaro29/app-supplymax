'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import PartnerCarousel from '@/components/PartnerCarousel/PartnerCarousel';

interface HomeClientProps {
  featuredProducts: any[];
  apparelProducts: any[];
  partners: any[];
  reviews: any[];
}

export default function HomeClient({ 
  featuredProducts, 
  apparelProducts, 
  partners, 
  reviews 
}: HomeClientProps) {
  const { formatPrice, addToCart } = useAppContext();

  return (
    <main className={styles.main}>
      {/* 1. Hero Section (Above the Fold) */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.capsule}>
             ⚡ NUEVA COLECCIÓN DISPONIBLE
          </div>
          <h1>SUPPLY MAX <br /><span>ENERGY & PERFORMANCE</span></h1>
          <p>Potencia tu entrenamiento con suplementación premium y la ropa deportiva con mejor calce del mercado.</p>
          
          <div className={styles.heroActions}>
            <Link href="/catalog">
              <button className={`${styles.btnLarge} ${styles.btnPrimary}`}>COMPRA RÁPIDA (GUEST)</button>
            </Link>
            <Link href="/catalog">
              <button className={`${styles.btnLarge} ${styles.btnSecondary}`}>VER TODO EL CATÁLOGO</button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Grilla 1: Suplementos Destacados */}
      <section className={styles.featured}>
        <div className={styles.sectionHeader}>
          <p>EL COMBUSTIBLE DE LOS CAMPEONES</p>
          <h2>Suplementos <span>Destacados</span></h2>
        </div>
        <ProductGrid products={featuredProducts} formatPrice={formatPrice} addToCart={addToCart} />
      </section>

      {/* 3. Zonas Supply Max (Banners de Anclaje) */}
      <section className={styles.zones}>
        <div className={styles.zoneGrid}>
          <Link href="/catalog?category=Creatinas" className={styles.zoneCard}>
            <div className={styles.zoneOverlay}></div>
            <Image src="/banners/creatina-zone.jpg" alt="Zona Creatina" fill className={styles.zoneImg} />
            <div className={styles.zoneContent}>
              <h3>ZONA CREATINA</h3>
              <button>Ver todas</button>
            </div>
          </Link>
          <Link href="/catalog?category=Proteínas" className={styles.zoneCard}>
            <div className={styles.zoneOverlay}></div>
            <Image src="/banners/proteina-zone.jpg" alt="Zona Proteína" fill className={styles.zoneImg} />
            <div className={styles.zoneContent}>
              <h3>ZONA PROTEÍNA</h3>
              <button>Ver todas</button>
            </div>
          </Link>
          <Link href="/catalog?category=Pre-Entrenos" className={styles.zoneCard}>
            <div className={styles.zoneOverlay}></div>
            <Image src="/banners/pre-zone.jpg" alt="Zona Pre Entrenos" fill className={styles.zoneImg} />
            <div className={styles.zoneContent}>
              <h3>ZONA PRE-ENTRENO</h3>
              <button>Ver todas</button>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Grilla 2: Ropa Destacada (NUEVA) */}
      <section className={styles.featured}>
        <div className={styles.sectionHeader}>
          <p>ENTRENA CON ESTILO</p>
          <h2>Ropa & <span>Lifestyle</span></h2>
        </div>
        <ProductGrid products={apparelProducts} formatPrice={formatPrice} addToCart={addToCart} />
      </section>

      {/* 5. Carrusel de Socios (NUEVO) */}
      <section className={styles.partnersSection}>
        <div className={styles.sectionHeader}>
          <p>NUESTRO EQUIPO DE PODER</p>
          <h2>Partners & <span>Coaches</span></h2>
        </div>
        <PartnerCarousel partners={partners} />
      </section>

      {/* 6. Panel de Experiencias (Testimonios) */}
      <section className={styles.testimonials}>
        <div className={styles.sectionHeader}>
          <p>LO QUE DICEN NUESTROS ATLETAS</p>
          <h2>Experiencias <span>SupplyMax</span></h2>
        </div>
        <div className={styles.testimonialGrid}>
          {reviews.length > 0 ? reviews.map((review: any) => (
            <div key={review.id} className={`${styles.testimonialCard} glass`}>
              <div className={styles.stars}>
                {[...Array(review.rating)].map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="var(--color-accent)"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                ))}
              </div>
              <p>"{review.comment}"</p>
              <div className={styles.testUser}>
                <strong>{review.user?.name}</strong>
                {review.isVerified && <span className={styles.verifiedTag}>● Comprador Verificado</span>}
              </div>
            </div>
          )) : (
            <p className={styles.emptyMsg}>Sé el primero en compartir tu experiencia.</p>
          )}
        </div>
      </section>
    </main>
  );
}

function ProductGrid({ products, formatPrice, addToCart }: any) {
  return (
    <div className={styles.productGrid}>
      {products.length > 0 ? products.map((product: any) => (
        <div key={product.id} className={styles.productCard}>
          <Link href={`/catalog/${product.id}`} className={styles.cardLink}>
            <div className={styles.productImageArea}>
               <div className={styles.cardBadge}>{product.goal}</div>
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
      )) : (
        <p className={styles.noResults}>Próximamente...</p>
      )}
    </div>
  );
}
