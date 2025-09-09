/**
 * Utility functions for handling private key operations
 */

export interface PrivateKeyResponse {
  success: boolean;
  genPrivKey?: string;
  privateKey?: string;
  data?: any;
  error?: string;
}

export interface RegistrationCheckResponse {
  isRegistered: boolean;
  message?: string;
  address?: string;
  genPrivKey?: string;
  privateKey?: string;
  data?: any;
  error?: string;
}

/**
 * Gets the private key for a given user address from the backend
 * @param userAddress - The Ethereum address of the user
 * @returns Promise<PrivateKeyResponse> - The response containing the private key data
 */
export async function getPrivateKey(userAddress: string): Promise<PrivateKeyResponse> {
  try {
    const response = await fetch('http://localhost:8000/genPrivKey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ useraddress: userAddress }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
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
}

/**
 * Checks if a user is registered and returns the private key if they are
 * @param userAddress - The Ethereum address of the user
 * @returns Promise<RegistrationCheckResponse> - The response containing registration status and private key
 */
export async function checkUserRegistration(userAddress: string): Promise<RegistrationCheckResponse> {
  try {
    const response = await fetch('http://localhost:8000/genPrivKey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ useraddress: userAddress }),
    });

    if (!response.ok) {
      // If genPrivKey fails, the address is not registered
      return { 
        isRegistered: false, 
        error: 'Address is not registered in the system' 
      };
    }

    const data = await response.json();
    
    // If we successfully get a private key, the address is registered
    return {
      isRegistered: true,
      message: 'Address is registered',
      address: userAddress,
      genPrivKey: data.genPriv,
      privateKey: data.privateKey,
      data: data
    };
  } catch (error) {
    console.error('Error checking user registration:', error);
    return { 
      isRegistered: false, 
      error: 'Failed to check registration' 
    };
  }
}

/**
 * Gets the private key and handles common error scenarios
 * @param userAddress - The Ethereum address of the user
 * @param onSuccess - Callback function called on success
 * @param onError - Callback function called on error
 */
export async function getPrivateKeyWithCallbacks(
  userAddress: string,
  onSuccess?: (data: PrivateKeyResponse) => void,
  onError?: (error: string) => void
): Promise<void> {
  const result = await getPrivateKey(userAddress);
  
  if (result.success) {
    onSuccess?.(result);
  } else {
    onError?.(result.error || 'Unknown error occurred');
  }
}

/**
 * Example usage function showing how to use the private key utilities
 */
export async function exampleUsage() {
  const userAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
  
  // Method 1: Check registration and get private key
  const registrationResult = await checkUserRegistration(userAddress);
  if (registrationResult.isRegistered) {
    console.log('User is registered!');
    console.log('Private Key:', registrationResult.privateKey);
    console.log('Generated Private Key:', registrationResult.genPrivKey);
  } else {
    console.error('User not registered:', registrationResult.error);
  }
  
  // Method 2: Direct private key usage
  const result = await getPrivateKey(userAddress);
  if (result.success) {
    console.log('Private Key:', result.privateKey);
    console.log('Generated Private Key:', result.genPrivKey);
  } else {
    console.error('Error:', result.error);
  }
  
  // Method 3: With callbacks
  await getPrivateKeyWithCallbacks(
    userAddress,
    (data) => {
      console.log('Success! Private key retrieved:', data.privateKey);
    },
    (error) => {
      console.error('Failed to get private key:', error);
    }
  );
}
