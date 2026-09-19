import React from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import prisma from '@/lib/prisma';
import SuplementosClient from './SuplementosClient';

export const dynamic = 'force-dynamic';

export default async function SuplementosPage() {
  let products: any[] = [];
  
  try {
    // Fetch all products that are NOT Ropa
    products = await prisma.product.findMany({
      where: {
        NOT: {
          category: 'Ropa'
        }
      },
      orderBy: { id: 'asc' }
    });
  } catch (error) {
    console.error('Suplementos DB error:', error);
  }

  return (
    <div>
      <Header />
      <SuplementosClient products={products} />
      <Footer />
    </div>
  );
}
