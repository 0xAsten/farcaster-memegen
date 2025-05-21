import { useCallback, useState, useEffect } from 'react'
import { APP_URL } from '@/lib/constants'
import { useMiniAppContext } from '@/hooks/use-miniapp-context'
import {
  useAccount,
  useConnect,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { farcasterFrame } from '@farcaster/frame-wagmi-connector'
import { monadTestnet } from 'viem/chains'
import { useSwitchChain } from 'wagmi'
import Image from 'next/image'
import { parseAbi } from 'viem'

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

  const [txHash, setTxHash] = useState<string | null>(null)
  const [txStatus, setTxStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle')
  const [txErrorMessage, setTxErrorMessage] = useState<string | null>(null)
  const {
    data: hash,
    writeContract,
    error: sendTxError,
    isError: isSendTxError,
    isPending: isSendTxPending,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    })

  const MemeNFTAbi = parseAbi([
    'function mintMeme(string memory tokenURI) public returns (uint256)',
  ])
  const mintMemeTx = useCallback(
    (memeUrl: string) => {
      writeContract({
        address: '0x36a9305Eb14906A3676F772375d59b3495dA9c1E',
        abi: MemeNFTAbi,
        functionName: 'mintMeme',
        args: [memeUrl],
      })
    },
    [writeContract, MemeNFTAbi],
  )

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

    if (!generatedImage) {
      setTxStatus('error')
      setTxErrorMessage('Please generate a meme first!')
      return
    }

    setIsMinting(true)
    setTxStatus('pending')
    setTxErrorMessage(null)
    try {
      mintMemeTx(generatedImage)
    } catch (error) {
      console.error('Error minting meme:', error)
      setTxStatus('error')
      setTxErrorMessage('Failed to mint meme. Please try again.')
    } finally {
      setIsMinting(false)
    }
  }

  // Update the effects to use UI state instead of alerts
  useEffect(() => {
    if (hash) {
      setTxHash(hash)
      setTxStatus('pending')
      setTxErrorMessage(null)
    }
  }, [hash])

  useEffect(() => {
    if (isConfirmed) {
      setTxStatus('success')
      setTxHash(null)
    }
  }, [isConfirmed])

  useEffect(() => {
    if (isSendTxError && sendTxError) {
      setTxStatus('error')
      setTxErrorMessage(sendTxError.message)
      setIsMinting(false)
    }
  }, [isSendTxError, sendTxError])

  const shareToFarcaster = () => {
    if (actions && generatedImage) {
      actions.composeCast({
        text: `I just created this meme with Meme AI Assistant! 🔥 "${prompt}"`,
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
              disabled={isMinting || txStatus === 'pending'}
              className={`flex-1 py-2 rounded-md font-medium ${
                isMinting || txStatus === 'pending'
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isMinting || txStatus === 'pending'
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

          {/* Transaction Status Display */}
          {txStatus !== 'idle' && (
            <div
              className={`mt-4 p-4 rounded-md ${
                txStatus === 'error'
                  ? 'bg-red-900/20 border border-red-500 text-red-300'
                  : txStatus === 'success'
                  ? 'bg-green-900/20 border border-green-500 text-green-300'
                  : 'bg-blue-900/20 border border-blue-500 text-blue-300'
              }`}
            >
              {txStatus === 'pending' && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <p>Transaction pending...</p>
                </div>
              )}
              {txStatus === 'success' && (
                <div className="flex items-center space-x-2">
                  <span>✅</span>
                  <p>Meme minted successfully!</p>
                </div>
              )}
              {txStatus === 'error' && (
                <div className="flex items-center space-x-2">
                  <span>❌</span>
                  <p>{txErrorMessage || 'Transaction failed'}</p>
                </div>
              )}
              {txHash && (
                <p className="text-sm mt-2 break-all">
                  Transaction Hash: {txHash}
                </p>
              )}
            </div>
          )}
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
