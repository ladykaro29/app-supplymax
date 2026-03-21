export interface Product {
  id: number;
  name: string;
  category: string; // 'Suplementos' | 'Ropa' | etc.
  goal?: string;
  price: number; // Selling price
  purchasePrice?: number; // Manufacturing/Purchase price
  image: string;
  description: string;
  portions?: string; // For supplements
  flavor?: string; // For supplements
  weight?: string; // For supplements
  sizes?: string[]; // For clothing ['S', 'M', 'L', 'XL']
  isFeatured?: boolean;
  isOffer?: boolean;
  discount?: number;
  highlights?: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Pure Whey Impact",
    category: "Suplementos",
    goal: "Ganancia",
    price: 49.99,
    purchasePrice: 25.00,
    image: "/protein.png",
    description: "Proteína de suero de alta calidad para máxima recuperación muscular.",
    portions: "30",
    flavor: "Vainilla Ice Cream",
    weight: "2 lbs",
    isFeatured: true,
    highlights: ["25g Proteína por servicio", "0g Azúcar añadida"]
  },
  {
    id: 2,
    name: "Creatine Micronized",
    category: "Suplementos",
    goal: "Potencia",
    price: 34.99,
    purchasePrice: 15.00,
    image: "/creatine.png",
    description: "Creatina monohidratada micronizada de grado farmacéutico.",
    portions: "60",
    flavor: "Unflavored",
    weight: "300g",
    isOffer: true,
    discount: 5,
    highlights: ["100% Monohidrato puro"]
  },
  {
    id: 3,
    name: "Amino Recovery Complex",
    category: "Suplementos",
    goal: "Recuperación",
    price: 29.99,
    purchasePrice: 12.00,
    image: "/amino.png",
    description: "Matriz de aminoácidos esenciales y electrolitos.",
    portions: "45",
    flavor: "Lemon Lime",
    weight: "450g",
    highlights: ["Electrolitos añadidos"]
  },
  {
    id: 4,
    name: "Camiseta SupplyMax Gym",
    category: "Ropa",
    price: 25.00,
    purchasePrice: 10.00,
    image: "/clothing.png",
    description: "Camiseta técnica para entrenamiento de alta intensidad.",
    sizes: ["S", "M", "L", "XL"],
    isFeatured: true,
    highlights: ["Tejido transpirable", "Ajuste atlético"]
  }
];
