import React from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import prisma from '@/lib/prisma';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch featured products from DB
  const featuredProducts = await prisma.product.findMany({
    take: 2,
    orderBy: { id: 'asc' }
  });

  return (
    <div>
      <Header />
      <HomeClient featuredProducts={featuredProducts} />
      <Footer />
    </div>
  );
}
