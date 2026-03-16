'use client';

import React, { useState } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { useAppContext } from '@/context/AppContext';
import { PRODUCTS } from '@/data/products';
import Image from 'next/image';
import styles from './Catalog.module.css';

export default function CatalogPage() {
  const { formatPrice, addToCart } = useAppContext();
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  const categories = ['Todos', 'Proteínas', 'Creatinas', 'Pre-Entrenos', 'Aminoácidos/BCAA', 'Quemadores/Otros'];

  const filteredProducts = PRODUCTS.filter(product => {
    return activeCategory === 'Todos' || product.category === activeCategory;
  });

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.catalogLayout}>
        <header className={styles.pageHeader}>
          <div>
            <h1>Catálogo</h1>
            <p>EL COMBUSTIBLE DE LOS CAMPEONES</p>
          </div>
          <div>Mostrando {filteredProducts.length} productos</div>
        </header>

        {/* Top Filter Bar */}
        <div className={styles.filterBar}>
          {categories.map(cat => (
            <button 
              key={cat}
              className={`${styles.filterBtn} ${activeCategory === cat ? styles.active : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className={styles.productGrid}>
          {filteredProducts.map(product => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.imageArea}>
                 <Image 
                  src={product.image} 
                  alt={product.name} 
                  width={250} 
                  height={250} 
                  className={styles.productImage}
                 />
              </div>
              <div className={styles.info}>
                <span className={styles.categoryBadge}>{product.category}</span>
                <h3>{product.name}</h3>
                <div className={styles.price}>{formatPrice(product.price)}</div>
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
        
        {filteredProducts.length === 0 && (
          <div className={styles.noResults}>
            <p>No se encontraron productos en esta categoría.</p>
            <button className={styles.filterBtn} onClick={() => setActiveCategory('Todos')}>Ver Todos</button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
