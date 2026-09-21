import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import SideMenu from '@/components/SideMenu/SideMenu';
import CartDrawer from '@/components/CartDrawer/CartDrawer';
import ChatWidget from '@/components/ChatWidget/ChatWidget';
import styles from './SobreNosotros.module.css';

export const metadata: Metadata = {
  title: 'Quiénes Somos | SupplyMax - Construido por Atletas, Para Atletas',
  description: 'Conoce la historia, visión y compromiso de SupplyMax en Mérida, Venezuela. Suplementos de alta gama e indumentaria de alto rendimiento con envíos asegurados a todo el país.',
  keywords: 'SupplyMax, quiénes somos, sobre nosotros, suplementos Mérida, ropa deportiva Venezuela, fitness Mérida',
};

export default function SobreNosotrosPage() {
  return (
    <div className={styles.container}>
      <Header />

      {/* Ambient background glows */}
      <div className={styles.ambientGlowTop} />
      <div className={styles.ambientGlowBottom} />

      <main className={styles.main}>
        {/* Breadcrumb Navigation */}
        <div className={styles.breadcrumb}>
          <Link href="/">INICIO</Link>
          <span>/</span>
          <span className={styles.breadcrumbActive}>QUIÉNES SOMOS</span>
        </div>

        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            QUIÉNES SOMOS • FORJADOS EN LA DISCIPLINA
          </div>

          <h1 className={styles.title}>
            CONSTRUIDO POR ATLETAS,
            <span className={styles.titleAccent}>PARA ATLETAS.</span>
          </h1>

          <p className={styles.subtitle}>
            Nacimos en Mérida con un propósito claro: equipar a quienes se toman el entrenamiento en serio y no negocian su disciplina.
          </p>

          <div className={styles.heroActions}>
            <Link href="/suplementos" className={styles.primaryBtn}>
              ⚡ Ver Suplementación
            </Link>
            <Link href="/ropa" className={styles.secondaryBtn}>
              👕 Colección de Ropa
            </Link>
          </div>
        </section>

        {/* Stat Counters Row */}
        <section className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>100%</div>
            <div className={styles.statLabel}>Pureza & Alta Gama</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>Mérida</div>
            <div className={styles.statLabel}>Sede Central & Almacén</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>24/7</div>
            <div className={styles.statLabel}>Envíos a Toda Venezuela</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>0%</div>
            <div className={styles.statLabel}>Excusas en el Progreso</div>
          </div>
        </section>

        {/* Brand Story Two-Column Block */}
        <section className={styles.storySection}>
          <div className={styles.storyContent}>
            <h2>Nuestra Misión & ADN</h2>
            
            <p className={styles.storyParagraph}>
              En <strong>SupplyMax</strong> somos una marca construida por atletas, para atletas. No creemos en atajos ni en fórmulas genéricas: entendemos el sudor, la consistencia y la exigencia que requiere cada repetición.
            </p>

            <div className={styles.highlightQuote}>
              «Diseñamos e impulsamos suplementos de alta gama y ropa de alto rendimiento para acompañarte dentro y fuera del gimnasio.»
            </div>

            <p className={styles.storyParagraph}>
              Cada envío sale <strong>asegurado directamente desde nuestra sede central en Mérida con envíos a toda Venezuela</strong>, garantizando seriedad, rapidez y confianza absoluta en cada paso de tu progreso físico y mental.
            </p>
          </div>

          <div className={styles.storyImageWrap}>
            <img 
              src="/about/athletes-combo.jpg" 
              alt="SupplyMax Atletas y Suplementación"
              className={styles.storyImage}
            />
            <div className={styles.storyImageBadge}>
              <span>📍 Mérida, Venezuela</span>
              <span>⚡ Envíos Nacionales</span>
            </div>
          </div>
        </section>

        {/* Pillars / Values Section */}
        <section>
          <div className={styles.pillarsHeader}>
            <span className={styles.sectionTag}>Los 3 Pilares SupplyMax</span>
            <h2 className={styles.sectionTitle}>Lo que nos diferencia</h2>
            <p className={styles.sectionDesc}>
              Cada producto de nuestro catálogo responde a un estándar riguroso de calidad, rendimiento y autenticidad.
            </p>
          </div>

          <div className={styles.pillarsGrid}>
            <div className={styles.pillarCard}>
              <div className={styles.pillarIconBox}>🧪</div>
              <h3 className={styles.pillarTitle}>Suplementos de Alta Gama</h3>
              <p className={styles.pillarText}>
                Creatinas 100% puras Creapure, proteínas de rápida asimilación, pre-entrenos con energía limpia y aminoácidos que aceleran tu recuperación muscular post-sesión.
              </p>
            </div>

            <div className={styles.pillarCard}>
              <div className={styles.pillarIconBox}>👕</div>
              <h3 className={styles.pillarTitle}>Ropa de Alto Rendimiento</h3>
              <p className={styles.pillarText}>
                Camisetas oversized de gramaje pesado, hoodies y joggers confeccionados para soportar los entrenamientos más exigentes y lucir estética dentro y fuera del box o gym.
              </p>
            </div>

            <div className={styles.pillarCard}>
              <div className={styles.pillarIconBox}>📦</div>
              <h3 className={styles.pillarTitle}>Despacho Seguro Nacional</h3>
              <p className={styles.pillarText}>
                Embalaje protector de grado premium y envíos asegurados mediante Zoom, Tealca, MRW o entrega personal en Mérida. Cero margen de error, 100% confiabilidad.
              </p>
            </div>
          </div>
        </section>

        {/* Visual Lifestyle Grid */}
        <section className={styles.lifestyleSection}>
          <div className={styles.lifestyleGrid}>
            <div className={`${styles.lifestyleItem} ${styles.lifestyleItemLarge}`}>
              <img 
                src="/about/clothing-model-1.png" 
                alt="SupplyMax Lifestyle Athlete" 
                className={styles.lifestyleImg}
              />
              <div className={styles.lifestyleOverlay}>
                <span className={styles.lifestyleCaption}>Corte Lifestyle & Gym</span>
                <span className={styles.lifestyleSub}>Oversized Heavyweight Cotton</span>
              </div>
            </div>

            <div className={styles.lifestyleItem}>
              <img 
                src="/about/supplements-lifestyle.jpg" 
                alt="Suplementos y Accesorios" 
                className={styles.lifestyleImg}
              />
              <div className={styles.lifestyleOverlay}>
                <span className={styles.lifestyleCaption}>Nutrición Deportiva</span>
                <span className={styles.lifestyleSub}>Fórmulas Originales</span>
              </div>
            </div>

            <div className={styles.lifestyleItem}>
              <img 
                src="/about/clothing-model-2.png" 
                alt="Atletas SupplyMax" 
                className={styles.lifestyleImg}
              />
              <div className={styles.lifestyleOverlay}>
                <span className={styles.lifestyleCaption}>Comunidad Activa</span>
                <span className={styles.lifestyleSub}>Atletas en Mérida</span>
              </div>
            </div>

            <div className={styles.lifestyleItem} style={{ gridColumn: 'span 2' }}>
              <img 
                src="/about/shipping-venezuela.jpg" 
                alt="Envíos Asegurados a Toda Venezuela" 
                className={styles.lifestyleImg}
              />
              <div className={styles.lifestyleOverlay}>
                <span className={styles.lifestyleCaption}>Despachos Diarios Garantizados</span>
                <span className={styles.lifestyleSub}>Zoom • Tealca • MRW • Delivery Mérida</span>
              </div>
            </div>
          </div>
        </section>

        {/* Manifesto Banner */}
        <section className={styles.manifestoCard}>
          <h2 className={styles.manifestoSlogan}>
            ENTRENA CON ESTILO. <span>SUPÉRATE SIN LÍMITES.</span>
          </h2>
          
          <p className={styles.manifestoText}>
            En SupplyMax estamos comprometidos con tu disciplina diaria. Únete a la comunidad de atletas que no se conforman con lo básico y exigen lo mejor para su cuerpo.
          </p>

          <div className={styles.manifestoBtnRow}>
            <Link href="/catalog" className={styles.primaryBtn}>
              🛍️ Ver Catálogo Completo
            </Link>
            <Link href="/join-team" className={styles.secondaryBtn}>
              🤝 Únete como Atleta / Coach
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
