import React from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Try to find the product in DB
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) }
  });

  if (!product) {
    return notFound();
  }

  // Fetch reviews for this product
  let reviews: any[] = [];
  try {
    reviews = await prisma.review.findMany({
      where: { productId: product.id },
      include: {
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
  }

  // Fetch cross-selling products (smart mix of categories)
  let recommendations: any[] = [];
  try {
    recommendations = await prisma.product.findMany({
      where: {
        NOT: { id: product.id },
        stock: { gte: 1 }
      },
      take: 4,
      orderBy: { id: 'desc' }
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
  }

  return (
    <div>
      <Header />
      <ProductDetailClient 
        product={product} 
        reviews={reviews} 
        recommendations={recommendations} 
      />
      <Footer />
    </div>
  );
}
