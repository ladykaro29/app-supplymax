'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Catalog.module.css';

interface CatalogClientProps {
  initialProducts: any[];
}

export default function CatalogClient({ initialProducts }: CatalogClientProps) {
  const { formatPrice, addToCart } = useAppContext();
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  const categories = ['Todos', 'Proteínas', 'Creatinas', 'Pre-Entrenos', 'Aminoácidos/BCAA', 'Quemadores/Otros'];

  const filteredProducts = initialProducts.filter(product => {
    return activeCategory === 'Todos' || product.category === activeCategory;
  });

  return (
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
            <Link href={`/catalog/${product.id}`} className={styles.cardLink}>
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
      
      {filteredProducts.length === 0 && (
        <div className={styles.noResults}>
          <p>No se encontraron productos en esta categoría.</p>
          <button className={styles.filterBtn} onClick={() => setActiveCategory('Todos')}>Ver Todos</button>
        </div>
      )}
    </main>
  );
}
