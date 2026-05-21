const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();
    console.log('Counts - Users:', userCount, 'Products:', productCount, 'Orders:', orderCount);
    
    const admin = await prisma.user.findUnique({ where: { email: 'admin@supplymax.com' } });
    console.log('Admin role_id:', admin?.role_id);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
