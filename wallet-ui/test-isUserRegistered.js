// Test script for the /isUserRegistered endpoint
// Run this with: node test-isUserRegistered.js

const testAddresses = [
  {
    address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    privateKey: "test-private-key-123",
    description: "Valid Ethereum address (should check registration)"
  },
  {
    address: "0x1234567890123456789012345678901234567890",
    privateKey: "test-private-key-456", 
    description: "Another valid Ethereum address"
  },
  {
    address: "invalid-address",
    privateKey: "test-private-key-789",
    description: "Invalid address format (should return 400)"
  },
  {
    address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    privateKey: "",
    description: "Missing private key (should return 400)"
  }
];

async function testIsUserRegistered(address, privateKey, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`📍 Address: ${address}`);
  console.log(`🔑 Private Key: ${privateKey || '(empty)'}`);
  
  try {
    const response = await fetch('http://localhost:3000/api/isUserRegistered', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address, privateKey }),
    });

    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log(`✅ Success: ${data.message}`);
    } else {
      console.log(`❌ Error: ${data.error}`);
    }
    
  } catch (error) {
    console.log(`💥 Network Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting /isUserRegistered endpoint tests...');
  console.log('📝 Note: Make sure your Next.js dev server is running on localhost:3000');
  console.log('📝 Note: Make sure your backend server is running on localhost:8000');
  
  for (const test of testAddresses) {
    await testIsUserRegistered(test.address, test.privateKey, test.description);
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🏁 Tests completed!');
}

// Run the tests
runTests().catch(console.error);
