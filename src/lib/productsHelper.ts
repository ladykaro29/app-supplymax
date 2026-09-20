import prisma from '@/lib/prisma';
import { slugify } from '@/lib/slugify';
import { PRODUCTS } from '@/data/products';

export interface ProductData {
  id: number;
  name: string;
  slug?: string | null;
  category: string;
  goal?: string | null;
  price: number;
  purchasePrice?: number | null;
  image: string;
  images?: string | string[] | null;
  description: string;
  portions?: string | null;
  flavor?: string | null;
  flavors?: string[] | null;
  weight?: string | null;
  sizes?: string | string[] | null;
  isFeatured?: boolean | null;
  isOffer?: boolean | null;
  discount?: number | null;
  highlights?: string[] | null;
  durationInDays?: string | null;
  stock?: number;
}

export const DEFAULT_FEATURED_PRODUCTS: ProductData[] = [
  {
    id: 101,
    name: "Pure Whey Impact 5lb",
    slug: "pure-whey-impact-5lb",
    category: "Proteínas",
    goal: "MÁS VENDIDO",
    price: 65.00,
    image: "/brand-photos/Suplementos/IMG-20260513-WA0013.jpg",
    description: "Proteína de suero de alta calidad para máxima recuperación muscular.",
    isFeatured: true,
    portions: "70",
    flavor: "Vainilla, Chocolate",
    weight: "2.2kg, 5 lbs",
    stock: 25,
  },
  {
    id: 102,
    name: "Creatine Micronized 300g",
    slug: "creatine-micronized-300g",
    category: "Creatinas",
    goal: "OFERTA",
    price: 35.00,
    isOffer: true,
    discount: 5.00,
    image: "/brand-photos/Suplementos/IMG-20260513-WA0017.jpg",
    description: "Creatina monohidratada pura para aumento de fuerza y potencia celular.",
    isFeatured: true,
    weight: "300g",
    stock: 30,
  },
  {
    id: 103,
    name: "Creatina Creapure Elite 500g",
    slug: "creatina-creapure-elite-500g",
    category: "Creatinas",
    goal: "PREMIUM",
    price: 49.99,
    image: "/brand-photos/Suplementos/IMG-20260513-WA0018.jpg",
    description: "Creatina Creapure alemana patentada de máxima solubilidad y pureza científica.",
    isFeatured: true,
    weight: "500g",
    stock: 18,
  },
  {
    id: 104,
    name: "Pre-Workout Nitro Focus 300g",
    slug: "pre-workout-nitro-focus-300g",
    category: "Pre-Entrenos",
    goal: "ENERGÍA MÁXIMA",
    price: 42.00,
    image: "/brand-photos/Suplementos/IMG-20260513-WA0019.jpg",
    description: "Fórmula pre-entrenamiento con vasodilatadores y energía limpia para sesiones intensas.",
    isFeatured: true,
    portions: "30",
    stock: 22,
  },
  {
    id: 105,
    name: "BCAA + Glutamina Recovery 400g",
    slug: "bcaa-glutamina-recovery-400g",
    category: "Aminoácidos",
    goal: "RECUPERACIÓN",
    price: 32.00,
    image: "/brand-photos/Suplementos/IMG-20260513-WA0016.jpg",
    description: "Ratio 4:1:1 enriquecido con glutamina micronizada para acelerar la regeneración.",
    isFeatured: true,
    portions: "40",
    stock: 15,
  },
  {
    id: 106,
    name: "Proteína IsoHydro Platinum 5lb",
    slug: "proteina-isohydro-platinum-5lb",
    category: "Proteínas",
    goal: "CERO GRASAS",
    price: 78.00,
    image: "/brand-photos/Suplementos/IMG-20260513-WA0020.jpg",
    description: "Aislado e hidrolizado puro con 27g de proteína por scoop y ultra rápida absorción.",
    isFeatured: true,
    portions: "72",
    stock: 20,
  }
];

