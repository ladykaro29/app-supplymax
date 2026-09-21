import React from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import prisma from '@/lib/prisma';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

import { DEFAULT_FEATURED_PRODUCTS, DEFAULT_APPAREL_PRODUCTS } from '@/lib/productsHelper';


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
    comment: "El bolso tipo saco es súper práctico y cómodo para el gym, entran mis suplementos, el shaker y la toalla perfecto. Excelente calidad.",
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
