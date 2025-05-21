import { Metadata } from 'next'
import App from '@/components/pages/app'
import { APP_URL } from '@/lib/constants'

const frame = {
  version: 'next',
  imageUrl: `${APP_URL}/images/feed.png`,
  button: {
    title: 'Launch AI Assistant',
    action: {
      type: 'launch_frame',
      name: 'Monad Meme AI Assistant',
      url: APP_URL,
      splashImageUrl: `${APP_URL}/images/splash.png`,
      splashBackgroundColor: '#f7f7f7',
    },
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Monad Meme AI Assistant',
    openGraph: {
      title: 'Monad Meme AI Assistant',
      description: 'A meme AI assistant for Farcaster',
    },
    other: {
      'fc:frame': JSON.stringify(frame),
    },
  }
}

export default function Home() {
  return <App />
}
