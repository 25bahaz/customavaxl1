import { NextRequest, NextResponse } from 'next/server'
import { isValidEthereumAddress } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, privateKey } = body

    // Validate required fields
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      )
    }

    if (!privateKey) {
      return NextResponse.json(
        { error: 'Private key is required' },
        { status: 400 }
      )
    }

    // Validate Ethereum address format
    if (!isValidEthereumAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      )
    }

    // Check if the address is registered by calling the backend
    try {
      // First, get the private key using the /genPrivKey endpoint
      const genPrivKeyResponse = await fetch('http://localhost:8000/genPrivKey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ useraddress: address }),
      })

      if (!genPrivKeyResponse.ok) {
        // If genPrivKey fails, the address is not registered
        return NextResponse.json(
          { 
            error: 'Address is not registered',
            isRegistered: false,
            message: 'The provided address is not registered in the system'
          },
          { status: 404 }
        )
      }

      const genPrivKeyData = await genPrivKeyResponse.json()
      
      // If we successfully get a private key, the address is registered
      return NextResponse.json({
        isRegistered: true,
        message: 'Address is registered',
        address: address,
        genPrivKey: genPrivKeyData.genPriv,
        privateKey: genPrivKeyData.privateKey
      })

    } catch (backendError) {
      console.error('Backend error:', backendError)
      
      // If there's an error connecting to the backend, assume not registered
      return NextResponse.json(
        { 
          error: 'Address is not registered',
          isRegistered: false,
          message: 'Unable to verify registration status'
        },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Error in isUserRegistered:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST instead.' },
    { status: 405 }
  )
}
