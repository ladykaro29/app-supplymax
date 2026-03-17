'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './Catalog.module.css';

interface CatalogClientProps {
  initialProducts: any[];
}

export default function CatalogClient({ initialProducts }: CatalogClientProps) {
  const { formatPrice, addToCart } = useAppContext();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [activeCategory, setActiveCategory] = useState<string>(categoryParam || 'Todos');

  const categories = ['Proteínas', 'Creatinas', 'Pre-Entrenos', 'Aminoácidos/BCAA', 'Quemadores/Otros', 'Ropa'];

  // Helper to render a group of products
  const renderProductGrid = (products: any[]) => (
    <div className={styles.productGrid}>
      {products.map(product => (
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
  );

  return (
    <main className={styles.catalogLayout}>
      <header className={styles.pageHeader}>
        <div>
          <h1>Catálogo <span>Pro</span></h1>
          <p>EQUÍPATE CON LO MEJOR DEL MERCADO</p>
        </div>
        <div className={styles.stats}>
          <strong>{initialProducts.length}</strong> PRODUCTOS DISPONIBLES
        </div>
      </header>

      {/* Top Filter Bar */}
      <div className={styles.filterBar}>
        <button 
          className={`${styles.filterBtn} ${activeCategory === 'Todos' ? styles.active : ''}`}
          onClick={() => setActiveCategory('Todos')}
        >
          Ver Todos
        </button>
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

      <div className={styles.content}>
        {activeCategory === 'Todos' ? (
          /* "Lineas de Productos" View */
          <div className={styles.linesContainer}>
            {/* Featured Line (Just taking first 4 for now) */}
            <section className={styles.categorySection}>
              <div className={styles.sectionHeader}>
                <h2>💣 LO MÁS <span>DESTACADO</span></h2>
                <Link href="/catalog?filter=Proteínas" className={styles.viewMore}>VER TODO</Link>
              </div>
              {renderProductGrid(initialProducts.slice(0, 4))}
            </section>

            {/* Dynamically render other categories */}
            {categories.map(cat => {
              const catProducts = initialProducts.filter(p => p.category === cat).slice(0, 4);
              if (catProducts.length === 0) return null;
              
              return (
                <section key={cat} className={styles.categorySection}>
                  <div className={styles.sectionHeader}>
                    <h2>⚡ LÍNEA DE <span>{cat.toUpperCase()}</span></h2>
                    <button className={styles.viewMore} onClick={() => setActiveCategory(cat)}>VER TODO</button>
                  </div>
                  {renderProductGrid(catProducts)}
                </section>
              );
            })}
          </div>
        ) : (
          /* Filtered List View */
          <div className={styles.filteredView}>
            <div className={styles.sectionHeader}>
              <h2>Resultados: <span>{activeCategory}</span></h2>
              <button 
                className={styles.viewMore} 
                onClick={() => setActiveCategory('Todos')}
              >
                LIMPIAR FILTROS
              </button>
            </div>
            {renderProductGrid(initialProducts.filter(p => p.category === activeCategory))}
          </div>
        )}
      </div>
      
      {activeCategory !== 'Todos' && initialProducts.filter(p => p.category === activeCategory).length === 0 && (
        <div className={styles.noResults}>
          <p>No se encontraron productos en esta categoría.</p>
          <button className={styles.filterBtn} onClick={() => setActiveCategory('Todos')}>Ver Todos</button>
        </div>
      )}
    </main>
  );
}
