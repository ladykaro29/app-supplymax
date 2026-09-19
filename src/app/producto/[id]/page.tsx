import React from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) {
    return { title: 'Producto no encontrado | SupplyMax' };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    return { title: 'Producto no encontrado | SupplyMax' };
  }

  // Resolve current site host dynamically (e.g. easypanel or custom domain)
  const headerList = await headers();
  const host = headerList.get('host') || 'kickoff-fitness.0gxuxx.easypanel.host';
  const proto = headerList.get('x-forwarded-proto') || 'https';
  const siteUrl = `${proto}://${host}`;

  const cleanImagePath = product.image.startsWith('/') ? product.image : `/${product.image}`;
  const imageUrl = product.image.startsWith('http') ? product.image : `${siteUrl}${cleanImagePath}`;
  const pageUrl = `${siteUrl}/producto/${product.id}`;

  const title = `${product.name} | SupplyMax`;
  const description = `${product.name} - $${product.price.toFixed(2)} USD. ${product.description || 'Disponible para envío inmediato en Mérida y a toda Venezuela.'}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'SupplyMax',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        }
      ],
      type: 'website',
      locale: 'es_VE',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

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
