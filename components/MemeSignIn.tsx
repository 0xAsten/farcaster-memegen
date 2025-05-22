import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { useAuthSignature } from '../hooks/useAuthSignature'
import { parseEther } from 'viem'

// This should be imported from a constants file
const MEME_AUTH_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_MEME_AUTH_ADDRESS || ''
const MEME_AUTH_ABI = [
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'serverSignature',
        type: 'bytes',
      },
    ],
    name: 'signIn',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getNonce',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'lastSignInTime',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'userXP',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]

export default function MemeSignIn() {
  const { address, isConnecting, isDisconnected } = useAccount()
  const {
    signature,
    loading: signatureLoading,
    error: signatureError,
    getSignature,
  } = useAuthSignature()
  const [signInStatus, setSignInStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [canSignIn, setCanSignIn] = useState<boolean>(false)
  const [timeUntilNextSignIn, setTimeUntilNextSignIn] = useState<string | null>(
    null,
  )

  // Read user's nonce from the contract
  const { data: nonce } = useReadContract({
    address: address
      ? (MEME_AUTH_CONTRACT_ADDRESS as `0x${string}`)
      : undefined,
    abi: MEME_AUTH_ABI,
    functionName: 'getNonce',
    args: address ? [address] : undefined,
  })

  // Read user's last sign-in time
  const { data: lastSignInTime } = useReadContract({
    address: address
      ? (MEME_AUTH_CONTRACT_ADDRESS as `0x${string}`)
      : undefined,
    abi: MEME_AUTH_ABI,
    functionName: 'lastSignInTime',
    args: address ? [address] : undefined,
  })

  // Read user's XP
  const { data: userXP } = useReadContract({
    address: address
      ? (MEME_AUTH_CONTRACT_ADDRESS as `0x${string}`)
      : undefined,
    abi: MEME_AUTH_ABI,
    functionName: 'userXP',
    args: address ? [address] : undefined,
  })

  // Setup contract write
  const { writeContractAsync, isPending } = useWriteContract()

  // Check if user can sign in (once per day)
  useEffect(() => {
    if (!lastSignInTime || !address) return

    const now = Math.floor(Date.now() / 1000)
    const dayInSeconds = 12 * 60 * 60 // 12 hours as defined in the contract
    const nextSignInTime = Number(lastSignInTime) + dayInSeconds

    if (now >= nextSignInTime) {
      setCanSignIn(true)
      setTimeUntilNextSignIn(null)
    } else {
      setCanSignIn(false)

      // Calculate time until next sign-in
      const remainingSeconds = nextSignInTime - now
      const hours = Math.floor(remainingSeconds / 3600)
      const minutes = Math.floor((remainingSeconds % 3600) / 60)
      const seconds = remainingSeconds % 60

      setTimeUntilNextSignIn(`${hours}h ${minutes}m ${seconds}s`)

      // Update the timer every second
      const timer = setInterval(() => {
        const currentTime = Math.floor(Date.now() / 1000)
        const remaining = nextSignInTime - currentTime

        if (remaining <= 0) {
          setCanSignIn(true)
          setTimeUntilNextSignIn(null)
          clearInterval(timer)
        } else {
          const h = Math.floor(remaining / 3600)
          const m = Math.floor((remaining % 3600) / 60)
          const s = remaining % 60
          setTimeUntilNextSignIn(`${h}h ${m}m ${s}s`)
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [lastSignInTime, address])

  const handleSignIn = async () => {
    if (!address || !nonce || signInStatus === 'loading' || isPending) return

    setSignInStatus('loading')
    setErrorMessage(null)

    try {
      // Get the signature from the server
      const serverSignature = await getSignature(
        MEME_AUTH_CONTRACT_ADDRESS,
        Number(nonce),
      )

      if (!serverSignature) {
        throw new Error('Failed to get signature')
      }

      // Call the signIn function on the contract
      await writeContractAsync({
        address: MEME_AUTH_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEME_AUTH_ABI,
        functionName: 'signIn',
        args: [serverSignature],
      })

      setSignInStatus('success')
    } catch (error) {
      console.error('Sign-in error:', error)
      setSignInStatus('error')
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to sign in',
      )
    }
  }

  if (isDisconnected) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        Please connect your wallet to sign in
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Daily Sign-In</h2>

      <div className="mb-4 bg-blue-50 p-3 rounded-md">
        <p className="text-blue-700 font-medium">
          Your XP:{' '}
          <span className="font-bold">
            {userXP ? Number(userXP).toLocaleString() : '0'}
          </span>
        </p>
      </div>

      {timeUntilNextSignIn ? (
        <div className="mb-4">
          <p className="text-gray-600">
            You can sign in again in:{' '}
            <span className="font-medium">{timeUntilNextSignIn}</span>
          </p>
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-green-600 font-medium">
            You can sign in now to earn XP!
          </p>
        </div>
      )}

      <button
        onClick={handleSignIn}
        disabled={
          !canSignIn ||
          signInStatus === 'loading' ||
          isPending ||
          signatureLoading
        }
        className={`w-full py-2 px-4 rounded-md font-medium transition ${
          canSignIn &&
          signInStatus !== 'loading' &&
          !isPending &&
          !signatureLoading
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {signInStatus === 'loading' || isPending || signatureLoading
          ? 'Signing in...'
          : signInStatus === 'success'
          ? 'Successfully signed in!'
          : 'Sign In'}
      </button>

      {signInStatus === 'error' && errorMessage && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {errorMessage}
        </div>
      )}

      {signInStatus === 'success' && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
          Successfully signed in! You earned 100 XP.
        </div>
      )}
    </div>
  )
}
