import React from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import prisma from '@/lib/prisma';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

const DEFAULT_FEATURED_PRODUCTS = [
  {
    id: 101,
    name: "Pure Whey Impact 5lb",
    category: "Proteínas",
    goal: "MÁS VENDIDO",
    price: 65.00,
    image: "/brand-photos/Suplementos/IMG-20260513-WA0013.jpg",
    description: "Proteína de suero de alta calidad para máxima recuperación muscular.",
    isFeatured: true,
    portions: "70",
    flavor: "Vainilla, Chocolate",
    weight: "2.2kg, 5 lbs",
  },
  {
    id: 102,
    name: "Creatine Micronized 300g",
    category: "Creatinas",
    goal: "OFERTA",
    price: 35.00,
    isOffer: true,
    discount: 5.00,
    image: "/brand-photos/Suplementos/IMG-20260513-WA0017.jpg",
    description: "Creatina monohidratada pura para aumento de fuerza y potencia celular.",
    isFeatured: true,
    weight: "300g",
  },
  {
    id: 103,
    name: "Creatina Creapure Elite 500g",
    category: "Creatinas",
    goal: "PREMIUM",
    price: 49.99,
    image: "/brand-photos/Suplementos/IMG-20260513-WA0018.jpg",
    description: "Creatina Creapure alemana patentada de máxima solubilidad y pureza científica.",
    isFeatured: true,
    weight: "500g",
  },
  {
    id: 104,
    name: "Pre-Workout Nitro Focus 300g",
    category: "Pre-Entrenos",
    goal: "ENERGÍA MÁXIMA",
    price: 42.00,
    image: "/brand-photos/Suplementos/IMG-20260513-WA0019.jpg",
    description: "Fórmula pre-entrenamiento con vasodilatadores y energía limpia para sesiones intensas.",
    isFeatured: true,
    portions: "30",
  },
  {
    id: 105,
    name: "BCAA + Glutamina Recovery 400g",
    category: "Aminoácidos",
    goal: "RECUPERACIÓN",
    price: 32.00,
    image: "/brand-photos/Suplementos/IMG-20260513-WA0016.jpg",
    description: "Ratio 4:1:1 enriquecido con glutamina micronizada para acelerar la regeneración.",
    isFeatured: true,
    portions: "40",
  },
  {
    id: 106,
    name: "Proteína IsoHydro Platinum 5lb",
    category: "Proteínas",
    goal: "CERO GRASAS",
    price: 78.00,
    image: "/brand-photos/Suplementos/IMG-20260513-WA0020.jpg",
    description: "Aislado e hidrolizado puro con 27g de proteína por scoop y ultra rápida absorción.",
    isFeatured: true,
    portions: "72",
  }
];

const DEFAULT_APPAREL_PRODUCTS = [
  {
    id: 201,
    name: "Camiseta Oversized Acid Wash SupplyMax",
    category: "Ropa",
    goal: "LIFESTYLE",
    price: 28.00,
    image: "/brand-photos/Ropa con modelo/IMG_7283.png",
    description: "Camiseta de corte oversized en algodón pesado de 240 GSM. Caída perfecta para el gimnasio y la calle.",
    sizes: "S, M, L, XL",
  },
  {
    id: 202,
    name: "Hoodie Heavyweight Athlete Edition",
    category: "Ropa",
    goal: "ESTILO & ABRIGO",
    price: 55.00,
    image: "/brand-photos/Ropa con modelo/IMG_7282.png",
    description: "Sudadera con capucha de alto gramaje, bolsillo canguro y acabados elásticos reforzados.",
    sizes: "M, L, XL",
  },
  {
    id: 203,
    name: "Short Deportivo Pro-Fit 5\"",
    category: "Ropa",
    goal: "ALTO RENDIMIENTO",
    price: 25.00,
    image: "/brand-photos/Ropa con modelo/IMG_7287.png",
    description: "Short deportivo de tiro 5 pulgadas con tejido stretch transpirable y bolsillos con cremallera oculta.",
    sizes: "S, M, L",
  },
  {
    id: 204,
    name: "Bolso Deportivo SupplyMax Premium",
    category: "Ropa",
    goal: "ACCESORIO",
    price: 45.00,
    image: "/brand-products/supplymax-bag.jpg",
    description: "Bolso impermeable de alta capacidad para gimnasio con compartimento para calzado húmedo.",
    sizes: "Único",
  }
];

