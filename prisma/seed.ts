import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning existing product-related data...');
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.product.deleteMany();

  console.log('Seeding products with brand photos...');
  const products = [
    {
      name: "Pure Whey Impact 5lb",
      category: "Proteínas",
      goal: "MÁS VENDIDO",
      price: 65.00,
      image: "/brand-photos/Suplementos/IMG-20260513-WA0013.jpg",
      description: "Proteína de suero de alta calidad para máxima recuperación muscular.",
      isFeatured: true,
      portions: "70",
      flavor: "Vainilla",
      weight: "2.2kg",
      durationInDays: "30"
    },
    {
      name: "Creatine Micronized 300g",
      category: "Creatinas",
      goal: "FUERZA MÁXIMA",
      price: 35.00,
      image: "/brand-photos/Suplementos/IMG-20260513-WA0017.jpg",
      description: "Creatina monohidratada pura para aumento de fuerza y potencia celular.",
      isOffer: true,
      discount: 10,
      weight: "300g",
      durationInDays: "60"
    },
    {
      name: "Creatina Creapure Elite 500g",
      category: "Creatinas",
      goal: "PREMIUM",
      price: 49.99,
      image: "/brand-photos/Suplementos/IMG-20260513-WA0018.jpg",
      description: "Creatina Creapure alemana patentada de máxima solubilidad y pureza científica.",
      weight: "500g",
      durationInDays: "100"
    },
    {
      name: "Creatina HCL Concentrated 150g",
      category: "Creatinas",
      goal: "POTENCIA CELULAR",
      price: 39.99,
      image: "/brand-photos/Suplementos/IMG-20260513-WA0019.jpg",
      description: "Creatina clorhidrato concentrada de rápida absorción sin retención de líquido extracelular.",
      weight: "150g",
      durationInDays: "50"
    },
    {
      name: "Creatine Plus Energy 300g",
      category: "Creatinas",
      goal: "ENERGÍA EXTRA",
      price: 37.99,
      image: "/brand-photos/Suplementos/IMG-20260513-WA0016.jpg",
      description: "Creatina monohidratada adicionada con taurina y electrolitos para una contracción muscular potente.",
      weight: "300g",
      durationInDays: "60"
    },
    {
      name: "Elite Amino Recovery",
      category: "Aminoácidos/BCAA",
      goal: "RECUPERACIÓN",
      price: 29.99,
      image: "/brand-photos/Suplementos/IMG-20260513-WA0020.jpg",
      description: "BCAA premium para evitar el catabolismo y promover la hidratación muscular.",
      weight: "400g",
      durationInDays: "45"
    },
    {
      name: "Pre-Workout Nitro",
      category: "Pre-Entrenos",
      goal: "ENERGÍA",
      price: 45.00,
      image: "/brand-photos/Suplementos/IMG-20260513-WA0024.jpg",
      description: "Explosión de energía para tus entrenamientos más pesados y enfoque mental extremo.",
      portions: "30",
      flavor: "Fruit Punch",
      durationInDays: "30"
    },
    {
      name: "Camiseta Oversized Blanca SupplyMax",
      category: "Ropa",
      goal: "COLECCIÓN BLANCA",
      price: 25.00,
      image: "/brand-photos/Ropa con modelo/IMG_7283.png",
      description: "Camiseta oversized blanca de algodón premium pesado, corte lifestyle ultra estético.",
      isFeatured: true,
      sizes: "S,M,L,XL"
    },
    {
      name: "Camiseta Oversized Negra SupplyMax",
      category: "Ropa",
      goal: "COLECCIÓN NEGRA",
      price: 25.00,
      image: "/brand-photos/Ropa con modelo/IMG_7282.png",
      description: "Camiseta oversized negra de algodón pesado con logo de la marca, horma perfecta.",
      isFeatured: true,
      sizes: "S,M,L,XL"
    },
    {
      name: "Performance Joggers Negros",
      category: "Ropa",
      goal: "COLECCIÓN NEGRA",
      price: 45.00,
      image: "/brand-photos/Ropa con modelo/IMG_7287.png",
      description: "Pantalones deportivos ajustados de color negro con tecnología dry-fit y bolsillos con cierre.",
      isFeatured: true,
      sizes: "M,L,XL"
    },
    {
      name: "Bolso Deportivo SupplyMax",
      category: "Ropa",
      goal: "ACCESORIO",
      price: 39.99,
      image: "/brand-photos/Suplementos + ropa/Photoroom_20260328_114310.jpg",
      description: "Bolso de entrenamiento premium. Compartimento aislado para calzado húmedo, espacio para suplementos y costuras reforzadas ultra resistentes.",
      sizes: "Único"
    }
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log('Ensuring users & partners exist...');
  
  // Explicitly remove the old admin user as requested
  await prisma.user.deleteMany({
    where: { email: 'admin@supplymax.com' }
  });

  const users = [
    {
      name: 'Admin Supplymax',
      email: 'admin@supplymax.app',
      password: '123Suppli',
      role_id: 'Admin',
      status: 'Active'
    },
    {
      name: 'Carlos Mendoza',
      email: 'influencer@supplymax.com',
      password: 'password123',
      role_id: 'Influencer',
      level: 'Plata',
      tokens: 2450,
      affiliate_code: 'MENDOZA5',
      is_featured: true,
      image: '/logo.jpg'
    },
    {
      name: 'Maria Coach',
      email: 'coach@supplymax.com',
      password: 'coachpassword',
      role_id: 'Coach',
      sub_level: 'Oro',
      status: 'Active',
      is_featured: true,
      image: '/logo.jpg'
    }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: u,
      create: u
    });
  }

  console.log('Ensuring settings exist...');
  const settings = [
    { key: 'coach_silver_discount', value: '10' },
    { key: 'coach_gold_discount', value: '15' },
    { key: 'affiliate_commission', value: '5' }
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: s,
      create: s
    });
  }

  console.log('Seeding reviews...');
  const seededProducts = await prisma.product.findMany();
  const seededUsers = await prisma.user.findMany();
  
  const reviewsData = [
    {
      comment: "Excelente calidad de la proteína, se disuelve súper rápido y el sabor Vainilla es increíble.",
      rating: 5,
      isVerified: true,
    },
    {
      comment: "La creatina me ha ayudado muchísimo con mi fuerza. La disolución es perfecta.",
      rating: 5,
      isVerified: true,
    },
    {
      comment: "El diseño oversized de la camiseta queda espectacular. Tela de gran calidad y muy fresca.",
      rating: 5,
      isVerified: true,
    },
    {
      comment: "El bolso es muy espacioso, cabe todo el equipo del gimnasio y los compartimentos son súper útiles.",
      rating: 5,
      isVerified: true,
    }
  ];

  for (let i = 0; i < seededProducts.length; i++) {
    const product = seededProducts[i];
    const user = seededUsers[i % seededUsers.length];
    const review = reviewsData[i % reviewsData.length];
    
    await prisma.review.create({
      data: {
        productId: product.id,
        userId: user.id,
        comment: review.comment,
        rating: review.rating,
        isVerified: review.isVerified,
      }
    });
  }

  console.log('Seed completed.');
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e: any) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
