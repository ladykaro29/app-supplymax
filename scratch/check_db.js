const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany();
    console.log('=== USERS IN DATABASE ===');
    console.log(JSON.stringify(users, null, 2));
    
    const admin = users.find(u => u.role_id === 'Admin');
    if (admin) {
      console.log('✔ Found Admin User:', admin.email);
    } else {
      console.log('❌ NO Admin user found in the database!');
    }
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
