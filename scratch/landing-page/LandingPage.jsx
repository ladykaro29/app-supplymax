import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import Navbar from './Navbar';
import ProductDetails from './ProductDetails';
import ProductShowcase from './ProductShowcase';

// 1. Data Model representing premium product editions and corresponding color configurations
const PREMIUM_EDITIONS = [
  {
    id: 1,
    name: 'Crimson Venom (Edición Roja)',
    colorHex: '#dc2626', // Red
    bgHex: '#120202',     // Dark Crimson Backdrop
    imageSrc: '/headphones-red.png',
    price: 299,
  },
  {
    id: 2,
    name: 'Cyber Aurora (Edición Cian)',
    colorHex: '#06b6d4', // Cyan
    bgHex: '#010c0f',     // Dark Cyan Backdrop
    imageSrc: '/headphones-cyan.png',
    price: 299,
  },
  {
    id: 3,
    name: 'Solar Flare (Edición Dorada)',
    colorHex: '#f59e0b', // Amber/Gold
    bgHex: '#120801',     // Dark Gold Backdrop
    imageSrc: '/headphones-gold.png',
    price: 329,
  },
];

export default function LandingPage() {
  const containerRef = useRef(null);
  
  // 2. React State management for Active Product Variant
  const [activeProduct, setActiveProduct] = useState(PREMIUM_EDITIONS[0]);

  // 3. Dynamic background transition using GSAP
  useEffect(() => {
    let ctx = gsap.context(() => {
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          backgroundColor: activeProduct.bgHex,
          duration: 1.0,
          ease: "power2.out"
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [activeProduct.id]);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen text-white overflow-x-hidden relative flex flex-col justify-between selection:bg-white selection:text-black transition-colors duration-500 bg-zinc-950 font-sans"
    >
      {/* Premium Glassmorphic Header */}
      <Navbar />

      {/* Decorative ambient subtle background grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-[350px] bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-0" />

      {/* Main Responsive Grid Layout (Split Screen) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-6 pt-24 pb-12 z-10 items-center">
        {/* Left Hand: Conversion Copy & Controls */}
        <div className="order-2 lg:order-1 flex items-center h-full">
          <ProductDetails 
            products={PREMIUM_EDITIONS} 
            activeProduct={activeProduct} 
            setActiveProduct={setActiveProduct} 
          />
        </div>

        {/* Right Hand: Immersive Rotating Showcase */}
        <div className="order-1 lg:order-2 flex items-center justify-center">
          <ProductShowcase activeProduct={activeProduct} />
        </div>
      </main>

      {/* Footer Navigation Credits */}
      <footer className="w-full border-t border-zinc-900/60 bg-black/35 py-6 px-6 relative z-20 text-center sm:text-left">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <p>© {new Date().getFullYear()} SUPPLIMAX LABS. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#terms" className="hover:text-zinc-300 transition-colors">Términos de Servicio</a>
            <a href="#privacy" className="hover:text-zinc-300 transition-colors">Política de Privacidad</a>
            <a href="#support" className="hover:text-zinc-300 transition-colors">Soporte Técnico</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
