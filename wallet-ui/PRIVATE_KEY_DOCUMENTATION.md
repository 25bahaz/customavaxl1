# Private Key Management Documentation

## Overview

This document explains how to get private keys from the backend `/genPrivKey` endpoint and how to use the utility functions provided.

## Backend Endpoint

### `/genPrivKey` Endpoint

**URL:** `http://localhost:8000/genPrivKey`  
**Method:** `POST`  
**Content-Type:** `application/json`

#### Request Body
```json
{
  "useraddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
}
```

#### Response
```json
{
  "genPriv": "generated-private-key-string",
  "privateKey": "user-private-key-string"
}
```

## Frontend Implementation

### 1. Direct Usage in Components

```typescript
const getPrivateKey = async (userAddress: string) => {
  try {
    const response = await fetch('http://localhost:8000/genPrivKey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ useraddress: userAddress }),
    });

    if (!response.ok) {
      throw new Error('Failed to get private key');
    }

    const data = await response.json();
    return {
      success: true,
      genPrivKey: data.genPriv,
      privateKey: data.privateKey,
      data: data
    };
  } catch (error) {
    console.error('Error getting private key:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get private key'
    };
  }
};
```

### 2. Using the Utility Functions

Import the utility functions from `lib/privateKeyUtils.ts`:

```typescript
import { getPrivateKey, getPrivateKeyWithCallbacks } from '@/lib/privateKeyUtils';

// Method 1: Direct usage
const result = await getPrivateKey("0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6");
if (result.success) {
  console.log('Private Key:', result.privateKey);
  console.log('Generated Private Key:', result.genPrivKey);
} else {
  console.error('Error:', result.error);
}

// Method 2: With callbacks
await getPrivateKeyWithCallbacks(
  "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  (data) => {
    console.log('Success! Private key retrieved:', data.privateKey);
  },
  (error) => {
    console.error('Failed to get private key:', error);
  }
);
```

## Current Usage in Wallet Page

The private key functionality is currently used in the wallet page for:

### 1. Balance Visibility Toggle
When a user clicks "Reveal Balance", the system:
1. Calls `getPrivateKey(address)` to get the private key
2. Uses the private key to decrypt the balance via `/decrypt` endpoint
3. Displays the decrypted balance

### 2. User Registration Check
The `/isUserRegistered` endpoint uses the `/genPrivKey` endpoint internally to verify if a user is registered.

## Error Handling

The implementation handles various error scenarios:

- **Network errors**: Connection issues with the backend
- **HTTP errors**: Non-200 status codes from the backend
- **Invalid addresses**: Addresses that are not registered
- **Backend unavailable**: When the backend server is down

## Testing

### Test Script
Use the provided test script to test the endpoint:

```bash
node test-genPrivKey.js
```

### Manual Testing
You can also test manually using curl:

```bash
curl -X POST http://localhost:8000/genPrivKey \
  -H "Content-Type: application/json" \
  -d '{"useraddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"}'
```

## Security Considerations

1. **Private keys are sensitive**: Never log or expose private keys in production
2. **HTTPS in production**: Always use HTTPS for private key requests in production
3. **Error messages**: Don't expose sensitive information in error messages
4. **Validation**: Always validate addresses before making requests

## Integration Examples

### Example 1: Getting Private Key for Balance Decryption
```typescript
const revealBalance = async (userAddress: string) => {
  const privateKeyResult = await getPrivateKey(userAddress);
  
  if (!privateKeyResult.success) {
    throw new Error(privateKeyResult.error);
  }
  
  // Use the private key to decrypt balance
  const balanceResponse = await fetch('http://localhost:8000/decrypt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      userAddress, 
      genPrivKey: privateKeyResult.genPrivKey,
      secret: privateKeyResult.privateKey 
    }),
  });
  
  return balanceResponse.json();
};
```

### Example 2: Checking User Registration
```typescript
const checkRegistration = async (userAddress: string) => {
  const privateKeyResult = await getPrivateKey(userAddress);
  
  if (privateKeyResult.success) {
    return { isRegistered: true, privateKey: privateKeyResult.privateKey };
  } else {
    return { isRegistered: false, error: privateKeyResult.error };
  }
};
```

## Troubleshooting

### Common Issues

1. **"Failed to get private key"**: Usually means the address is not registered
2. **Network errors**: Check if the backend server is running on localhost:8000
3. **CORS issues**: Make sure the backend allows requests from your frontend domain
4. **Invalid address format**: Ensure the address is a valid Ethereum address

### Debug Steps

1. Check if the backend server is running: `curl http://localhost:8000/health`
2. Verify the address format is correct
3. Check browser network tab for request/response details
4. Look at backend logs for any error messages
