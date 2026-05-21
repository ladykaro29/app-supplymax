import React from 'react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-zinc-950/60 backdrop-blur-md border-b border-zinc-800/40 px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-bold text-white tracking-wider text-sm shadow-lg shadow-red-500/10 group-hover:scale-105 transition-transform duration-300">
            S
          </div>
          <span className="font-sans font-black text-xl tracking-tight text-white group-hover:text-red-500 transition-colors duration-300">
            SUPPLI<span className="text-zinc-500 group-hover:text-amber-500 transition-colors duration-300">MAX</span>
            <span className="ml-1.5 text-[9px] uppercase tracking-widest bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-mono">LABS</span>
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          {['Innovación', 'Especificaciones', 'Rendimiento', 'Opiniones'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="relative hover:text-white transition-colors duration-300 group py-1"
            >
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Action Button & Icons */}
        <div className="flex items-center gap-6">
          <button 
            aria-label="Buscar"
            className="text-zinc-400 hover:text-white hover:scale-110 active:scale-95 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
          </button>
          
          <button 
            aria-label="Carrito de compras"
            className="relative text-zinc-400 hover:text-white hover:scale-110 active:scale-95 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center border border-zinc-950 animate-pulse">
              1
            </span>
          </button>

          <a 
            href="#checkout" 
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 rounded-full active:scale-95 hover:shadow-lg hover:shadow-white/5 transition-all duration-300"
          >
            Adquirir Ahora
          </a>
        </div>
      </div>
    </nav>
  );
}
