import { useState } from 'react'
import { useAccount } from 'wagmi'

interface SignatureResult {
  signature: string | null
  loading: boolean
  error: string | null
  getSignature: (
    contractAddress: string,
    nonce: number,
  ) => Promise<string | null>
}

export function useAuthSignature(): SignatureResult {
  const [signature, setSignature] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { address } = useAccount()

  const getSignature = async (
    contractAddress: string,
    nonce: number,
  ): Promise<string | null> => {
    if (!address) {
      setError('Wallet not connected')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/sign-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          nonce,
          contractAddress,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get signature')
      }

      setSignature(data.signature)
      return data.signature
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { signature, loading, error, getSignature }
}
