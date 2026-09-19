import React from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import prisma from '@/lib/prisma';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

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

  return (
    <div>
      <Header />
      <HomeClient 
        featuredProducts={featuredProducts} 
        apparelProducts={apparelProducts}
        partners={partners}
        reviews={reviews}
      />
      <Footer />
    </div>
  );
}
