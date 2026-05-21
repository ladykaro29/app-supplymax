const fs = require('fs');

async function testSuite() {
  console.log('==================================================');
  console.log('🧪 RUNNING FULL ADMIN VERIFICATION SYSTEM TEST 🧪');
  console.log('==================================================\n');

  let testsPassed = 0;
  let totalTests = 0;

  async function assertEqual(actual, expected, message) {
    totalTests++;
    if (actual === expected) {
      console.log(`✅ PASS: ${message}`);
      testsPassed++;
    } else {
      console.log(`❌ FAIL: ${message} (Expected: ${expected}, Got: ${actual})`);
    }
  }

  // TEST 1: Database Seed Integrity
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@supplymax.app' }
    });
    
    await assertEqual(adminUser !== null, true, 'Admin user admin@supplymax.app exists in the database.');
    await assertEqual(adminUser.role_id, 'Admin', 'Admin user has the correct role_id = "Admin".');
    await assertEqual(adminUser.password, '123Suppli', 'Admin user has the correct password.');
    await assertEqual(adminUser.status, 'Active', 'Admin user has status = "Active".');

    const oldAdminUser = await prisma.user.findFirst({
      where: { email: 'admin@supplymax.com' }
    });
    await assertEqual(oldAdminUser, null, 'Old admin email admin@supplymax.com was deleted and does not exist.');

    await prisma.$disconnect();
  } catch (err) {
    console.error('❌ Database verification test failed:', err);
  }

  // TEST 2: API Login Authentication
  try {
    // 2a. Successful Login
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@supplymax.app', password: '123Suppli' })
    });
    
    await assertEqual(loginRes.status, 200, 'API returns HTTP 200 for correct Admin credentials.');
    const userData = await loginRes.json();
    await assertEqual(userData.role_id, 'Admin', 'API response includes role_id: "Admin" for user.');
    await assertEqual(userData.email, 'admin@supplymax.app', 'API response returns the correct email.');

    // 2b. Case-Insensitive Login Verification
    const loginResUpper = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ADMIN@SUPPLYMAX.APP', password: '123Suppli' })
    });
    await assertEqual(loginResUpper.status, 200, 'API is case-insensitive for email inputs.');

    // 2c. Invalid Password Login
    const badPassRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@supplymax.app', password: 'wrongpassword' })
    });
    await assertEqual(badPassRes.status, 401, 'API rejects wrong password with HTTP 401.');

    // 2d. Non-existent User Login
    const badEmailRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@supplymax.app', password: '123Suppli' })
    });
    await assertEqual(badEmailRes.status, 404, 'API rejects non-existent email with HTTP 404.');
  } catch (err) {
    console.error('❌ API Login test failed:', err);
  }

  // TEST 3: Admin Protected APIs
  try {
    const statsRes = await fetch('http://localhost:3000/api/admin/stats');
    await assertEqual(statsRes.status, 200, 'Admin Stats API is online and responding.');
    const statsData = await statsRes.json();
    await assertEqual(Array.isArray(statsData.orders), true, 'Admin Stats API returns orders array.');

    const remindersRes = await fetch('http://localhost:3000/api/admin/reminders');
    await assertEqual(remindersRes.status, 200, 'Admin Reminders API is online and responding.');
  } catch (err) {
    console.error('❌ Admin Protected API tests failed:', err);
  }

  console.log('\n==================================================');
  console.log(`📊 TEST RESULTS: ${testsPassed}/${totalTests} TESTS PASSED 📊`);
  console.log('==================================================');
}

testSuite();
