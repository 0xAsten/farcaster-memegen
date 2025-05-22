import { useState, useEffect, useCallback } from 'react'
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnect,
  useSwitchChain,
} from 'wagmi'
import { useAuthSignature } from '../hooks/useAuthSignature'
import { farcasterFrame } from '@farcaster/frame-wagmi-connector'
import { monadTestnet } from 'viem/chains'

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
  const { address, isConnecting, isDisconnected, isConnected, chainId } =
    useAccount()
  const { connect } = useConnect()
  const { switchChain } = useSwitchChain()
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
  const [txHash, setTxHash] = useState<string | null>(null)

  // Read user's nonce from the contract
  const { data: nonce, refetch: refetchNonce } = useReadContract({
    address: address
      ? (MEME_AUTH_CONTRACT_ADDRESS as `0x${string}`)
      : undefined,
    abi: MEME_AUTH_ABI,
    functionName: 'getNonce',
    args: address ? [address] : undefined,
  })

  // Read user's last sign-in time
  const { data: lastSignInTime, refetch: refetchLastSignInTime } =
    useReadContract({
      address: address
        ? (MEME_AUTH_CONTRACT_ADDRESS as `0x${string}`)
        : undefined,
      abi: MEME_AUTH_ABI,
      functionName: 'lastSignInTime',
      args: address ? [address] : undefined,
    })

  // Read user's XP
  const { data: userXP, refetch: refetchUserXP } = useReadContract({
    address: address
      ? (MEME_AUTH_CONTRACT_ADDRESS as `0x${string}`)
      : undefined,
    abi: MEME_AUTH_ABI,
    functionName: 'userXP',
    args: address ? [address] : undefined,
  })

  // Setup contract write
  const { data: hash, writeContract, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    })

  useEffect(() => {
    if (hash) {
      setTxHash(hash)
    }
  }, [hash])

  useEffect(() => {
    if (isConfirmed) {
      setSignInStatus('success')
      setTxHash(null)

      // Refetch contract data after successful sign-in
      refetchNonce?.()
      refetchLastSignInTime?.()
      refetchUserXP?.()
    }
  }, [isConfirmed, refetchNonce, refetchLastSignInTime, refetchUserXP])

  // Check if user can sign in (once per day)
  useEffect(() => {
    if (!address || lastSignInTime === undefined || lastSignInTime === null)
      return

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

  const signInTx = useCallback(
    (serverSignature: string) => {
      writeContract({
        address: MEME_AUTH_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEME_AUTH_ABI,
        functionName: 'signIn',
        args: [serverSignature],
      })
    },
    [writeContract],
  )

  const handleSignIn = async () => {
    if (!isConnected) {
      connect({ connector: farcasterFrame() })
      return
    }

    if (chainId !== monadTestnet.id) {
      switchChain({ chainId: monadTestnet.id })
      return
    }

    if (
      !address ||
      nonce === undefined ||
      nonce === null ||
      signInStatus === 'loading' ||
      isPending
    )
      return

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
      signInTx(serverSignature)
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
      <div className="p-3 bg-[#222] text-gray-300 rounded-lg border border-[#333] text-sm">
        Please connect your wallet to sign in
      </div>
    )
  }

  return (
    <div className="p-4 bg-[#222] rounded-lg shadow-lg border border-[#333]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-white flex items-center">
          <span className="mr-2">Daily Sign-In</span>
          <span className="text-xs bg-purple-700 text-white px-2 py-0.5 rounded-full">
            Earn XP
          </span>
        </h2>

        <div className="text-purple-400 text-sm">
          XP:{' '}
          <span className="font-bold text-white">
            {userXP ? Number(userXP).toLocaleString() : '0'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs">
          {timeUntilNextSignIn ? (
            <p className="text-gray-400">
              Next in:{' '}
              <span className="font-medium text-white">
                {timeUntilNextSignIn}
              </span>
            </p>
          ) : (
            <p className="text-green-400 font-medium">Ready to earn XP!</p>
          )}
        </div>

        <button
          onClick={handleSignIn}
          disabled={
            !canSignIn ||
            signInStatus === 'loading' ||
            isPending ||
            signatureLoading ||
            isConfirming
          }
          className={`py-1 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            canSignIn &&
            signInStatus !== 'loading' &&
            !isPending &&
            !signatureLoading
              ? 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg'
              : 'bg-[#444] text-gray-500 cursor-not-allowed'
          }`}
        >
          {signInStatus === 'loading' ||
          isPending ||
          signatureLoading ||
          isConfirming
            ? 'Signing in...'
            : 'Sign In'}
        </button>
      </div>

      {signInStatus === 'error' && errorMessage && (
        <div className="mt-2 p-2 bg-[#3a0000] text-red-400 rounded-md border border-red-800 text-xs">
          {errorMessage}
        </div>
      )}
    </div>
  )
}
