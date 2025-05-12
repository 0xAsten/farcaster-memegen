import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { FrameProvider } from '@/components/farcaster-provider'
import { GraphQLProvider } from '@/lib/graphql/provider'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Monad Farcaster MiniApp Template',
  description: 'A template for building mini-apps on Farcaster and Monad',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FrameProvider>
          <GraphQLProvider>{children}</GraphQLProvider>
        </FrameProvider>
      </body>
    </html>
  )
}
