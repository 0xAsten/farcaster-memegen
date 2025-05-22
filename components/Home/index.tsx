'use client'

import { useState, useEffect } from 'react'
import { User } from '@/components/Home/User'
import { MemeGenerator } from './MemeGenerator'
import { MemeGallery } from './MemeGallery'
import { useMiniAppContext } from '@/hooks/use-miniapp-context'
import { useAccount } from 'wagmi'
import MemeSignIn from '@/components/MemeSignIn'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'create' | 'gallery'>('create')
  const [shouldRefetch, setShouldRefetch] = useState(false)
  const { context } = useMiniAppContext()
  const { isConnected } = useAccount()

  // Handler for gallery tab click
  const handleGalleryClick = () => {
    setActiveTab('gallery')
    setShouldRefetch(true)
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-4 space-y-6 bg-[#111] w-full">
      {/* Header */}
      <div className="w-full max-w-3xl flex flex-row justify-between items-center pt-2">
        <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
        <User compact />
      </div>

      {/* MemeSignIn Component */}
      <div className="w-full max-w-3xl">
        <MemeSignIn />
      </div>

      {/* Tab Selector */}
      <div className="w-full max-w-3xl flex border-b border-[#333] mt-6">
        <button
          className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
            activeTab === 'create'
              ? 'text-white border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-white hover:bg-[#222] rounded-t-md'
          }`}
          onClick={() => setActiveTab('create')}
          data-tab="create"
        >
          Create Meme
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
            activeTab === 'gallery'
              ? 'text-white border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-white hover:bg-[#222] rounded-t-md'
          }`}
          onClick={handleGalleryClick}
          data-tab="gallery"
        >
          My Gallery
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-3xl flex-1">
        <div style={{ display: activeTab === 'create' ? 'block' : 'none' }}>
          <MemeGenerator />
        </div>
        <div style={{ display: activeTab === 'gallery' ? 'block' : 'none' }}>
          <MemeGallery
            isVisible={activeTab === 'gallery'}
            shouldRefetch={shouldRefetch}
            onRefetchComplete={() => setShouldRefetch(false)}
          />
        </div>
      </div>
    </div>
  )
}
