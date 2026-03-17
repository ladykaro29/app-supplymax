import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = [
    {
      name: "Pure Whey Impact 5lb",
      category: "Proteínas",
      goal: "MÁS VENDIDO",
      price: 65.00,
      image: "/protein.png",
      description: "Proteína de suero de alta calidad para máxima recuperación muscular.",
      durationInDays: 30
    },
    {
      name: "Creatine Micronized 300g",
      category: "Creatinas",
      goal: "OFERTA",
      price: 35.00,
      image: "/creatine.png",
      description: "Creatina monohidratada pura para aumento de fuerza y potencia.",
      durationInDays: 60
    },
    {
      name: "Elite Amino Recovery",
      category: "Aminoácidos/BCAA",
      goal: "RECUPERACIÓN",
      price: 29.99,
      image: "/amino.png",
      description: "BCAA premium para evitar el catabolismo.",
      durationInDays: 45
    },
    {
      name: "Pre-Workout Nitro",
      category: "Pre-Entrenos",
      goal: "ENERGÍA",
      price: 45.00,
      image: "/pre-workout.png",
      description: "Explosión de energía para tus entrenamientos más pesados.",
      durationInDays: 20
    }
  ]

  console.log('Seeding products...')
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: products.indexOf(p) + 1 },
      update: {},
      create: p,
    })
  }

  // Create a mock Influencer
  await prisma.user.upsert({
    where: { email: 'influencer@supplymax.com' },
    update: {},
    create: {
      name: 'Carlos Mendoza',
      email: 'influencer@supplymax.com',
      password: 'password123', // In a real app, hash this
      role: 'Influencer',
      level: 'Plata',
      tokens: 2450,
      influencerCode: 'MENDOZA5'
    }
  })

  console.log('Seed completed.')
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
