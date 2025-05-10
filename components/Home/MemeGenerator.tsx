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
  const [imageError, setImageError] = useState<string | null>(null)
  const [isMinting, setIsMinting] = useState(false)
  const [aiMessage, setAiMessage] = useState<string | null>(null)
  const { context, actions, isEthProviderAvailable } = useMiniAppContext()
  const { isConnected, address, chainId } = useAccount()
  const { connect } = useConnect()
  const { switchChain } = useSwitchChain()

  const generateMeme = async () => {
    if (!prompt) return

    setIsGenerating(true)
    setImageError(null)
    setGeneratedImage(null)
    setAiMessage(null)

    try {
      // Call the meme generation API
      const response = await fetch('/api/generate-meme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success || !data.memeUrl) {
        throw new Error('Failed to generate meme')
      }

      setGeneratedImage(data.memeUrl)
      setAiMessage(data.message)
    } catch (error) {
      console.error('Error generating meme:', error)
      setImageError(
        `Failed to generate meme: ${
          (error as Error).message
        }. Please try again.`,
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleImageError = () => {
    setImageError(
      'The generated image is invalid. Please try again with a different prompt.',
    )
    setGeneratedImage(null)
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
        text: `I just created this meme with MemeGen! 🔥 "${prompt}"`,
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

      {/* Error Message */}
      {imageError && (
        <div className="border border-red-500 bg-red-900/20 rounded-md p-4 text-red-300 text-sm">
          {imageError}
          <button
            className="block mt-2 text-white bg-red-600 hover:bg-red-700 px-4 py-1 rounded-md text-xs"
            onClick={generateMeme}
          >
            Try Again
          </button>
        </div>
      )}

      {/* AI Message */}
      {aiMessage && (
        <div className="border border-[#333] rounded-md p-4 bg-[#1a1a1a] text-gray-300 text-sm">
          <p className="text-gray-400 font-medium mb-1">AIs thoughts:</p>
          <p>{aiMessage}</p>
        </div>
      )}

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
              onError={handleImageError}
              priority
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
      {!generatedImage && !isGenerating && !imageError && (
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