const DEFAULT_PARTNERS = [
  {
    id: "p1",
    name: "Carlos Morales",
    role_id: "Coach",
    image: "/about/clothing-model-1.png",
  },
  {
    id: "p2",
    name: "Valeria Rivas",
    role_id: "Influencer",
    image: "/about/clothing-model-2.png",
  },
  {
    id: "p3",
    name: "Alejandro Mendoza",
    role_id: "Coach",
    image: "/brand-photos/Ropa con modelo/IMG_7284.png",
  },
  {
    id: "p4",
    name: "Mariana Silva",
    role_id: "Influencer",
    image: "/about/athletes-combo.jpg",
  }
];

const DEFAULT_REVIEWS = [
  {
    id: "r1",
    rating: 5,
    comment: "Llegó en 24 horas a Mérida con delivery gratis. La creatina Creapure tiene una pureza increíble, se disuelve en frío de una.",
    user: { name: "José Luis D." },
    isVerified: true,
  },
  {
    id: "r2",
    rating: 5,
    comment: "El corte de las camisetas oversized es de otro nivel, tela pesada que no se deforma tras los lavados. 100% recomendados.",
    user: { name: "Andrés Gómez" },
    isVerified: true,
  },
  {
    id: "r3",
    rating: 5,
    comment: "Envío asegurado por Zoom directo a Caracas, embalaje al vacío súper protegido. Ya es mi tercera compra de proteína.",
    user: { name: "Camila P." },
    isVerified: true,
  },
  {
    id: "r4",
    rating: 5,
    comment: "Excelente atención al cliente y la tasa de conversión VES/USD siempre justa. El pre-workout nitro pega limpio sin taquicardia.",
    user: { name: "Ricardo M." },
    isVerified: true,
  },
  {
    id: "r5",
    rating: 5,
    comment: "El bolso deportivo tiene espacio separado para zapatos y los suplementos entran perfectos. Calidad de exportación.",
    user: { name: "Daniela F." },
    isVerified: true,
  },
  {
    id: "r6",
    rating: 5,
    comment: "Orgulloso de que una marca venezolana tenga este estándar de calidad internacional en Mérida. Máximo rendimiento.",
    user: { name: "Marcos Herrera" },
    isVerified: true,
  }
];

export default async function Home() {
  let featuredProducts: any[] = [];
  let apparelProducts: any[] = [];
  let partners: any[] = [];
  let reviews: any[] = [];

  try {
    // Fetch featured products from DB (Supplements)
    featuredProducts = await prisma.product.findMany({
      where: { isFeatured: true, NOT: { category: 'Ropa' } },
      orderBy: { id: 'desc' }
    });

    // Fetch featured apparel
    apparelProducts = await prisma.product.findMany({
      where: { category: 'Ropa' },
      orderBy: { id: 'desc' },
      take: 4
    });

    // Fetch featured partners
    partners = await prisma.user.findMany({
      where: { is_featured: true, role_id: { in: ['Influencer', 'Coach'] } },
    });

    // Fetch testimonials (latest reviews)
    reviews = await prisma.review.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    });
  } catch (error) {
    console.error('Home page DB error:', error);
  }

  // Gracefully fall back to rich default brand catalog if DB is empty
  const finalFeatured = featuredProducts.length > 0 ? featuredProducts : DEFAULT_FEATURED_PRODUCTS;
  const finalApparel = apparelProducts.length > 0 ? apparelProducts : DEFAULT_APPAREL_PRODUCTS;
  const finalPartners = partners.length > 0 ? partners : DEFAULT_PARTNERS;
  const finalReviews = reviews.length > 0 ? reviews : DEFAULT_REVIEWS;

  return (
    <div>
      <Header />
      <HomeClient 
        featuredProducts={finalFeatured} 
        apparelProducts={finalApparel}
        partners={finalPartners}
        reviews={finalReviews}
      />
      <Footer />
    </div>
  );
}
