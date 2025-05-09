import { useState } from 'react'
import { APP_URL } from '@/lib/constants'
import { useMiniAppContext } from '@/hooks/use-miniapp-context'
import { useAccount, useConnect } from 'wagmi'
import { farcasterFrame } from '@farcaster/frame-wagmi-connector'
import { monadTestnet } from 'viem/chains'
import { useSwitchChain } from 'wagmi'
import Image from 'next/image'

export function MemeGenerator() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isMinting, setIsMinting] = useState(false)
  const { context, actions, isEthProviderAvailable } = useMiniAppContext()
  const { isConnected, address, chainId } = useAccount()
  const { connect } = useConnect()
  const { switchChain } = useSwitchChain()

  const generateMeme = async () => {
    if (!prompt) return

    setIsGenerating(true)

    // This is a placeholder for the actual API call to generate a meme
    // In a real implementation, you would call your image generation API
    setTimeout(() => {
      // For demo purposes, we're using a placeholder image
      setGeneratedImage(
        'https://placehold.co/600x400/9333ea/ffffff?text=Generated+Meme',
      )
      setIsGenerating(false)
    }, 2000)
  }

  const mintMeme = async () => {
    if (!isConnected) {
      connect({ connector: farcasterFrame() })
      return
    }

    if (chainId !== monadTestnet.id) {
      switchChain({ chainId: monadTestnet.id })
      return
    }

    setIsMinting(true)

    // This is a placeholder for the actual minting code
    // In a real implementation, you would call your smart contract
    setTimeout(() => {
      setIsMinting(false)
      // Mock success
      alert('Meme minted successfully!')
    }, 2000)
  }

  const shareToFarcaster = () => {
    if (actions && generatedImage) {
      actions.composeCast({
        text: 'I just created this meme with MemeGen! 🔥',
        embeds: [generatedImage],
      })
    }
  }

  return (
    <div className="flex flex-col space-y-6 py-4">
      {/* Prompt Input */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white">Create your meme</h2>
        <p className="text-gray-400 text-sm">
          Describe the meme you want to create and we&apos;ll generate it for
          you.
        </p>
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 bg-[#222] border border-[#333] rounded-md p-3 text-white placeholder-gray-500"
            placeholder="E.g., A cat wearing sunglasses coding on a laptop"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={generateMeme}
            disabled={isGenerating || !prompt}
            className={`px-4 py-2 rounded-md font-medium ${
              isGenerating || !prompt
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Generated Image Display */}
      {generatedImage && (
        <div className="space-y-4">
          <div className="border border-[#333] rounded-md overflow-hidden bg-[#222] flex justify-center items-center p-4">
            <Image
              src={generatedImage}
              alt="Generated Meme"
              width={600}
              height={400}
              className="max-w-full rounded-md"
              style={{ height: 'auto', maxHeight: '400px' }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={mintMeme}
              disabled={isMinting}
              className={`flex-1 py-2 rounded-md font-medium ${
                isMinting
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isMinting
                ? 'Minting...'
                : isConnected
                ? 'Mint as NFT'
                : 'Connect Wallet to Mint'}
            </button>
            <button
              onClick={shareToFarcaster}
              className="flex-1 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700"
            >
              Share to Farcaster
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!generatedImage && !isGenerating && (
        <div className="border border-dashed border-[#333] rounded-md p-6 flex flex-col items-center justify-center space-y-3 bg-[#1a1a1a]">
          <div className="text-gray-400 text-5xl">🖼️</div>
          <p className="text-gray-400 text-center max-w-md">
            Enter a prompt and click Generate to create your custom meme
          </p>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="border border-[#333] rounded-md p-6 flex flex-col items-center justify-center space-y-3 bg-[#1a1a1a]">
          <div className="animate-pulse text-gray-400 text-5xl">🔄</div>
          <p className="text-gray-400 text-center">
            Generating your awesome meme...
          </p>
        </div>
      )}
    </div>
  )
}
