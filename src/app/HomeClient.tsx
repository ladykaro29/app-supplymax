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
      router.push('/admin/edit-products');
    }
  }, [user, authLoading, router]);
  
  // React State for interactive FAQ Accordion and category tabs
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>('Suplementación');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // React State for Product tab explorer
  const [activeTab, setActiveTab] = useState<string>('Todos');

  // React State for Hero Slider Principal
  const [currentHeroSlide, setCurrentHeroSlide] = useState<number>(0);

  // React State for Bottom Banner Slider
  const [currentBottomSlide, setCurrentBottomSlide] = useState<number>(0);

  // React State for Shipment square slider
  const [currentShipmentSlide, setCurrentShipmentSlide] = useState<number>(0);

  const heroSlides = [
    {
      src: '/sliders/hero/1.jpg',
      title: <>SUPLEMENTACIÓN <span>CIENTÍFICA</span></>,
      desc: 'Construye tu mejor versión con compuestos ultra puros validados por laboratorios de élite.',
      btnText: 'COMPRAR SUPLEMENTOS',
      btnLink: '/suplementos'
    },
    {
      src: '/sliders/hero/2.png',
      title: <>ENTRENA CON <span>ESTILO</span></>,
      desc: 'DENTRO Y FUERA DEL GIMNASIO. Indumentaria urbana oversized y de alto rendimiento.',
      btnText: 'COMPRAR MERCH',
      btnLink: '/ropa'
    },
    {
      src: '/sliders/hero/3.png',
      title: <>MÁXIMA <span>POTENCIA</span></>,
      desc: 'Supera tus límites con fórmulas diseñadas para atletas y entrenadores exigentes.',
      btnText: 'VER SUPLEMENTOS',
      btnLink: '/suplementos'
    },
    {
      src: '/sliders/hero/4.png',
      title: <>ESTILO & <span>RENDIMIENTO</span></>,
      desc: 'Prendas confeccionadas con cortes que destacan el físico y soportan las sesiones más pesadas.',
      btnText: 'VER COLECCIÓN',
      btnLink: '/ropa'
    },
    {
      src: '/sliders/hero/5.png',
      title: <>CALIDAD <span>GARANTIZADA</span></>,
      desc: 'Resultados reales con suplementación original y despacho asegurado a toda Venezuela.',
      btnText: 'COMPRAR AHORA',
      btnLink: '/suplementos'
    },
    {
      src: '/sliders/hero/6.png',
      title: <>TEAM <span>SUPPLYMAX</span></>,
      desc: 'CONSTRUIDO POR ATLETAS, PARA ATLETAS. Únete al movimiento deportivo de mayor crecimiento.',
      btnText: 'UNIRME AL TEAM',
      btnLink: '/join-team'
    }
  ];

  const bottomSlides = [
    '/sliders/footer/1.png',
    '/sliders/footer/2.png',
    '/sliders/footer/3.png',
    '/sliders/footer/4.png'
  ];

  const shipmentImages = [
    '/sliders/envios/envio1.jpg',
    '/sliders/envios/envio2.jpg'
  ];

  const mainRef = useRef<HTMLDivElement>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Hero Slider Autoplay
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Bottom Banner Slider Autoplay
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBottomSlide((prev) => (prev + 1) % bottomSlides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [bottomSlides.length]);

  // Shipment Slider Autoplay
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentShipmentSlide((prev) => (prev + 1) % shipmentImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [shipmentImages.length]);

  // Reset active FAQ when changing FAQ category
  useEffect(() => {
    setActiveFaq(null);
  }, [activeFaqCategory]);

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

      // 3. Giant Category Zone Cards
      gsap.from(`.${styles.giantCategoryCard}`, {
        scrollTrigger: {
          trigger: `.${styles.giantCategoryGrid}`,
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
      category: 'Suplementación',
      q: '1. ¿Qué es la proteína y para qué sirve?',
      a: 'La proteína es el macronutriente esencial para la reparación y construcción de masa muscular. Al entrenar de forma intensa, las fibras del músculo sufren microdesgarros; el batido de proteína le entrega al cuerpo los aminoácidos necesarios para reconstruir ese tejido de forma rápida, eficiente y limpia.'
    },
    {
      category: 'Suplementación',
      q: '2. ¿Qué es la creatina y cómo debo tomarla?',
      a: 'La creatina es el suplemento con mayor evidencia científica para aumentar la fuerza, la potencia y el volumen muscular. Funciona recargando las reservas de energía celular (ATP). La dosis estándar y recomendada es de 3 a 5 gramos diarios (un scoop), idealmente todos los días a la misma hora, entrenes o no.'
    },
    {
      category: 'Suplementación',
      q: '3. ¿La creatina retiene líquidos o engorda?',
      a: 'No, la creatina no engorda porque no contiene calorías. La retención de líquido que produce ocurre exclusivamente a nivel intracelular (dentro del músculo), lo que hace que tus fibras se vean más llenas, densas y saludables, mejorando además la hidratación del tejido.'
    },
    {
      category: 'Suplementación',
      q: '4. ¿Qué diferencia hay entre la Proteína Concentrada (Whey) e Isolada (Iso)?',
      a: 'La proteína Concentrada mantiene un porcentaje mínimo y natural de grasas y lactosa, siendo ideal para la mayoría de objetivos. La Isolada pasa por un proceso de filtración más estricto para eliminar casi al 100% la grasa y la lactosa, lo que la hace perfecta para etapas de definición extrema o personas con digestión sensible.'
    },
    {
      category: 'Suplementación',
      q: '5. ¿Qué es un Pre-Entreno y cuándo debo tomarlo?',
      a: 'Es una combinación de estimulantes (como cafeína) y vasodilatadores (como beta-alanina y citrulina) diseñada para maximizar el enfoque mental, la energía y el bombeo de sangre en el músculo. Se debe tomar entre 20 y 30 minutos antes de empezar tu rutina de entrenamiento.'
    },
    {
      category: 'Suplementación',
      q: '6. ¿Qué son los aminoácidos (BCAA / EAA) y son necesarios si ya tomo proteína?',
      a: 'Los BCAA y EAA son los bloques constructores que forman la proteína. Si ya consumes suficiente proteína en tu dieta o batidos, no son estrictamente obligatorios, pero son un aliado excelente para mantener la hidratación y proteger la masa muscular durante entrenamientos en ayunas o sesiones cardiovasculares prolongadas.'
    },
    {
      category: 'Suplementación',
      q: '7. ¿Los suplementos tienen efectos secundarios en la salud?',
      a: 'No, los suplementos de marcas certificadas son seguros para adultos saludables. Son extractos purificados de alimentos comunes (como el suero de la leche en la proteína). Siempre recomendamos respetar las dosis sugeridas en cada empaque.'
    },
    {
      category: 'Suplementación',
      q: '8. ¿Las mujeres pueden tomar los mismos suplementos que los hombres?',
      a: '¡Totalmente! Las mujeres tienen los mismos requerimientos de recuperación muscular que los hombres. Tomar proteína, creatina o pre-entreno no alterará tus hormonas de forma negativa; al contrario, te ayudará a tonificar y desarrollar un físico fuerte y estético.'
    },
    {
      category: 'Suplementación',
      q: '9. ¿Es obligatorio tomar los suplementos con agua o puedo usar leche/jugos?',
      a: 'Puedes mezclarlos a tu gusto. El agua garantiza una absorción más rápida y no añade calorías. Mezclarlos con leche mejora el sabor y la cremosidad, pero añade las calorías y macronutrientes de la leche (ideal si buscas aumentar peso).'
    },
    {
      category: 'Suplementación',
      q: '10. ¿A partir de qué edad se pueden consumir suplementos deportivos?',
      a: 'El consumo de suplementos base como la proteína de suero o la creatina se considera seguro a partir de los 16-18 años, momento en el que el cuerpo ya realiza entrenamientos con cargas estructuradas de forma regular.'
    },
    {
      category: 'Indumentaria & Estilo',
      q: '11. ¿Qué significa que una prenda sea estilo “Oversize”?',
      a: 'El estilo Oversize es un corte diseñado intencionalmente para quedar holgado, ancho y caído en los hombros, inspirado en la cultura urbana del bodybuilding. No necesitas pedir una talla más grande; pide tu talla normal y la prenda ya tendrá ese ajuste amplio, cómodo y estético.'
    },
    {
      category: 'Indumentaria & Estilo',
      q: '12. ¿Cómo sé cuál es mi talla exacta en la indumentaria de la marca?',
      a: 'En la sección de cada prenda encontrarás nuestra Tabla de Medidas detallada en centímetros (ancho y largo). Te recomendamos medir una camisa o short que ya uses y te quede cómodo para compararlo con nuestras dimensiones.'
    },
    {
      category: 'Indumentaria & Estilo',
      q: '13. ¿Qué tipo de tela utilizan para las prendas de gimnasio?',
      a: 'Seleccionamos telas de calidad premium con mezclas de algodón pesado para las prendas lifestyle (oversizes y hoodies) que mantienen la forma y frescura, y fibras elásticas de alta tecnología para los shorts y prendas de rendimiento que permiten un rango completo de movimiento sin deformarse.'
    },
    {
      category: 'Indumentaria & Estilo',
      q: '14. ¿Cómo debo lavar la ropa para que no pierda el color ni se encoja?',
      a: 'Para garantizar la máxima vida útil de tus prendas, lávalas al revés con agua fría, evita el uso de blanqueadores agresivos y no utilices secadora a temperaturas altas. Deja secar la prenda a la sombra.'
    },
    {
      category: 'Envíos, Pagos y Garantías',
      q: '15. ¿Realizan envíos a toda Venezuela y qué agencias utilizan?',
      a: 'Sí, realizamos envíos cobro en destino a nivel nacional a través de las empresas líderes del país: Zoom, MRW, Tealca y Liberty Express, completamente asegurados para tu tranquilidad.'
    },
    {
      category: 'Envíos, Pagos y Garantías',
      q: '16. ¿Cómo es el proceso de entrega si me encuentro en Mérida?',
      a: 'Si estás en Mérida, contamos con servicio de delivery express directo hasta la puerta de tu casa o gimnasio. Al realizar tu pedido, coordinamos la hora exacta de entrega según tu disponibilidad.'
    },
    {
      category: 'Envíos, Pagos y Garantías',
      q: '17. ¿Cuáles son los métodos de pago disponibles?',
      a: 'Para tu comodidad, aceptamos múltiples canales de pago seguros: Pago Móvil, transferencias bancarias nacionales, divisas en efectivo (para entregas en Mérida), Binance Pay (USDT) y Zelle.'
    },
    {
      category: 'Envíos, Pagos y Garantías',
      q: '18. ¿Cómo puedo hacerle seguimiento a mi envío nacional?',
      a: 'Una vez que tu paquete es entregado a la casa de envío (Zoom/MRW), nuestro equipo te enviará de inmediato por WhatsApp el comprobante digital con el número de guía de rastreo para que monitoreees el estatus en tiempo real desde su página web.'
    },
    {
      category: 'Envíos, Pagos y Garantías',
      q: '19. ¿Tienen tienda física o son exclusivamente una plataforma en línea?',
      a: 'Operamos bajo un modelo digital premium optimizado con almacenes de distribución centralizados. Esto nos permite reducir costos operativos y garantizarte los precios más competitivos del mercado y entregas ultra rápidas sin que tengas que salir de casa.'
    },
    {
      category: 'Envíos, Pagos y Garantías',
      q: '20. ¿Qué hago si mi producto llega dañado o hay un error en mi pedido de ropa/suplementos?',
      a: 'Tu satisfacción es nuestra prioridad absoluta. Si hay algún error en las tallas enviadas o el empaque de tu suplemento sufre algún daño físico en el traslado nacional, comunícate de inmediato con nuestro soporte técnico para gestionar el caso.'
    }
  ];

  const filteredFaqs = faqData.filter(f => f.category === activeFaqCategory);

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

      {/* 1. Slider 1: Hero Principal (Carrusel Mixto Full-Width con 6 Slides) */}
      <section className={styles.heroSlider}>
        {heroSlides.map((slide, idx) => (
          <div 
            key={idx} 
            className={`${styles.heroSlide} ${currentHeroSlide === idx ? styles.heroSlideActive : ''}`}
          >
            <Image 
              src={slide.src} 
              alt={`SupplyMax Banner ${idx + 1}`} 
              fill 
              className={styles.heroSlideImage}
              priority={idx === 0}
            />
            <div className={styles.heroSlideContent}>
              <h2>{slide.title}</h2>
              <p>{slide.desc}</p>
              <Link href={slide.btnLink} className={styles.heroSlideBtn}>
                {slide.btnText}
              </Link>
            </div>
          </div>
        ))}

        {/* Slide dots indicators */}
        <div className={styles.heroSlideDots}>
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroSlide(idx)}
              className={`${styles.heroSlideDot} ${currentHeroSlide === idx ? styles.heroSlideDotActive : ''}`}
              aria-label={`Ir al slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 1.5 COMPONENTE: BOTONES DE ACCESO RÁPIDO VISUALES */}
      <section className={styles.quickAccess}>
        <Link href="/suplementos" className={styles.quickBannerCard} aria-label="Catálogo de Suplementos">
          <Image 
            src="/sliders/buttons/suplementos.png" 
            alt="Catálogo Suplementos" 
            width={600} 
            height={260} 
            className={styles.quickBannerImg}
          />
        </Link>
        <Link href="/ropa" className={styles.quickBannerCard} aria-label="Catálogo de Ropa">
          <Image 
            src="/sliders/buttons/ropa.png" 
            alt="Catálogo Ropa" 
            width={600} 
            height={260} 
            className={styles.quickBannerImg}
          />
        </Link>
      </section>

      {/* 2. Value Pillars / Core Benefits Section */}
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

      {/* 2. SECCIÓN: PRODUCTOS DESTACADOS */}
      <section className={styles.featured}>
        <div className={styles.sectionHeader}>
          <p>EL COMBUSTIBLE DE LOS CAMPEONES</p>
          <h2>Productos <span>Destacados</span></h2>
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

      {/* 3. SECCIÓN: CATEGORÍAS EN TARJETAS GIGANTES */}
      <section className={styles.giantCategoryGrid}>
        {/* Tarjeta Izquierda (SUPLEMENTOS) */}
        <Link href="/suplementos" className={styles.giantCategoryCard}>
          <div className={styles.giantCategoryOverlay}></div>
          <Image 
            src="/brand-photos/Suplementos/IMG_5676.png" 
            alt="Catálogo Suplementos" 
            fill 
            className={styles.giantCategoryImg} 
          />
          <div className={styles.giantCategoryContent}>
            <h3>CATÁLOGO <span>SUPLEMENTOS</span></h3>
            <button>Ingresar</button>
          </div>
        </Link>

        {/* Tarjeta Derecha (ROPA) */}
        <Link href="/ropa" className={styles.giantCategoryCard}>
          <div className={styles.giantCategoryOverlay}></div>
          <Image 
            src="/brand-photos/Ropa con modelo/IMG_7287.png" 
            alt="Catálogo Ropa" 
            fill 
            className={styles.giantCategoryImg} 
          />
          <div className={styles.giantCategoryContent}>
            <h3>CATÁLOGO <span>ROPA / MERCH</span></h3>
            <button>Ingresar</button>
          </div>
        </Link>
      </section>

      {/* 4. BANNER / FEED ENFOCADO: EL BOLSO SUPPLYMAX */}
      <section className={styles.bagBannerSection}>
        <Link href="/ropa#bolso" className={styles.bagBanner}>
          <Image 
            src="/brand-photos/Suplementos + ropa/Photoroom_20260328_114310.jpg" 
            alt="Bolso SupplyMax" 
            fill 
            className={styles.bagBannerImg} 
          />
          <div className={styles.bagBannerContent}>
            <span className={styles.bagBannerBadge}>DESTACADO ACCESORIO</span>
            <h3 className={styles.bagBannerTitle}>
              EL BOLSO <span>SUPPLYMAX</span>
            </h3>
            <p className={styles.bagBannerDesc}>
              El aliado perfecto para tus rutinas. Fabricado con materiales impermeables de alta resistencia, 
              compartimento ventilado exclusivo para calzado húmedo y bolsillos inteligentes para tus batidos y straps.
            </p>
            <button className={styles.bagBannerBtn}>
              ADQUIRIR BOLSO
            </button>
          </div>
        </Link>
      </section>

      {/* 5. SECCIÓN: RESPALDO DE ENVÍOS NACIONALES + SLIDER COMPLEMENTARIO FINAL */}
      <section className={styles.deliveriesSection}>
        <div className={styles.sectionHeader}>
          <p>COMPRA SEGURA Y COMPROBADA</p>
          <h2>Envíos & <span>Entregas Garantizadas</span></h2>
        </div>
        
        <div className={styles.deliveriesGrid}>
          {/* Card 1: Real shipment photo slider (Square horizontal carrusel) */}
          <div className={`${styles.deliveryCard} ${styles.deliveryImageCard}`}>
            <div className={styles.deliverySlider}>
              <div className={`${styles.deliverySliderSlide} ${currentShipmentSlide === 0 ? styles.deliverySliderSlideActive : ''}`}>
                <Image 
                  src={shipmentImages[0]}
                  alt="Empaque real de pedido de suplementos"
                  fill
                  className={styles.deliveryImg}
                />
                <div className={styles.deliveryImageOverlay}>
                  <span className={styles.deliveryImageTag}>Listo en Oficina</span>
                  <h4>Mérida central</h4>
                </div>
              </div>
              <div className={`${styles.deliverySliderSlide} ${currentShipmentSlide === 1 ? styles.deliverySliderSlideActive : ''}`}>
                <Image 
                  src={shipmentImages[1]}
                  alt="Despacho nacional real"
                  fill
                  className={styles.deliveryImg}
                />
                <div className={styles.deliveryImageOverlay}>
                  <span className={styles.deliveryImageTag}>Envío Nacional</span>
                  <h4>Agencia Aliada Zoom/MRW</h4>
                </div>
              </div>
              
              <div className={styles.deliverySliderDots}>
                {[0, 1].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentShipmentSlide(idx)}
                    className={`${styles.deliverySliderDot} ${currentShipmentSlide === idx ? styles.deliverySliderDotActive : ''}`}
                    aria-label={`Ir al slide ${idx + 1}`}
                  />
                ))}
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
            <h3>Envíos Rápidos a Toda Venezuela</h3>
            <p>
              Garantizamos el traslado seguro de tu combustible. Procesamos y embalamos cada pedido con 
              los mejores estándares de protección contra el calor y los golpes.
            </p>
            
            <div className={styles.deliveryFeaturesList}>
              <div className={styles.deliveryFeatureItem}>
                <div className={styles.featureIcon}>⚡</div>
                <div>
                  <strong>Envíos gratis a todo el país:</strong> Sin costos adicionales en compras seleccionadas.
                </div>
              </div>
              <div className={styles.deliveryFeatureItem}>
                <div className={styles.featureIcon}>📦</div>
                <div>
                  <strong>Despacho inmediato desde Mérida:</strong> Sede central de distribución agilizada.
                </div>
              </div>
              <div className={styles.deliveryFeatureItem}>
                <div className={styles.featureIcon}>🛡️</div>
                <div>
                  <strong>Pagos seguros confiables:</strong> Múltiples plataformas rápidas (Pago Móvil, Zelle, Binance).
                </div>
              </div>
            </div>

            <div className={styles.deliveryCtaBox}>
              <Link href="/suplementos" className={styles.deliveryCtaBtn}>
                Ver Catálogo de Suplementos
              </Link>
            </div>
          </div>

          {/* Card 3: Real shipment static photo */}
          <div className={`${styles.deliveryCard} ${styles.deliveryImageCard}`}>
            <div className={styles.deliveryImageContainer}>
              <Image 
                src="/sliders/envios/envio2.jpg"
                alt="Despacho real de pedido"
                fill
                className={styles.deliveryImg}
              />
              <div className={styles.deliveryImageOverlay}>
                <span className={styles.deliveryImageTag}>Seguro de Envío</span>
                <h4>Entregas 100% Garantizadas</h4>
              </div>
            </div>
          </div>
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

      {/* 6. Recruitment Dynamic Conversional Banner */}
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

      {/* 8.5 Bottom Banner Slider (Slider final) */}
      <section className={styles.bottomSliderSection}>
        <div className={styles.bottomSlider}>
          {bottomSlides.map((slide, idx) => (
            <div 
              key={idx}
              className={`${styles.bottomSlide} ${currentBottomSlide === idx ? styles.bottomSlideActive : ''}`}
            >
              <Image 
                src={slide}
                alt={`SupplyMax Promoción ${idx + 1}`}
                fill
                className={styles.bottomSlideImage}
              />
            </div>
          ))}
          <div className={styles.bottomSlideDots}>
            {bottomSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBottomSlide(idx)}
                className={`${styles.bottomSlideDot} ${currentBottomSlide === idx ? styles.bottomSlideDotActive : ''}`}
                aria-label={`Ir al banner ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 9. Interactive FAQ Accordion Section (Acordeón con pestañas de categorías) */}
      <section className={styles.faqSection}>
        <div className={styles.sectionHeader}>
          <p>RESOLVEMOS TUS DUDAS</p>
          <h2>Preguntas <span>Frecuentes</span></h2>
        </div>

        {/* FAQ Category Filter Tabs */}
        <div className={styles.faqTabsContainer}>
          {['Suplementación', 'Indumentaria & Estilo', 'Envíos, Pagos y Garantías'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFaqCategory(cat)}
              className={`${styles.faqTabButton} ${activeFaqCategory === cat ? styles.faqTabButtonActive : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={styles.faqContainer}>
          {filteredFaqs.map((faq, index) => {
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
          <Link href={`/producto/${product.id}`} className={styles.cardLink}>
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
