import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning existing data...');
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.verificationToken.deleteMany();

  console.log('Seeding products...');
  const products = [
    {
      name: "Pure Whey Impact 5lb",
      category: "Proteínas",
      goal: "MÁS VENDIDO",
      price: 65.00,
      image: "/protein.png",
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
      goal: "OFERTA",
      price: 35.00,
      image: "/creatine.png",
      description: "Creatina monohidratada pura para aumento de fuerza y potencia.",
      isOffer: true,
      discount: 10,
      weight: "300g",
      durationInDays: "60"
    },
    {
      name: "Elite Amino Recovery",
      category: "Aminoácidos/BCAA",
      goal: "RECUPERACIÓN",
      price: 29.99,
      image: "/amino.png",
      description: "BCAA premium para evitar el catabolismo.",
      weight: "400g",
      durationInDays: "45"
    },
    {
      name: "Pre-Workout Nitro",
      category: "Pre-Entrenos",
      goal: "ENERGÍA",
      price: 45.00,
      image: "/pre-workout.png",
      description: "Explosión de energía para tus entrenamientos más pesados.",
      portions: "30",
      flavor: "Fruit Punch",
      durationInDays: "30"
    },
    {
      name: "SupplyMax Oversized Tee",
      category: "Ropa",
      goal: "LIFESTYLE",
      price: 25.00,
      image: "/clothing1.png",
      description: "Camiseta oversized de algodón premium para el gimnasio.",
      isFeatured: true,
      sizes: "S,M,L,XL"
    },
    {
      name: "Performance Joggers",
      category: "Ropa",
      goal: "ENTRENAMIENTO",
      price: 45.00,
      image: "/clothing2.png",
      description: "Pantalones deportivos ajustados con tecnología dry-fit.",
      isFeatured: true,
      sizes: "M,L,XL"
    }
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log('Seeding users & partners...');
  // Note: Using role_id as defined in schema.prisma
  await prisma.user.createMany({
    data: [
      {
        name: 'Admin Supplymax',
        email: 'admin@supplymax.com',
        password: 'adminpassword',
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
        image: '/partners/alex.jpg'
      },
      {
        name: 'Maria Coach',
        email: 'coach@supplymax.com',
        password: 'coachpassword',
        role_id: 'Coach',
        sub_level: 'Oro',
        status: 'Active',
        is_featured: true,
        image: '/partners/maria.jpg'
      }
    ]
  });

  console.log('Seeding settings...');
  await prisma.setting.createMany({
    data: [
      { key: 'coach_silver_discount', value: '10' },
      { key: 'coach_gold_discount', value: '15' },
      { key: 'affiliate_commission', value: '5' }
    ]
  });

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
