'use client'

import { useState } from 'react'
import { User } from '@/components/Home/User'
import { MemeGenerator } from './MemeGenerator'
import { MemeGallery } from './MemeGallery'
import { useMiniAppContext } from '@/hooks/use-miniapp-context'
import { useAccount } from 'wagmi'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'create' | 'gallery'>('create')
  const { context } = useMiniAppContext()
  const { isConnected } = useAccount()

  return (
    <div className="flex min-h-screen flex-col items-center p-4 space-y-4 bg-[#111]">
      {/* Header */}
      <div className="w-full max-w-3xl flex flex-row justify-between items-center pt-2">
        <h1 className="text-2xl font-bold text-white">MemeGen</h1>
        <User compact />
      </div>

      {/* Tab Selector */}
      <div className="w-full max-w-3xl flex border-b border-[#333]">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'create'
              ? 'text-white border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('create')}
          data-tab="create"
        >
          Create Meme
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'gallery'
              ? 'text-white border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('gallery')}
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
          <MemeGallery />
        </div>
      </div>
    </div>
  )
}
