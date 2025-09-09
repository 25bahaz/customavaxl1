# API Documentation

## `/api/isUserRegistered` Endpoint

This endpoint checks if a given Ethereum address is registered in the system.

### Request

**Method:** `POST`  
**URL:** `/api/isUserRegistered`  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "privateKey": "your-private-key-here"
}
```

**Parameters:**
- `address` (string, required): The Ethereum address to check
- `privateKey` (string, required): The private key for the address

### Response

#### Success Response (Address is registered)
**Status:** `200 OK`
```json
{
  "isRegistered": true,
  "message": "Address is registered",
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "genPrivKey": "generated-private-key",
  "privateKey": "user-private-key"
}
```

#### Error Response (Address not registered)
**Status:** `404 Not Found`
```json
{
  "error": "Address is not registered",
  "isRegistered": false,
  "message": "The provided address is not registered in the system"
}
```

#### Error Response (Invalid address format)
**Status:** `400 Bad Request`
```json
{
  "error": "Invalid Ethereum address format"
}
```

#### Error Response (Missing parameters)
**Status:** `400 Bad Request`
```json
{
  "error": "Address is required"
}
```
or
```json
{
  "error": "Private key is required"
}
```

### How it works

1. **Validation**: The endpoint first validates that both `address` and `privateKey` are provided
2. **Address Format Check**: Uses the `isValidEthereumAddress` function to ensure the address is a valid Ethereum address format
3. **Registration Check**: Calls the backend `/genPrivKey` endpoint to check if the address is registered
4. **Response**: Returns appropriate success or error responses based on the registration status

### Integration with Wallet Connection

The endpoint is integrated into the wallet connection flow in the UI:

1. When a user enters an address and clicks "Connect Wallet"
2. The system calls `/api/isUserRegistered` to verify the address is registered
3. If not registered, an error message is shown and connection is prevented
4. If registered, the wallet connection proceeds normally

### Testing

Use the provided test script to test the endpoint:

```bash
node test-isUserRegistered.js
```

Make sure both servers are running:
- Next.js dev server: `npm run dev` (localhost:3000)
- Backend server: running on localhost:8000

### Error Handling

The endpoint handles various error scenarios:
- Invalid Ethereum address format
- Missing required parameters
- Backend server unavailable
- Address not registered in the system
- Network connectivity issues

All errors return appropriate HTTP status codes and descriptive error messages.
