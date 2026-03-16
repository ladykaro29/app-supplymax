'use client';

import React from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { useAppContext } from '@/context/AppContext';
import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: "Pure Whey Impact 5lb",
    image: "/protein.png",
    price: 65.00,
    category: "Proteínas",
    goal: "MÁS VENDIDO",
    description: "Proteína de suero de alta calidad."
  },
  {
    id: 2,
    name: "Creatine Micronized 300g",
    image: "/creatine.png",
    price: 35.00,
    category: "Creatinas",
    goal: "OFERTA",
    description: "Creatina monohidratada pura."
  }
];

export default function Home() {
  const { formatPrice, addToCart } = useAppContext();

  return (
    <div className={styles.container}>
      <Header />
      
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
            {FEATURED_PRODUCTS.map((product) => (
              <div key={product.id} className={styles.productCard}>
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
                  <div className={styles.price}>{formatPrice(product.price)}</div>
                  <button 
                    className={styles.addBtn}
                    onClick={() => addToCart(product as any)}
                  >
                    + AÑADIR AL CARRITO
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
