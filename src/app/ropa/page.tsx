import React from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import prisma from '@/lib/prisma';
import RopaClient from './RopaClient';

export const dynamic = 'force-dynamic';

export default async function RopaPage() {
  let products: any[] = [];
  
  try {
    // Fetch all products that are Ropa
    products = await prisma.product.findMany({
      where: {
        category: 'Ropa'
      },
      orderBy: { id: 'asc' }
    });
  } catch (error) {
    console.error('Ropa DB error:', error);
  }

  return (
    <div>
      <Header />
      <RopaClient products={products} />
      <Footer />
    </div>
  );
}
