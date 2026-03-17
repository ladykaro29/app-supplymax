export interface Product {
  id: number;
  name: string;
  category: string;
  goal: string;
  price: number;
  image: string;
  description: string;
  durationInDays?: number | null;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Pure Whey Impact",
    category: "Proteínas",
    goal: "Ganancia",
    price: 49.99,
    image: "/protein.png",
    description: "Proteína de suero de alta calidad para máxima recuperación muscular.",
    durationInDays: 30
  },
  {
    id: 2,
    name: "Creatine Micronized",
    category: "Aminoácidos",
    goal: "Ganancia",
    price: 34.99,
    image: "/creatine.png",
    description: "Creatina pura para aumentar fuerza y volumen muscular.",
    durationInDays: 60
  },
  {
    id: 3,
    name: "Amino Recovery Complex",
    category: "Aminoácidos",
    goal: "Definición",
    price: 29.99,
    image: "/amino.png",
    description: "Mezcla optimizada de aminoácidos para recuperación durante la dieta.",
    durationInDays: 45
  },
  {
    id: 4,
    name: "Elite Training Hoodie",
    category: "Ropa",
    goal: "General",
    price: 55.00,
    image: "/hoodie.png",
    description: "Sudadera de alto rendimiento con materiales transpirables."
  }
];
