'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ProductDetail.module.css';

interface ProductDetailClientProps {
  product: any;
  reviews: any[];
  recommendations: any[];
}

export default function ProductDetailClient({ 
  product, 
  reviews, 
  recommendations 
}: ProductDetailClientProps) {
  const { addToCart, formatPrice } = useAppContext();
  const [quantity, setQuantity] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);

  // Accordion dropdown states
  const [showSpecs, setShowSpecs] = useState(false);
  const [showShipping, setShowShipping] = useState(false);

  // Normalize flavors and sizes to arrays
  const flavorsArr = Array.isArray(product.flavors) 
    ? product.flavors 
    : (product.flavor ? product.flavor.split(',').map((s: string) => s.trim()) : []);
    
  const sizesArr = Array.isArray(product.sizes)
    ? product.sizes
    : (typeof product.sizes === 'string' ? product.sizes.split(',').map((s: string) => s.trim()) : []);

  const [selectedFlavor, setSelectedFlavor] = useState(flavorsArr[0] || '');
  const [selectedSize, setSelectedSize] = useState(sizesArr[0] || '');

  const handleAddToCart = () => {
    // Construct variant name if applicable
    const variantName = [selectedFlavor, selectedSize].filter(Boolean).join(' - ');
    const productWithVariant = {
      ...product,
      name: variantName ? `${product.name} (${variantName})` : product.name
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(productWithVariant);
    }
    alert(`${quantity} x "${product.name}" añadido al carrito.`);
  };

  // Map real review photos for community reviews
  const getReviewPhoto = (index: number) => {
    if (product.category === 'Ropa') {
      const photos = [
        '/brand-photos/Ropa con modelo/IMG_7282.png',
        '/brand-photos/Ropa con modelo/IMG_7284.png',
        '/brand-photos/Ropa con modelo/IMG_7286.png',
        '/brand-photos/Ropa con modelo/IMG_7294.png'
      ];
      return photos[index % photos.length];
    } else {
      const photos = [
        '/brand-photos/Suplementos + ropa/Photoroom_20260328_114247.jpg',
        '/brand-photos/Suplementos + ropa/Photoroom_20260328_114305.jpg',
        '/brand-photos/Suplementos + ropa/IMG_6560.jpg',
        '/brand-photos/Suplementos + ropa/IMG_6561.jpg'
      ];
      return photos[index % photos.length];
    }
  };

  return (
    <main className={styles.main}>
      {/* Breadcrumb navigation */}
      <div className={styles.breadcrumb}>
        <Link href="/">INICIO</Link> / <Link href={product.category === 'Ropa' ? '/ropa' : '/suplementos'}>{product.category.toUpperCase()}</Link> / <span className={styles.activeBr}>{product.name.toUpperCase()}</span>
      </div>

      {/* Main product purchase screen */}
      <div className={styles.productGrid}>
        {/* Left: Image Gallery (1:1 format square) */}
        <div className={styles.imageSection}>
          <div className={`${styles.mainImageWrapper} glass`}>
            {product.goal && <div className={styles.goalBadge}>{product.goal.toUpperCase()}</div>}
            <Image 
              src={product.image} 
              alt={product.name} 
              width={600} 
              height={600} 
              className={styles.mainImage}
              priority
            />
          </div>
          <div className={styles.thumbnails}>
             <button 
               onClick={() => setActiveThumb(0)}
               className={`${styles.thumb} ${activeThumb === 0 ? styles.activeThumb : ''}`}
             >
               <Image src={product.image} alt="main photo" width={80} height={80} className={styles.thumbImg} />
             </button>
             {/* Dynamic secondary thumbnails */}
             <button 
               onClick={() => setActiveThumb(1)}
               className={`${styles.thumb} ${activeThumb === 1 ? styles.activeThumb : ''}`}
             >
               <Image src={getReviewPhoto(0)} alt="model photo 1" width={80} height={80} className={styles.thumbImg} />
             </button>
             <button 
               onClick={() => setActiveThumb(2)}
               className={`${styles.thumb} ${activeThumb === 2 ? styles.activeThumb : ''}`}
             >
               <Image src={getReviewPhoto(1)} alt="model photo 2" width={80} height={80} className={styles.thumbImg} />
             </button>
          </div>
        </div>

        {/* Right: Purchase Control Panel */}
        <div className={styles.infoSection}>
          <span className={styles.categoryBadge}>{product.category.toUpperCase()}</span>
          <h1 className={styles.title}>{product.name.toUpperCase()}</h1>
          
          <div className={styles.priceContainer}>
            <div className={styles.mainPrice}>
              {product.isOffer && product.discount ? formatPrice(product.price - product.discount) : formatPrice(product.price)}
            </div>
            {product.isOffer && product.discount && (
              <div className={styles.oldPrice}>{formatPrice(product.price)}</div>
            )}
            {product.durationInDays && (
              <div className={styles.vesConversion}>Rinde aprox: {product.durationInDays} días</div>
            )}
          </div>

          <p className={styles.description}>
            {product.description}
          </p>

          {/* Variants Selectors */}
          <div className={styles.variationSection}>
            {flavorsArr.length > 0 && (
              <div className={styles.variantGroup}>
                <span className={styles.variationTitle}>SABOR SELECCIONADO: {selectedFlavor}</span>
                <div className={styles.variationGrid}>
                  {flavorsArr.map((f: string) => (
                    <button 
                      key={f} 
                      className={`${styles.varBtn} ${selectedFlavor === f ? styles.activeVar : ''}`}
                      onClick={() => setSelectedFlavor(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sizesArr.length > 0 && (
              <div className={styles.variantGroup}>
                <span className={styles.variationTitle}>PRESENTACIÓN / TALLA: {selectedSize}</span>
                <div className={styles.variationGrid}>
                  {sizesArr.map((s: string) => (
                    <button 
                      key={s} 
                      className={`${styles.varBtn} ${selectedSize === s ? styles.activeVar : ''}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity and Cart button */}
          <div className={styles.purchaseArea}>
            <div className={styles.quantitySelector}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            
            <button className={styles.addBtn} onClick={handleAddToCart}>
              + AÑADIR AL CARRITO
            </button>
          </div>

          {/* Collapsible details dropdowns */}
          <div className={styles.dropdownsContainer}>
            {/* Specs Dropdown */}
            <div className={styles.dropdownItem}>
              <button className={styles.dropdownHeader} onClick={() => setShowSpecs(!showSpecs)}>
                <span>{product.category === 'Ropa' ? '📐 GUÍA DE MEDIDAS & ESPECIFICACIONES' : '🔬 FICHA TÉCNICA & INFORMACIÓN NUTRICIONAL'}</span>
                <span>{showSpecs ? '▲' : '▼'}</span>
              </button>
              <div className={`${styles.dropdownContent} ${showSpecs ? styles.dropdownContentActive : ''}`}>
                {product.category === 'Ropa' ? (
                  <div className={styles.specsText}>
                    <strong>Corte Oversize Premium:</strong> Hombros caídos, mangas anchas y caída recta holgada.<br />
                    <strong>Composición:</strong> 100% Algodón Pesado de 240g/m² para una estructura perfecta.<br />
                    <strong>Guía de Tallas (Ancho x Alto en cm):</strong><br />
                    • S: 58 cm x 72 cm<br />
                    • M: 60 cm x 74 cm<br />
                    • L: 62 cm x 76 cm<br />
                    • XL: 64 cm x 78 cm
                  </div>
                ) : (
                  <div className={styles.specsText}>
                    <strong>Ingrediente Principal:</strong> {product.category === 'Creatinas' ? '100% Creatina Monohidratada Micronizada pura.' : 'Suero de leche ultrafiltrado de alta absorción.'}<br />
                    <strong>Servicios por Envase:</strong> {product.portions || '30'} porciones estimadas.<br />
                    <strong>Instrucciones de Uso:</strong> Mezclar 1 scoop con 250ml de agua fría o tu bebida favorita. Consumir de manera constante diariamente.
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Dropdown */}
            <div className={styles.dropdownItem}>
              <button className={styles.dropdownHeader} onClick={() => setShowShipping(!showShipping)}>
                <span>📦 ENVÍOS & MÉTODOS DE PAGO SEGUROS</span>
                <span>{showShipping ? '▲' : '▼'}</span>
              </button>
              <div className={`${styles.dropdownContent} ${showShipping ? styles.dropdownContentActive : ''}`}>
                <div className={styles.specsText}>
                  <strong>Entregas en Mérida:</strong> Delivery Express directo a domicilio o gimnasio en 24-48 horas hábiles.<br />
                  <strong>Envíos Nacionales:</strong> Despacho cobro en destino asegurado mediante Zoom, MRW y Tealca.<br />
                  <strong>Métodos de Pago:</strong> Pago Móvil, Transferencia Bancaria, Divisas en Efectivo, Binance Pay (USDT) y Zelle.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bloque Medio: Prueba Social (Comments & Client Photos) */}
      <section className={styles.reviewsSection}>
        <div className={styles.sectionHeader}>
          <p>VALORACIONES DE LA COMUNIDAD</p>
          <h2>Opiniones <span>Verificadas</span></h2>
        </div>
        
        <div className={styles.reviewsGrid}>
          {reviews.length > 0 ? reviews.map((review: any, index: number) => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewContent}>
                <div className={styles.stars}>
                  {[...Array(review.rating)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#00d1ff">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  ))}
                </div>
                <p className={styles.comment}>"{review.comment}"</p>
                <div className={styles.authorRow}>
                  <strong>{review.user?.name || 'Atleta SupplyMax'}</strong>
                  {review.isVerified && <span className={styles.verifiedTag}>● Comprador Verificado</span>}
                </div>
              </div>
              <div className={styles.reviewPhotoContainer}>
                <Image 
                  src={getReviewPhoto(index)} 
                  alt="Cliente usando el producto" 
                  fill 
                  className={styles.reviewPhoto} 
                />
              </div>
            </div>
          )) : (
            <div className={styles.emptyReviews}>
              <p>Aún no hay valoraciones para este producto. ¡Sé el primero en compartir tu experiencia!</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Bloque Inferior: Cross-Selling (También te puede interesar) */}
      {recommendations.length > 0 && (
        <section className={styles.recommendationsSection}>
          <div className={styles.sectionHeader}>
            <p>COMPLEMENTA TU ENTRENAMIENTO</p>
            <h2>También te <span>puede interesar</span></h2>
          </div>
          
          <div className={styles.recommendationsGrid}>
            {recommendations.map((p: any) => (
              <div key={p.id} className={styles.recommendationCard}>
                <Link href={`/producto/${p.id}`} className={styles.recLink}>
                  <div className={styles.recImageWrapper}>
                    <Image src={p.image} alt={p.name} width={200} height={200} className={styles.recImage} />
                  </div>
                  <div className={styles.recInfo}>
                    <span className={styles.recCategory}>{p.category}</span>
                    <h4>{p.name}</h4>
                    <div className={styles.recPrice}>{formatPrice(p.price)}</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
