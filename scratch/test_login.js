async function runTest() {
  const credentials = {
    email: 'admin@supplymax.app',
    password: '123Suppli'
  };

  console.log('Sending login request to http://localhost:3000/api/auth/login with credentials:', credentials);

  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });

    console.log('Response status:', res.status);
    const data = await res.json();
    console.log('Response body:', JSON.stringify(data, null, 2));

    if (res.ok && data.role_id === 'Admin') {
      console.log('✔ Login check successful! User authenticated as Admin.');
    } else {
      console.log('❌ Login check failed!');
    }
  } catch (error) {
    console.error('Network or fetch error:', error);
  }
}

// Wait a second to let the server load
setTimeout(runTest, 1000);
