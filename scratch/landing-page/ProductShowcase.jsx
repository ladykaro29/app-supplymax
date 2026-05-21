import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function ProductShowcase({ activeProduct }) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const glowRef = useRef(null);
  
  // Local state to manage image src swap dynamically during animation
  const [displayImage, setDisplayImage] = useState(activeProduct.imageSrc);

  // 1. Continuous slow rotation animation
  useEffect(() => {
    let ctx = gsap.context(() => {
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          rotation: 360,
          duration: 35,
          ease: "none",
          repeat: -1,
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // 2. Swapping images transition animation
  useEffect(() => {
    // Skip on initial mount if matching
    if (displayImage === activeProduct.imageSrc) return;

    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          // Update the image source state at the exact moment of complete fade-out
          setDisplayImage(activeProduct.imageSrc);
        }
      });

      // Quick fade out and scale down
      tl.to(imageRef.current, {
        opacity: 0,
        scale: 0.85,
        filter: 'blur(10px)',
        duration: 0.25,
        ease: "power2.in"
      });

      // Animate background glow along with the product color
      tl.to(glowRef.current, {
        opacity: 0.3,
        scale: 1.1,
        duration: 0.3,
        ease: "power2.inOut"
      }, 0);

    }, containerRef);

    return () => ctx.revert();
  }, [activeProduct.id]);

  // 3. Fade in animation once local displayImage updates
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(imageRef.current, 
        { 
          opacity: 0, 
          scale: 0.85,
          filter: 'blur(10px)'
        },
        { 
          opacity: 1, 
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.5, 
          ease: "power3.out"
        }
      );

      gsap.to(glowRef.current, {
        opacity: 0.5,
        scale: 1,
        duration: 0.6,
        ease: "power3.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, [displayImage]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[350px] sm:h-[450px] lg:h-[600px] flex items-center justify-center select-none"
    >
      {/* Dynamic Background Glow representing active product Accent */}
      <div 
        ref={glowRef}
        className="absolute w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] rounded-full blur-[100px] transition-colors duration-1000"
        style={{
          backgroundColor: activeProduct.colorHex,
          opacity: 0.4,
        }}
      />

      {/* Floating Orbital Particle Rings (Decorative Premium Element) */}
      <div className="absolute w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] rounded-full border border-dashed border-zinc-800/40 animate-[spin_180s_linear_infinite]" />
      <div className="absolute w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] rounded-full border border-zinc-900/30 animate-[spin_240s_linear_infinite]" />

      {/* Floating Product Shadow */}
      <div className="absolute bottom-8 w-[150px] h-[15px] sm:w-[250px] sm:h-[25px] bg-black/70 rounded-full blur-xl scale-x-110 animate-[pulse_6s_ease-in-out_infinite]" />

      {/* Main Rotating Product Image */}
      <img
        ref={imageRef}
        src={displayImage}
        alt={activeProduct.name}
        className="w-auto h-[260px] sm:h-[360px] lg:h-[480px] object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.8)] z-10 cursor-grab active:cursor-grabbing transition-transform duration-300 hover:scale-[1.03]"
        style={{
          transformStyle: 'preserve-3d',
        }}
      />
    </div>
  );
}
