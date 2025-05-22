import { NextRequest, NextResponse } from 'next/server'

import { encodePacked, keccak256, toHex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

// This should be stored in an environment variable in production
const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY

export async function POST(request: NextRequest) {
  try {
    const { userAddress, nonce, contractAddress } = await request.json()

    // Validate input
    if (
      !userAddress ||
      nonce === undefined ||
      nonce === null ||
      !contractAddress
    ) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      )
    }

    if (!SERVER_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 },
      )
    }

    // First create the inner hash (matches the contract's inner hash)
    const packedData = encodePacked(
      ['address', 'uint256', 'address'],
      [userAddress, nonce, contractAddress],
    )
    const innerHash = keccak256(packedData)

    // Create the message to sign - this matches the contract's verification logic
    // The contract expects a signature of the Ethereum signed message
    const wallet = privateKeyToAccount(SERVER_PRIVATE_KEY as `0x${string}`)

    // Use signMessage which automatically prepends the Ethereum prefix
    // This matches how the contract recovers the signer
    const signature = await wallet.signMessage({
      message: { raw: innerHash },
    })

    return NextResponse.json({ signature })
  } catch (error) {
    console.error('Error signing message:', error)
    return NextResponse.json(
      { error: 'Failed to sign message' },
      { status: 500 },
    )
  }
}
