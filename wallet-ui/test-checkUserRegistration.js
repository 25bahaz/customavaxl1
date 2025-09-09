// Test script for the updated checkUserRegistration function
// Run this with: node test-checkUserRegistration.js

const testAddresses = [
  {
    address: "0x4839892f181bcdAC92139F5a624EF5d77b9D5e69",
    description: "Valid registered address (should return private key)"
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

async function testCheckUserRegistration(address, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`📍 Address: ${address}`);
  
  try {
    // This simulates the checkUserRegistration function
    const response = await fetch('http://localhost:8000/genPrivKey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ useraddress: address }),
    });

    const data = await response.json();
    if (!data.privateKey) {
      // If genPrivKey fails, the address is not registered
      console.log(`📊 Status: ${response.status}`);
      console.log(`❌ User NOT registered: Address is not registered in the system`);
      return;
    }

    
    console.log(`📊 Status: ${response.status}`);
    console.log(`✅ User IS registered!`);
    console.log(`🔑 Private Key: ${data.privateKey}`);
    console.log(`🔐 Generated Private Key: ${data.genPriv}`);
    console.log(`📄 Full Response:`, JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.log(`💥 Network Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting checkUserRegistration tests...');
  console.log('📝 Note: Make sure your backend server is running on localhost:8000');
  console.log('📝 This function now returns the private key when user is registered!');
  
  for (const test of testAddresses) {
    await testCheckUserRegistration(test.address, test.description);
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🏁 Tests completed!');
  console.log('\n💡 Key Points:');
  console.log('   - If user is registered: Returns private key data');
  console.log('   - If user is NOT registered: Returns error message');
  console.log('   - Private key is available in registrationCheck.privateKey');
  console.log('   - Generated private key is available in registrationCheck.genPrivKey');
}

// Run the tests
runTests().catch(console.error);
