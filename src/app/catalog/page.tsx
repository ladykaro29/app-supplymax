import React from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import prisma from '@/lib/prisma';
import CatalogClient from './CatalogClient';

export default async function CatalogPage() {
  // Fetch real products from DB
  const products = await prisma.product.findMany({
    orderBy: { id: 'asc' }
  });

  return (
    <div>
      <Header />
      <CatalogClient initialProducts={products} />
      <Footer />
    </div>
  );
}
