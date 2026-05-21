import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function ProductDetails({ 
  products, 
  activeProduct, 
  setActiveProduct 
}) {
  const detailsRef = useRef(null);

  // Entrance animation for copy writing elements
  useEffect(() => {
    let ctx = gsap.context(() => {
      // Create a coordinated stagger reveal timeline
      const tl = gsap.timeline();
      
      tl.from(".animate-badge", {
        opacity: 0,
        x: -20,
        duration: 0.6,
        ease: "power3.out"
      })
      .from(".animate-title", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power4.out"
      }, "-=0.4")
      .from(".animate-desc", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power3.out"
      }, "-=0.5")
      .from(".animate-controls", {
        opacity: 0,
        y: 15,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
      }, "-=0.4");
      
    }, detailsRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={detailsRef}
      className="flex flex-col justify-center px-4 lg:px-12 py-12 text-white h-full relative z-20 font-sans"
    >
      {/* 1. ATTENTION (Badge & H1 Title) */}
      <div className="mb-6 flex">
        <span 
          className="animate-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-zinc-800/80 border border-zinc-700/50"
          style={{ color: activeProduct.colorHex }}
        >
          <span 
            className="w-1.5 h-1.5 rounded-full animate-pulse" 
            style={{ backgroundColor: activeProduct.colorHex }}
          />
          Lanzamiento Premium 2026
        </span>
      </div>

      <h1 className="animate-title text-4xl sm:text-6xl lg:text-[72px] font-black tracking-tighter leading-none mb-6">
        SONIDO SIN <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600">
          CONCESIONES.
        </span>
      </h1>

      {/* 2. INTEREST & DESIRE (Copywriting Paragraph) */}
      <p className="animate-desc text-zinc-400 text-sm sm:text-base lg:text-lg leading-relaxed max-w-lg mb-8">
        Presentamos los <strong className="text-white font-semibold">AeroLuxe Pro</strong>. Rediseñados desde el átomo para ofrecer una fidelidad de audio extrema combinada con un chasis de carbono ultraligero de grado atlético. Cancelación activa de ruido neural adaptativa e insonorización total, creados para mantenerte en estado de flow absoluto durante tus entrenamientos más exigentes.
      </p>

      {/* 3. CONTROLS: Interactive State Updates & CTA */}
      <div className="space-y-8 animate-controls">
        {/* Color Selector */}
        <div>
          <h2 className="text-xs uppercase font-mono tracking-widest text-zinc-500 mb-3">
            Elige tu Estilo / Edición Limitada
          </h2>
          <div className="flex gap-4">
            {products.map((prod) => {
              const isActive = prod.id === activeProduct.id;
              return (
                <button
                  key={prod.id}
                  onClick={() => setActiveProduct(prod)}
                  className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive 
                      ? 'scale-110 ring-2 ring-white/80 ring-offset-4 ring-offset-zinc-950 shadow-2xl' 
                      : 'hover:scale-105 opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: prod.colorHex }}
                  title={prod.name}
                  aria-label={`Seleccionar color ${prod.name}`}
                >
                  {/* Subtle Inner Highlight */}
                  <span className="absolute inset-0.5 rounded-full border border-black/10 mix-blend-overlay group-hover:scale-95 transition-transform" />
                  
                  {/* Active Center Dot Indicator */}
                  {isActive && (
                    <span className="w-2.5 h-2.5 bg-white rounded-full shadow-inner animate-[scaleUp_0.2s_ease-out]" />
                  )}
                </button>
              );
            })}
          </div>
          {/* Active Color Name */}
          <p className="text-sm font-semibold mt-2.5" style={{ color: activeProduct.colorHex }}>
            {activeProduct.name}
          </p>
        </div>

        {/* Pricing Table (Bimonetario Vibe aligned with Supplimax) */}
        <div className="border-t border-zinc-800/80 pt-6 flex flex-wrap items-baseline gap-4 sm:gap-8">
          <div>
            <span className="block text-[10px] uppercase font-mono tracking-widest text-zinc-500">
              Precio Exclusivo
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                USD {activeProduct.price}
              </span>
              <span className="text-zinc-500 line-through text-sm">
                USD {Math.round(activeProduct.price * 1.3)}
              </span>
            </div>
          </div>

          <div className="px-4 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className="block text-[8px] uppercase font-mono tracking-wider text-zinc-500">
              Equivalente Estimado
            </span>
            <span className="text-xs font-mono font-bold text-emerald-500">
              ~ ARS {(activeProduct.price * 1050).toLocaleString()}
            </span>
          </div>
        </div>

        {/* 4. ACTION: High-converting Checkout Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button 
            id="checkout-cta"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-zinc-950 font-extrabold hover:bg-zinc-200 active:scale-[0.98] rounded-full shadow-[0_15px_30px_rgba(255,255,255,0.05)] transition-all duration-300 text-sm group"
          >
            Reservar Ahora (Envío Gratis)
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
          
          <button className="flex-1 sm:flex-none inline-flex items-center justify-center px-8 py-4 bg-zinc-900 text-zinc-300 border border-zinc-800 font-semibold hover:bg-zinc-800 active:scale-[0.98] hover:text-white rounded-full transition-all duration-300 text-sm">
            Explorar Tecnología
          </button>
        </div>
      </div>

      {/* Trust badges footer */}
      <div className="mt-12 pt-6 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-600 font-mono">
        <span>🔒 Pago 100% Seguro</span>
        <span>⚡ Envío Express</span>
        <span>🛡️ 2 Años de Garantía</span>
      </div>
    </div>
  );
}
