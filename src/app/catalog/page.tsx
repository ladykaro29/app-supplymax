'use client';

import React, { useState } from 'react';
import Header from '@/components/Header/Header';
import { useAppContext } from '@/context/AppContext';
import { PRODUCTS, Product } from '@/data/products';
import Image from 'next/image';
import styles from './Catalog.module.css';

export default function CatalogPage() {
  const { formatPrice } = useAppContext();
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [activeGoal, setActiveGoal] = useState<string>('Todos');

  const categories = ['Todos', 'Proteínas', 'Aminoácidos', 'Ropa'];
  const goals = ['Todos', 'Ganancia', 'Definición', 'Energía'];

  const filteredProducts = PRODUCTS.filter(product => {
    const categoryMatch = activeCategory === 'Todos' || product.category === activeCategory;
    const goalMatch = activeGoal === 'Todos' || product.goal === activeGoal;
    return categoryMatch && goalMatch;
  });

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.catalogLayout}>
        {/* Sidebar Filters */}
        <aside className={`${styles.sidebar} glass`}>
          <div className={styles.filterSection}>
            <h3>Categorías</h3>
            <ul>
              {categories.map(cat => (
                <li 
                  key={cat} 
                  className={activeCategory === cat ? styles.active : ''}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.filterSection}>
            <h3>Objetivos</h3>
            <ul>
              {goals.map(goal => (
                <li 
                  key={goal} 
                  className={activeGoal === goal ? styles.active : ''}
                  onClick={() => setActiveGoal(goal)}
                >
                  {goal}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className={styles.content}>
          <header className={styles.pageHeader}>
            <h1>Catálogo Completo</h1>
            <p>Mostrando {filteredProducts.length} productos</p>
          </header>

          <div className={styles.productGrid}>
            {filteredProducts.map(product => (
              <div key={product.id} className={`${styles.productCard} glass`}>
                <div className={styles.productBadge}>{product.goal}</div>
                <div className={styles.productImageWrapper}>
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
                  <button className={styles.addToCart}>Añadir al Carrito</button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className={styles.noResults}>
              <p>No se encontraron productos con estos filtros.</p>
              <button onClick={() => { setActiveCategory('Todos'); setActiveGoal('Todos'); }}>Limpiar Filtros</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