export const DEFAULT_APPAREL_PRODUCTS: ProductData[] = [
  {
    id: 201,
    name: "Camiseta Oversized Acid Wash SupplyMax",
    slug: "camiseta-oversized-acid-wash-supplymax",
    category: "Ropa",
    goal: "LIFESTYLE",
    price: 28.00,
    image: "/brand-photos/Ropa con modelo/IMG_7283.png",
    description: "Camiseta de corte oversized en algodón pesado de 240 GSM. Caída perfecta para el gimnasio y la calle.",
    sizes: "S, M, L, XL",
    stock: 40,
  },
  {
    id: 202,
    name: "Hoodie Heavyweight Athlete Edition",
    slug: "hoodie-heavyweight-athlete-edition",
    category: "Ropa",
    goal: "ESTILO & ABRIGO",
    price: 55.00,
    image: "/brand-photos/Ropa con modelo/IMG_7282.png",
    description: "Sudadera con capucha de alto gramaje, bolsillo canguro y acabados elásticos reforzados.",
    sizes: "M, L, XL",
    stock: 25,
  },
  {
    id: 203,
    name: "Short Deportivo Pro-Fit 5\"",
    slug: "short-deportivo-pro-fit-5",
    category: "Ropa",
    goal: "ALTO RENDIMIENTO",
    price: 25.00,
    image: "/brand-photos/Ropa con modelo/IMG_7287.png",
    description: "Short deportivo de tiro 5 pulgadas con tejido stretch transpirable y bolsillos con cremallera oculta.",
    sizes: "S, M, L",
    stock: 35,
  },
  {
    id: 204,
    name: "Bolso Deportivo SupplyMax Premium",
    slug: "bolso-deportivo-supplymax-premium",
    category: "Ropa",
    goal: "ACCESORIO",
    price: 45.00,
    image: "/brand-products/supplymax-bag.jpg",
    description: "Bolso impermeable de alta capacidad para gimnasio con compartimento para calzado húmedo.",
    sizes: "Único",
    stock: 15,
  }
];

export const ALL_BRAND_PRODUCTS: ProductData[] = [
  ...DEFAULT_FEATURED_PRODUCTS,
  ...DEFAULT_APPAREL_PRODUCTS,
  ...PRODUCTS.map(p => ({
    ...p,
    slug: slugify(p.name),
    stock: 20
  }))
];

/**
 * Robust product resolver: looks up in DB first (by ID or SEO slug),
 * and falls back seamlessly to brand defaults if not found in DB.
 * Never throws 404 for valid brand products.
 */
export async function getProductByIdOrSlug(idOrSlug: string): Promise<ProductData | null> {
  if (!idOrSlug) return null;
  const decoded = decodeURIComponent(idOrSlug).trim().toLowerCase();
  const numericId = parseInt(decoded);

  // 1. Try finding in DB
  try {
    let product: any = null;

    if (!isNaN(numericId)) {
      product = await prisma.product.findUnique({
        where: { id: numericId }
      });
    }

    if (!product) {
      try {
        product = await (prisma.product as any).findFirst({
          where: {
            OR: [
              { slug: decoded },
              { name: decoded }
            ]
          }
        });
      } catch {
        // In case slug column is not yet migrated in DB, search by name
        product = await prisma.product.findFirst({
          where: {
            name: decoded
          }
        });
      }
    }

    if (product) {
      return {
        ...product,
        slug: product.slug || slugify(product.name) || String(product.id)
      };
    }
  } catch (error) {
    console.error('Error fetching product from DB:', error);
  }

  // 2. Fallback to hardcoded brand catalog
  const fallback = ALL_BRAND_PRODUCTS.find(p => {
    if (!isNaN(numericId) && p.id === numericId) return true;
    const itemSlug = p.slug || slugify(p.name);
    if (itemSlug === decoded) return true;
    if (p.name.toLowerCase() === decoded) return true;
    return false;
  });

  if (fallback) {
    return {
      ...fallback,
      slug: fallback.slug || slugify(fallback.name) || String(fallback.id)
    };
  }

  return null;
}
