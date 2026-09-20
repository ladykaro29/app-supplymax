import React from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getProductByIdOrSlug } from '@/lib/productsHelper';
import ProductDetailClient from './ProductDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductByIdOrSlug(id);

  if (!product) {
    return { title: 'Producto no encontrado | SupplyMax' };
  }

  const headerList = await headers();
  const host = headerList.get('host') || 'kickoff-fitness.0gxuxx.easypanel.host';
  const proto = headerList.get('x-forwarded-proto') || 'https';
  const siteUrl = `${proto}://${host}`;

  const cleanImagePath = product.image.startsWith('/') ? product.image : `/${product.image}`;
  const imageUrl = product.image.startsWith('http') ? product.image : `${siteUrl}${cleanImagePath}`;
  const pageUrl = `${siteUrl}/catalog/${product.slug || product.id}`;

  const title = `${product.name} | SupplyMax`;
  const priceFormatted = (Number(product.price) || 0).toFixed(2);
  const description = `${product.name} - $${priceFormatted} USD. ${product.description || 'Disponible para envío inmediato en Mérida y a toda Venezuela.'}`;

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
  
  // Find product in DB or brand catalog
  const product = await getProductByIdOrSlug(id);

  if (!product) {
    return notFound();
  }

  return (
    <div>
      <Header />
      <ProductDetailClient product={product} />
      <Footer />
    </div>
  );
}
