'use client'

import { useAccount, useConnect } from 'wagmi'
import { farcasterFrame } from '@farcaster/frame-wagmi-connector'
import { useMiniAppContext } from '@/hooks/use-miniapp-context'
import Image from 'next/image'
import { useUserMemes } from '@/lib/graphql/hooks'
import { MemeNFT } from '@/lib/graphql/queries'
import { useEffect, useState } from 'react'

interface MemeGalleryProps {
  isVisible?: boolean
  shouldRefetch?: boolean
  onRefetchComplete?: () => void
}

export function MemeGallery({
  isVisible = false,
  shouldRefetch = false,
  onRefetchComplete,
}: MemeGalleryProps) {
  const { actions } = useMiniAppContext()
  const { isConnected, address } = useAccount()
  const { connect } = useConnect()
  const { memes, isLoading, error, refetch } = useUserMemes(address)
  const [pollCount, setPollCount] = useState(0)

  // Effect to handle refetch when shouldRefetch prop changes
  useEffect(() => {
    if (isConnected && isVisible && shouldRefetch && refetch) {
      // Execute refetch
      refetch()
      // Reset poll count
      setPollCount(0)

      // Call onRefetchComplete to reset shouldRefetch flag in parent
      if (onRefetchComplete) {
        // Use setTimeout to break the render cycle
        setTimeout(() => {
          onRefetchComplete()
        }, 0)
      }
    }
  }, [isConnected, isVisible, shouldRefetch, refetch, onRefetchComplete])

  const shareMeme = (meme: MemeNFT) => {
    if (actions) {
      actions.composeCast({
        text: `Check out this meme I created with Meme AI Assistant! 🔥 "${meme.name}"`,
        embeds: [meme.imageUrl],
      })
    }
  }

  return (
    <div className="flex flex-col space-y-6 py-4">
      {!isConnected && (
        <div className="border border-dashed border-[#333] rounded-md p-6 flex flex-col items-center justify-center space-y-4 bg-[#1a1a1a]">
          <div className="text-gray-400 text-5xl">🔒</div>
          <p className="text-gray-400 text-center">
            Connect your wallet to view your minted memes
          </p>
          <button
            onClick={() => connect({ connector: farcasterFrame() })}
            className="px-4 py-2 rounded-md font-medium bg-purple-600 text-white hover:bg-purple-700"
          >
            Connect Wallet
          </button>
        </div>
      )}

      {isConnected && isLoading && (
        <div className="border border-[#333] rounded-md p-6 flex flex-col items-center justify-center space-y-3 bg-[#1a1a1a]">
          <div className="animate-pulse text-gray-400 text-5xl">🔄</div>
          <p className="text-gray-400 text-center">Loading your memes...</p>
        </div>
      )}

      {isConnected && error && (
        <div className="border border-dashed border-[#333] rounded-md p-6 flex flex-col items-center justify-center space-y-4 bg-[#1a1a1a]">
          <div className="text-gray-400 text-5xl">⚠️</div>
          <p className="text-gray-400 text-center">
            Error loading your memes. Please try again later.
          </p>
        </div>
      )}

      {isConnected && !isLoading && !error && memes.length === 0 && (
        <div className="border border-dashed border-[#333] rounded-md p-6 flex flex-col items-center justify-center space-y-4 bg-[#1a1a1a]">
          <div className="text-gray-400 text-5xl">📭</div>
          <p className="text-gray-400 text-center">
            You haven&apos;t minted any memes yet
          </p>
          <button
            onClick={() => {
              document
                .querySelector("[data-tab='create']")
                ?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
            }}
            className="px-4 py-2 rounded-md font-medium bg-purple-600 text-white hover:bg-purple-700"
          >
            Create Your First Meme
          </button>
        </div>
      )}

      {isConnected && !isLoading && !error && memes.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Your Minted Memes</h2>
            <span className="text-sm text-gray-400">{memes.length} memes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memes.map((meme) => (
              <div
                key={meme.id}
                className="border border-[#333] rounded-md overflow-hidden bg-[#222] flex flex-col"
              >
                <div className="flex justify-center items-center p-4">
                  <Image
                    src={meme.imageUrl}
                    alt={meme.name}
                    width={600}
                    height={400}
                    className="max-w-full rounded-md"
                    style={{ height: 'auto', maxHeight: '200px' }}
                  />
                </div>
                <div className="p-4 border-t border-[#333] flex flex-col space-y-2">
                  <h3 className="text-white font-medium">{meme.name}</h3>
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => shareMeme(meme)}
                      className="flex-1 py-2 text-xs rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Share to Farcaster
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
