// Test script for the /genPrivKey endpoint
// Run this with: node test-genPrivKey.js

const testAddresses = [
  {
    address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    description: "Valid registered address"
  },
  {
    address: "0x1234567890123456789012345678901234567890",
    description: "Another test address"
  },
  {
    address: "0x0000000000000000000000000000000000000000",
    description: "Zero address (might not be registered)"
  }
];

async function testGenPrivKey(address, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`📍 Address: ${address}`);
  
  try {
    const response = await fetch('http://localhost:8000/genPrivKey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ useraddress: address }),
    });

    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log(`✅ Success!`);
      console.log(`🔑 Generated Private Key: ${data.genPriv}`);
      console.log(`🔐 User Private Key: ${data.privateKey}`);
    } else {
      console.log(`❌ Error: ${data.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.log(`💥 Network Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting /genPrivKey endpoint tests...');
  console.log('📝 Note: Make sure your backend server is running on localhost:8000');
  
  for (const test of testAddresses) {
    await testGenPrivKey(test.address, test.description);
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🏁 Tests completed!');
}

// Run the tests
runTests().catch(console.error);
