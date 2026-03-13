'use client';

import React from 'react';
import Header from '@/components/Header/Header';
import { useAppContext } from '@/context/AppContext';
import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: "Pure Whey Impact",
    image: "/protein.png",
    price: 49.99,
    category: "Proteína",
    goal: "Ganancia" as any,
    description: "Proteína de suero de alta calidad."
  },
  {
    id: 2,
    name: "Creatine Micronized",
    image: "/creatine.png",
    price: 34.99,
    category: "Aminoácidos",
    goal: "Ganancia" as any,
    description: "Creatina pura."
  }
];

export default function Home() {
  const { formatPrice, addToCart } = useAppContext();

  return (
    <div className={styles.container}>
      <Header />
      
      <main>
        {/* ... hero ... */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>Nuevo Arribo: Supplymax Elite</span>
            <h1>TRANSFORMA TU <br /><span>RENDIMIENTO</span></h1>
            <p>La nutrición deportiva más avanzada con envíos a toda Venezuela y pagos locales sin complicaciones.</p>
            <div className={styles.heroActions}>
              <Link href="/catalog" className={styles.linkBtn}>
                <button className={styles.primaryBtn}>Ver Catálogo</button>
              </Link>
              <Link href="/coaches" className={styles.linkBtn}>
                <button className={styles.secondaryBtn}>Nuestros Coaches</button>
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            {/* Visual element placeholder */}
            <div className={styles.glowCircle}></div>
          </div>
        </section>

        {/* Featured Section */}
        <section className={styles.featured}>
          <div className={styles.sectionHeader}>
            <h2>Productos <span>Destacados</span></h2>
            <p>Seleccionados para tus objetivos</p>
          </div>

          <div className={styles.productGrid}>
            {FEATURED_PRODUCTS.map((product) => (
              <div key={product.id} className={`${styles.productCard} glass`}>
                <div className={styles.productBadge}>{product.goal}</div>
                <div className={styles.productImagePlaceholder}>
                   <Image 
                    src={product.image} 
                    alt={product.name} 
                    width={200} 
                    height={200} 
                    className={styles.productImage}
                   />
                </div>
                <div className={styles.productInfo}>
                  <span className={styles.category}>{product.category}</span>
                  <h3>{product.name}</h3>
                  <div className={styles.price}>{formatPrice(product.price)}</div>
                  <button 
                    className={styles.addToCart}
                    onClick={() => addToCart(product as any)}
                  >
                    Añadir al Carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
