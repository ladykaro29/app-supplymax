'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAppContext } from '@/context/AppContext';
import styles from './PremiumHero.module.css';

interface Product {
  id: number;
  name: string;
  category: string;
  goal: string | null;
  price: number;
  image: string;
  description: string;
  portions: string | null;
  flavor: string | null;
  weight: string | null;
  isFeatured: boolean;
  isOffer: boolean;
  discount: number | null;
  [key: string]: any;
}

interface PremiumHeroProps {
  featuredProducts: Product[];
}

// Map database categories to dynamic hex color design tokens
const getCategoryColors = (category: string) => {
  const normalized = category.toLowerCase().trim();
  if (normalized.includes('prote')) {
    return {
      accent: '#ff3b30', // Vibrant Red
      bg: '#0f0202',     // Dark Crimson Backdrop
    };
  } else if (normalized.includes('crea')) {
    return {
      accent: '#00f0ff', // Electric Cyan
      bg: '#01080a',     // Dark Teal Backdrop
    };
  } else if (normalized.includes('entreno') || normalized.includes('pre')) {
    return {
      accent: '#ffaa00', // Energy Amber/Gold
      bg: '#0e0601',     // Dark Orange Backdrop
    };
  } else if (normalized.includes('amino') || normalized.includes('bcaa')) {
    return {
      accent: '#10b981', // Emerald Green
      bg: '#020f08',     // Dark Emerald Backdrop
    };
  }
  return {
    accent: '#bc3eff',   // Luxury Purple fallback
    bg: '#08010f',       // Dark Violet Backdrop
  };
};

