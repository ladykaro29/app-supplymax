'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './page.module.css';
import PartnerCarousel from '@/components/PartnerCarousel/PartnerCarousel';
import PremiumHero from '@/components/PremiumHero/PremiumHero';

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
  const { formatPrice, addToCart, user, authLoading } = useAppContext();
  const router = useRouter();

  // Redirigir administradores al panel ejecutivo
  useEffect(() => {
    if (!authLoading && user && user.role_id === 'Admin') {
      router.push('/dashboard/admin');
    }
  }, [user, authLoading, router]);
  
  // React State for interactive FAQ Accordion
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // React State for Product tab explorer
  const [activeTab, setActiveTab] = useState<string>('Todos');

  const mainRef = useRef<HTMLDivElement>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // GSAP ScrollTrigger Section Entrance Animations
  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    let ctx = gsap.context(() => {
      // 1. Stagger Value Pillars
      gsap.from(`.${styles.pillarCard}`, {
        scrollTrigger: {
          trigger: `.${styles.pillarsGrid}`,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
      });

      // 2. Section Headers
      const headers = document.querySelectorAll(`.${styles.sectionHeader}`);
      headers.forEach((header) => {
        gsap.from(header, {
          scrollTrigger: {
            trigger: header,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          y: 35,
          duration: 0.8,
          ease: 'power2.out',
        });
      });

      // 3. Category Zones Cards
      gsap.from(`.${styles.zoneCard}`, {
        scrollTrigger: {
          trigger: `.${styles.zoneGrid}`,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 45,
        stagger: 0.18,
        duration: 0.9,
        ease: 'power3.out',
      });

      // 4. Recruitment Banner Box
      gsap.from(`.${styles.recruitmentBanner}`, {
        scrollTrigger: {
          trigger: `.${styles.recruitment}`,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        scale: 0.96,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
      });

      // 5. Testimonial Cards
      gsap.from(`.${styles.testimonialCard}`, {
        scrollTrigger: {
          trigger: `.${styles.testimonialGrid}`,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 30,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power2.out',
      });

      // 5.5. Real Deliveries Cards
      gsap.from(`.${styles.deliveryCard}`, {
        scrollTrigger: {
          trigger: `.${styles.deliveriesGrid}`,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 35,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
      });

      // 6. FAQ Items
      gsap.from(`.${styles.faqItem}`, {
        scrollTrigger: {
          trigger: `.${styles.faqContainer}`,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power2.out',
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  const faqData = [
    {
      q: '¿Cómo funciona la facturación bimonetaria?',
      a: 'En SupplyMax te mostramos los precios tanto en dólares (USD) como en bolívares venezolanos (VES) utilizando una tasa de conversión oficial y transparente. Puedes elegir pagar con transferencia bancaria, pago móvil o criptomonedas, y la conversión se aplicará automáticamente al finalizar la compra sin cargos ocultos.'
    },
    {
      q: '¿Los suplementos cuentan con certificación de laboratorio?',
      a: 'Totalmente. Cada lote de proteínas, creatinas y pre-entrenos en SupplyMax pasa por rigurosos análisis de pureza microbiológica y HPLC. Garantizamos que lo que se declara en la etiqueta nutricional es exactamente lo que consumes, libre de rellenos y sustancias prohibidas.'
    },
    {
      q: '¿Cuáles son los tiempos y costos de envío?',
      a: 'Ofrecemos envío express gratuito en Mérida en compras superiores a USD 50, con entregas en 24 a 48 horas hábiles. Para envíos nacionales, trabajamos con Zoom, Tealca y MRW, despachando el mismo día de la confirmación del pago.'
    },
    {
      q: '¿Cómo puedo unirme como Coach o Embajador de marca?',
      a: 'Buscamos entrenadores, nutricionistas y atletas comprometidos. Al unirte a nuestro equipo de poder, obtienes un enlace de afiliado único, descuentos masivos del 25% para ti y tus clientes, y comisiones en dólares por cada recomendación exitosa. Haz clic en "Unirme al Equipo" para postularte.'
    }
  ];

  return (
    <main ref={mainRef} className={styles.main}>
      {/* 0. Scrolling Announcement Bar */}
      <div className={styles.announcementBar}>
        <div className={styles.marqueeTrack}>
          <div className={styles.marqueeText}>
            <span>🔥 ENVÍO EXPRESS <span className={styles.marqueeHighlight}>GRATUITO</span> EN MÉRIDA EN COMPRAS MAYORES A $50</span>
            <span className={styles.marqueeSeparator}>●</span>
            <span>⚡ CONVERSIÓN OFICIAL <span className={styles.marqueeHighlight}>VES / USD</span> ACTUALIZADA AL INSTANTE</span>
            <span className={styles.marqueeSeparator}>●</span>
            <span>💪 10% DE DESCUENTO ADICIONAL EN SUPLIS PAGANDO CON <span className={styles.marqueeHighlight}>CRIPTOMONEDAS</span></span>
            <span className={styles.marqueeSeparator}>●</span>
            <span>🏆 ÚNETE A NUESTRO PROGRAMA DE <span className={styles.marqueeHighlight}>COACHES</span> Y MONETIZA TU ASESORÍA</span>
            <span className={styles.marqueeSeparator}>●</span>
          </div>
          <div className={styles.marqueeText}>
            <span>🔥 ENVÍO EXPRESS <span className={styles.marqueeHighlight}>GRATUITO</span> EN MÉRIDA EN COMPRAS MAYORES A $50</span>
            <span className={styles.marqueeSeparator}>●</span>
            <span>⚡ CONVERSIÓN OFICIAL <span className={styles.marqueeHighlight}>VES / USD</span> ACTUALIZADA AL INSTANTE</span>
            <span className={styles.marqueeSeparator}>●</span>
            <span>💪 10% DE DESCUENTO ADICIONAL EN SUPLIS PAGANDO CON <span className={styles.marqueeHighlight}>CRIPTOMONEDAS</span></span>
            <span className={styles.marqueeSeparator}>●</span>
            <span>🏆 ÚNETE A NUESTRO PROGRAMA DE <span className={styles.marqueeHighlight}>COACHES</span> Y MONETIZA TU ASESORÍA</span>
            <span className={styles.marqueeSeparator}>●</span>
          </div>
        </div>
      </div>

      {/* 1. Interactive Premium Hero Section (GSAP powered real products) */}
      <PremiumHero featuredProducts={featuredProducts} />

      {/* 2. Value Pillars / Core Benefits Section (New Structural Enhancement) */}
      <section className={styles.pillarsSection}>
        <div className={styles.pillarsGrid}>
          <div className={styles.pillarCard}>
            <div className={styles.pillarIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <h3>Fórmulas Certificadas</h3>
            <p>Análisis de lote rigurosos y pureza química superior aprobada por laboratorios deportivos.</p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>Despacho en 24 horas</h3>
            <p>Envíos express prioritarios locales y nacionales para que tu nutrición nunca sufra interrupciones.</p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3>Puntos Bimonetarios</h3>
            <p>Visualiza y gestiona tu balance inteligentemente en USD y VES de forma transparente en el checkout.</p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3>Comunidad y Coaching</h3>
            <p>Acceso directo a planes y asesorías personalizadas por nuestro staff de entrenadores de élite.</p>
          </div>
        </div>
      </section>

      {/* 3. Supplements Featured Products Grid */}
      <section className={styles.featured}>
        <div className={styles.sectionHeader}>
          <p>EL COMBUSTIBLE DE LOS CAMPEONES</p>
          <h2>Suplementos <span>Destacados</span></h2>
        </div>

        {/* Dynamic Interactive Category Tabs */}
        <div className={styles.tabsContainer}>
          {['Todos', 'Proteínas', 'Creatinas', 'Pre-Entrenos', 'Aminoácidos'].map((tabName) => {
            const isActive = activeTab === tabName;
            return (
              <button
                key={tabName}
                onClick={() => setActiveTab(tabName)}
                className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ''}`}
              >
                {tabName}
              </button>
            );
          })}
        </div>

        <ProductGrid 
          products={
            activeTab === 'Todos'
              ? featuredProducts
              : featuredProducts.filter(p => {
                  if (activeTab === 'Aminoácidos') {
                    return p.category.toLowerCase().includes('amino') || p.category.toLowerCase().includes('bcaa');
                  }
                  return p.category.toLowerCase().includes(activeTab.toLowerCase().slice(0, 5));
                })
          } 
          formatPrice={formatPrice} 
          addToCart={addToCart} 
        />
      </section>

      {/* 4. Supply Max Anchored Category Zones */}
      <section className={styles.zones}>
        <div className={styles.zoneGrid}>
          <Link href="/catalog?category=Creatinas" className={styles.zoneCard}>
            <div className={styles.zoneOverlay}></div>
            <Image src="/banners/creatina-zone.jpg" alt="Zona Creatina" fill className={styles.zoneImg} />
            <div className={styles.zoneContent}>
              <h3>ZONA <span>CREATINA</span></h3>
              <button>Ver todas</button>
            </div>
          </Link>
          <Link href="/catalog?category=Proteínas" className={styles.zoneCard}>
            <div className={styles.zoneOverlay}></div>
            <Image src="/banners/proteina-zone.jpg" alt="Zona Proteína" fill className={styles.zoneImg} />
            <div className={styles.zoneContent}>
              <h3>ZONA <span>PROTEÍNA</span></h3>
              <button>Ver todas</button>
            </div>
          </Link>
          <Link href="/catalog?category=Pre-Entrenos" className={styles.zoneCard}>
            <div className={styles.zoneOverlay}></div>
            <Image src="/banners/pre-zone.jpg" alt="Zona Pre Entrenos" fill className={styles.zoneImg} />
            <div className={styles.zoneContent}>
              <h3>ZONA <span>PRE-ENTRENO</span></h3>
              <button>Ver todas</button>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. Apparel & Lifestyle Clothing Section */}
      <section className={styles.featured}>
        <div className={styles.sectionHeader}>
          <p>ENTRENA CON ESTILO</p>
          <h2>Ropa & <span>Lifestyle</span></h2>
        </div>
        <ProductGrid products={apparelProducts} formatPrice={formatPrice} addToCart={addToCart} />
      </section>

      {/* 6. Recruitment Dynamic Conversional Banner (New Structural Enhancement) */}
      <section className={styles.recruitment}>
        <div className={styles.recruitmentBanner}>
          <span className={styles.recruitmentBadge}>PROGRAMA DE SINDICATO</span>
          <h2 className={styles.recruitmentTitle}>
            ¿Eres Entrenador, Nutricionista o Influencer? <br />
            <span>Monetiza tu Pasión con SupplyMax</span>
          </h2>
          <p className={styles.recruitmentDesc}>
            Únete a nuestra red de coaches y embajadores. Recomienda suplementación científica respaldada, 
            provee descuentos masivos a tus asesorados y cobra comisiones directas en dólares cada fin de mes.
          </p>
          <div className={styles.recruitmentActions}>
            <Link href="/join-team">
              <button className={`${styles.primaryCta} !bg-white !text-zinc-950 font-bold hover:!bg-zinc-200 transition-colors`}>
                Postularme al Equipo
              </button>
            </Link>
            <Link href="/coaches">
              <button className={styles.secondaryCta}>
                Ver Coaches Activos
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Partners & Coaches Carousel */}
      <section className={styles.partnersSection}>
        <div className={styles.sectionHeader}>
          <p>NUESTRO EQUIPO DE PODER</p>
          <h2>Partners & <span>Coaches</span></h2>
        </div>
        <PartnerCarousel partners={partners} />
      </section>

      {/* 8. Testimonials & Verified Athletes Section */}
      <section className={styles.testimonials}>
        <div className={styles.sectionHeader}>
          <p>LO QUE DICEN NUESTROS ATLETAS</p>
          <h2>Experiencias <span>SupplyMax</span></h2>
        </div>
        <div className={styles.testimonialGrid}>
          {reviews.length > 0 ? reviews.map((review: any) => (
            <div key={review.id} className={styles.testimonialCard}>
              <div className={styles.stars}>
                {[...Array(review.rating)].map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#00d1ff">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
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

      {/* 8.5. Envíos Nacionales / Entregas Reales Gallery (New Structural Enhancement) */}
      <section className={styles.deliveriesSection}>
        <div className={styles.sectionHeader}>
          <p>COMPRA SEGURA Y COMPROBADA</p>
          <h2>Entregas Reales & <span>Envíos Garantizados</span></h2>
        </div>
        
        <div className={styles.deliveriesGrid}>
          {/* Card 1: Real shipment photo 1 */}
          <div className={`${styles.deliveryCard} ${styles.deliveryImageCard}`}>
            <div className={styles.deliveryImageContainer}>
              <Image 
                src="/brand-photos/Envíos nacionales/57573c77-184b-4641-9d35-9ce97c8f3eb2.jpg"
                alt="Empaque real de pedido de suplementos"
                width={400}
                height={500}
                className={styles.deliveryImg}
              />
              <div className={styles.deliveryImageOverlay}>
                <span className={styles.deliveryImageTag}>Mérida, VE</span>
                <h4>Listo para Despacho Express</h4>
              </div>
            </div>
          </div>

          {/* Card 2: Shipments Info Panel */}
          <div className={`${styles.deliveryCard} ${styles.deliveryInfoCard}`}>
            <div className={styles.deliveryBadgeRow}>
              <span className={styles.courierBadge}>Zoom</span>
              <span className={styles.courierBadge}>Tealca</span>
              <span className={styles.courierBadge}>MRW</span>
            </div>
            <h3>Despachos Nacionales desde Mérida</h3>
            <p>
              Enviamos tu pedido el mismo día de la confirmación del pago. Todos los paquetes 
              son embalados bajo estrictas normas de seguridad y protección para asegurar que 
              tus proteínas y suplementos lleguen perfectos.
            </p>
            
            <div className={styles.deliveryFeaturesList}>
              <div className={styles.deliveryFeatureItem}>
                <div className={styles.featureIcon}>⚡</div>
                <div>
                  <strong>Despacho Express:</strong> En Mérida en menos de 24-48 horas hábiles.
                </div>
              </div>
              <div className={styles.deliveryFeatureItem}>
                <div className={styles.featureIcon}>📦</div>
                <div>
                  <strong>Embalaje Reforzado:</strong> Mayor seguridad contra golpes y temperatura.
                </div>
              </div>
              <div className={styles.deliveryFeatureItem}>
                <div className={styles.featureIcon}>🛡️</div>
                <div>
                  <strong>Código de Tracking:</strong> Enviado inmediatamente para seguimiento online.
                </div>
              </div>
            </div>

            <div className={styles.deliveryCtaBox}>
              <Link href="/catalog" className={styles.deliveryCtaBtn}>
                Comprar Ahora & Recibir
              </Link>
            </div>
          </div>

          {/* Card 3: Real shipment photo 2 */}
          <div className={`${styles.deliveryCard} ${styles.deliveryImageCard}`}>
            <div className={styles.deliveryImageContainer}>
              <Image 
                src="/brand-photos/Envíos nacionales/73F6A189-5ABD-47E7-90A4-695ED13BF547.jpg"
                alt="Despacho real de pedido"
                width={400}
                height={500}
                className={styles.deliveryImg}
              />
              <div className={styles.deliveryImageOverlay}>
                <span className={styles.deliveryImageTag}>Nacional</span>
                <h4>Entregas 100% Aseguradas</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Interactive FAQ Accordion Section (New Structural Enhancement) */}
      <section className={styles.faqSection}>
        <div className={styles.sectionHeader}>
          <p>RESOLVEMOS TUS DUDAS</p>
          <h2>Preguntas <span>Frecuentes</span></h2>
        </div>
        <div className={styles.faqContainer}>
          {faqData.map((faq, index) => {
            const isActive = activeFaq === index;
            return (
              <div 
                key={index} 
                className={`${styles.faqItem} ${isActive ? styles.faqItemActive : ''}`}
              >
                <button 
                  onClick={() => toggleFaq(index)}
                  className={`${styles.faqQuestion} ${isActive ? styles.faqQuestionActive : ''}`}
                >
                  {faq.q}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div className={`${styles.faqAnswer} ${isActive ? styles.faqAnswerActive : ''}`}>
                  <p>{faq.a}</p>
                </div>
              </div>
            );
          })}
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
               {product.goal && <div className={styles.cardBadge}>{product.goal}</div>}
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
