export interface Product {
  id: number;
  name: string;
  category: string;
  goal: string;
  price: number;
  image: string;
  description: string;
  durationInDays?: number | null;
  flavors?: string[];
  sizes?: string[];
  highlights?: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Pure Whey Impact",
    category: "Proteínas",
    goal: "Ganancia",
    price: 49.99,
    image: "/protein.png",
    description: "Proteína de suero de alta calidad para máxima recuperación muscular. Nuestra fórmula aislada garantiza la absorción más rápida para tus músculos.",
    durationInDays: 30,
    flavors: ["Vainilla Ice Cream", "Double Chocolate", "Strawberry Glaze"],
    sizes: ["2 lbs (30 servicios)", "5 lbs (75 servicios)"],
    highlights: ["25g Proteína por servicio", "0g Azúcar añadida", "BCAAs naturales"]
  },
  {
    id: 2,
    name: "Creatine Micronized",
    category: "Creatinas",
    goal: "Potencia",
    price: 34.99,
    image: "/creatine.png",
    description: "Creatina monohidratada micronizada de grado farmacéutico. Aumenta tu fuerza explosiva y mejora la hidratación celular.",
    durationInDays: 60,
    flavors: ["Unflavored", "Fruit Punch", "Blue Raspberry"],
    sizes: ["300g", "600g"],
    highlights: ["100% Monohidrato puro", "Micronizada para mejor mezcla", "Sin rellenos"]
  },
  {
    id: 3,
    name: "Amino Recovery Complex",
    category: "Aminoácidos/BCAA",
    goal: "Recuperación",
    price: 29.99,
    image: "/amino.png",
    description: "Matriz de aminoácidos esenciales y electrolitos para mantenerte hidratado y recuperado durante tus entrenamientos más intensos.",
    durationInDays: 45,
    flavors: ["Lemon Lime", "Watermelon", "Orange Burst"],
    sizes: ["30 serv", "60 serv"],
    highlights: ["Electrolitos añadidos", "7g BCAA ratio 2:1:1", "Sin cafeína"]
  },
  {
    id: 4,
    name: "Pre-Workout Nitro",
    category: "Pre-Entrenos",
    goal: "Energía",
    price: 42.00,
    image: "/pre-workout.png",
    description: "Fuerza explosiva y enfoque mental láser. Diseñado para empujarte más allá de tus límites en cada sesión de entrenamiento.",
    durationInDays: 30,
    flavors: ["Grape Soda", "Green Apple", "Nuclear Mango"],
    sizes: ["30 servicios"],
    highlights: ["Beta-Alanina para resistencia", "Citrulina Malato 2:1", "300mg Cafeína"]
  }
];
