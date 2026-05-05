import React from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import prisma from '@/lib/prisma';
import CatalogClient from './CatalogClient';

export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  let products: any[] = [];
  
  try {
    // Fetch real products from DB
    products = await prisma.product.findMany({
      orderBy: { id: 'asc' }
    });
  } catch (error) {
    console.error('Catalog DB error:', error);
  }

  return (
    <div>
      <Header />
      <CatalogClient initialProducts={products} />
      <Footer />
    </div>
  );
}
