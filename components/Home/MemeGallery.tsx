import { useEffect, useState } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { farcasterFrame } from '@farcaster/frame-wagmi-connector'
import { useMiniAppContext } from '@/hooks/use-miniapp-context'
import Image from 'next/image'

interface MemeNFT {
  id: string
  imageUrl: string
  name: string
  mintedAt: string
}

export function MemeGallery() {
  const [memes, setMemes] = useState<MemeNFT[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { actions } = useMiniAppContext()
  const { isConnected, address } = useAccount()
  const { connect } = useConnect()

  useEffect(() => {
    // This is a placeholder for fetching the user's minted memes
    // In a real implementation, you would query your smart contract or indexer
    if (isConnected) {
      setIsLoading(true)
      // Mock API call delay
      setTimeout(() => {
        // Mock data for demonstration
        setMemes([
          {
            id: '1',
            imageUrl: 'https://placehold.co/600x400/9333ea/ffffff?text=Meme+1',
            name: 'Funny Cat Meme',
            mintedAt: '2023-10-15',
          },
          {
            id: '2',
            imageUrl: 'https://placehold.co/600x400/3b82f6/ffffff?text=Meme+2',
            name: 'Coding Meme',
            mintedAt: '2023-10-16',
          },
          {
            id: '3',
            imageUrl: 'https://placehold.co/600x400/10b981/ffffff?text=Meme+3',
            name: 'Web3 Meme',
            mintedAt: '2023-10-18',
          },
        ])
        setIsLoading(false)
      }, 1500)
    } else {
      setMemes([])
      setIsLoading(false)
    }
  }, [isConnected, address])

  const shareMeme = (meme: MemeNFT) => {
    if (actions) {
      actions.composeCast({
        text: `Check out this meme I created with MemeGen! 🔥 "${meme.name}"`,
        embeds: [meme.imageUrl],
      })
    }
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 border border-dashed border-[#333] rounded-md p-6 bg-[#1a1a1a]">
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
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-pulse text-gray-400 text-5xl">🔄</div>
        <p className="text-gray-400">Loading your memes...</p>
      </div>
    )
  }

  if (memes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 border border-dashed border-[#333] rounded-md p-6 bg-[#1a1a1a]">
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
    )
  }

  return (
    <div className="flex flex-col space-y-6 py-4">
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
              <p className="text-xs text-gray-400">Minted on {meme.mintedAt}</p>
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
    </div>
  )
}