export default function PremiumHero({ featuredProducts }: PremiumHeroProps) {
  const { formatPrice, addToCart } = useAppContext();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const entranceRef = useRef<HTMLDivElement>(null);

  // Take the first 3 featured supplements from the DB, or construct fallback mocks if empty
  const heroProducts = featuredProducts && featuredProducts.length > 0
    ? featuredProducts.slice(0, 3)
    : [
        {
          id: 9991,
          name: 'Pure Whey Impact 5lb',
          category: 'Proteínas',
          goal: 'MASA MUSCULAR',
          price: 45.0,
          image: '/protein.png',
          description: 'Aislado de proteína de suero ultra-filtrado para una absorción inmediata. Acelera la síntesis de proteína muscular y optimiza tu recuperación post-entrenamiento.',
          portions: '71',
          flavor: 'Chocolate Suizo',
          weight: '2.27kg',
          isFeatured: true,
          isOffer: false,
          discount: null,
        },
        {
          id: 9992,
          name: 'Creatine Micronized 300g',
          category: 'Creatinas',
          goal: 'FUERZA MÁXIMA',
          price: 25.0,
          image: '/creatine.png',
          description: 'Creatina monohidratada de grado farmacéutico micronizada para una solubilidad perfecta. Incrementa tu potencia anaeróbica y volumen muscular.',
          portions: '60',
          flavor: 'Sin Sabor',
          weight: '300g',
          isFeatured: true,
          isOffer: false,
          discount: null,
        },
        {
          id: 9993,
          name: 'Pre-Workout Monster 300g',
          category: 'Pre-Entrenos',
          goal: 'ENERGÍA EXPLOSIVA',
          price: 32.0,
          image: '/pre-workout.png',
          description: 'Fórmula sinérgica con beta-alanina, cafeína anhidra y L-citrulina. Maximiza la congestión muscular y eleva el enfoque cognitivo a niveles extremos.',
          portions: '30',
          flavor: 'Blue Raspberry',
          weight: '300g',
          isFeatured: true,
          isOffer: false,
          discount: null,
        }
      ];

  const [activeProduct, setActiveProduct] = useState<Product>(heroProducts[0]);
  const [displayImage, setDisplayImage] = useState<string>(heroProducts[0].image);

  const colors = getCategoryColors(activeProduct.category);

  // 1. Entrance staggered timeline animation
  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.from(`.${styles.badge}`, {
        opacity: 0,
        x: -30,
        duration: 0.7,
        ease: "power3.out"
      })
      .from(`.${styles.heroTitle}`, {
        opacity: 0,
        y: 50,
        duration: 0.9,
        ease: "power4.out"
      }, "-=0.45")
      .from(`.${styles.heroDesc}`, {
        opacity: 0,
        y: 25,
        duration: 0.7,
        ease: "power3.out"
      }, "-=0.6")
      .from(`.${styles.heroControls}`, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
      }, "-=0.5");

    }, entranceRef);

    return () => ctx.revert();
  }, []);

  // 2. Slow constant 360-degree rotation of product
  useEffect(() => {
    let ctx = gsap.context(() => {
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          rotation: 360,
          duration: 40,
          ease: "none",
          repeat: -1,
        });
      }
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  // 3. Dynamic background transition based on chosen product variant
  useEffect(() => {
    let ctx = gsap.context(() => {
      if (wrapperRef.current) {
        gsap.to(wrapperRef.current, {
          backgroundColor: colors.bg,
          duration: 1.2,
          ease: "power2.out"
        });
      }
    }, wrapperRef);

    return () => ctx.revert();
  }, [activeProduct.id, colors.bg]);

  // 4. Fade-out image transition trigger
  useEffect(() => {
    if (displayImage === activeProduct.image) return;

    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setDisplayImage(activeProduct.image);
        }
      });

      tl.to(imageRef.current, {
        opacity: 0,
        scale: 0.8,
        filter: 'blur(12px)',
        duration: 0.28,
        ease: "power2.in"
      });

      tl.to(glowRef.current, {
        opacity: 0.2,
        scale: 1.15,
        duration: 0.3,
        ease: "power2.inOut"
      }, 0);

    }, wrapperRef);

    return () => ctx.revert();
  }, [activeProduct.id]);

  // 5. Fade-in image transition trigger once displayImage is swapped
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(imageRef.current,
        {
          opacity: 0,
          scale: 0.8,
          filter: 'blur(12px)'
        },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.6,
          ease: "power3.out"
        }
      );

      gsap.to(glowRef.current, {
        opacity: 0.45,
        scale: 1,
        duration: 0.8,
        ease: "power3.out"
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, [displayImage]);

  return (
    <section 
      ref={wrapperRef}
      className={styles.premiumHeroContainer}
    >
      {/* Decorative ambient subtle background grid lines */}
      <div className={styles.gridOverlay} />
      <div className={styles.gradientTop} />

      <div className={styles.heroGrid}>
        {/* Left Side: Conversion Copywriting (Attention, Interest, Desire, Action) */}
        <div ref={entranceRef} className={styles.copyArea}>
          {/* Badge: ATTENTION */}
          <div className="flex">
            <span 
              className={styles.badge}
              style={{ 
                color: colors.accent,
                borderColor: `${colors.accent}40`,
                backgroundColor: `${colors.accent}08`
              }}
            >
              <span 
                className={styles.badgePulse} 
                style={{ backgroundColor: colors.accent }}
              />
              SUPLEMENTACIÓN PREMIUM CIENTÍFICA
            </span>
          </div>

          {/* Heading: ATTENTION */}
          <h1 className={styles.heroTitle}>
            RINDES AL <br />
            <span className={styles.titleGradient}>
              MÁXIMO NIVEL.
            </span>
          </h1>

          {/* Description: INTEREST & DESIRE */}
          <p className={styles.heroDesc}>
            Potencia tu rendimiento celular con los compuestos más puros y validados del mercado. 
            El <strong className="text-white font-semibold">{activeProduct.name}</strong> está formulado para {
              activeProduct.goal ? activeProduct.goal.toLowerCase() : 'impulsar tu transformación'
            }. Sin rellenos, con sabores premium desarrollados en laboratorio y una disolución óptima garantizada.
          </p>

          {/* Controls: ACTION */}
          <div className={`${styles.heroControls} space-y-6`}>
            {/* Color/Product Selection Circles */}
            <div>
              <h2 className={styles.selectorTitle}>
                Selecciona tu Combustible
              </h2>
              <div className="flex gap-4">
                {heroProducts.map((prod) => {
                  const prodColors = getCategoryColors(prod.category);
                  const isActive = prod.id === activeProduct.id;
                  return (
                    <button
                      key={prod.id}
                      onClick={() => setActiveProduct(prod)}
                      className={`${styles.colorBubble} ${isActive ? styles.colorBubbleActive : ''}`}
                      style={{ 
                        backgroundColor: prodColors.accent,
                        boxShadow: isActive ? `0 0 15px ${prodColors.accent}50` : 'none'
                      }}
                      title={prod.name}
                      aria-label={`Seleccionar ${prod.name}`}
                    >
                      {isActive && <span className={styles.bubbleDot} />}
                    </button>
                  );
                })}
              </div>
              <p className={styles.activeSelectionName} style={{ color: colors.accent }}>
                {activeProduct.category} — {activeProduct.name}
              </p>
            </div>

            {/* Pricing details */}
            <div className={styles.priceContainer}>
              <div>
                <span className={styles.priceLabel}>Precio Unitario</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className={styles.activePrice}>
                    {formatPrice(activeProduct.price)}
                  </span>
                  {activeProduct.isOffer && activeProduct.discount && (
                    <span className={styles.oldPrice}>
                      {formatPrice(activeProduct.price + activeProduct.discount)}
                    </span>
                  )}
                </div>
              </div>
              
              {activeProduct.portions && (
                <div className={styles.specBox}>
                  <span className={styles.specLabel}>Porciones</span>
                  <span className={styles.specValue}>{activeProduct.portions} Servs</span>
                </div>
              )}

              {activeProduct.flavor && (
                <div className={styles.specBox}>
                  <span className={styles.specLabel}>Sabor</span>
                  <span className={styles.specValue}>{activeProduct.flavor}</span>
                </div>
              )}
            </div>

            {/* Dynamic CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button 
                onClick={() => addToCart(activeProduct)}
                className={styles.primaryCta}
                style={{ 
                  boxShadow: `0 10px 25px ${colors.accent}15`
                }}
              >
                + Añadir al Carrito
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>

              <button className={styles.secondaryCta}>
                Ficha Nutricional Completa
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Rotating Showcase Container */}
        <div className={styles.showcaseArea}>
          {/* Dynamic color-specific backing glow */}
          <div 
            ref={glowRef}
            className={styles.dynamicGlow}
            style={{
              backgroundColor: colors.accent,
            }}
          />

          {/* Decorative design orbital rings */}
          <div className={`${styles.orbitalRing} ${styles.orbitalRingOuter}`} />
          <div className={`${styles.orbitalRing} ${styles.orbitalRingInner}`} />

          {/* Floor Shadow */}
          <div className={styles.floorShadow} />

          {/* Rotating Image Element */}
          <img
            ref={imageRef}
            src={displayImage}
            alt={activeProduct.name}
            className={styles.rotatingProductImg}
          />
        </div>
      </div>
    </section>
  );
}
