import { NextResponse } from 'next/server'
import { APP_URL } from '../../../lib/constants'

export async function GET() {
  const farcasterConfig = {
    accountAssociation: {
      header:
        'eyJmaWQiOjYzNDksInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhlODNCRWUyQ2I0Rjk1QWY5NzhGQzY4REJkNjU0ZjBCQTE3ZEQ0ZWFjIn0',
      payload: 'eyJkb21haW4iOiJtZW1lLWFpLWFzc2lzdGFudC5hcmNobGFiLnNwYWNlIn0',
      signature:
        'MHhjN2I2MmM0NGY4YWQ5M2RmYWYxZjQ1MGQ3NTg2M2Q4YTU0ZTk3Mzg1NzJlNDQxZGFjMTljMmQwNjQ2MWUxMDExNjZiYzhkN2NjNWFlMzlkOTk3ZjA5NTU2MGQ3ZjYwZjU0ODZjOTI3OThjNmFmYmNiYmJkMzY2MDQ5NGFiYTZhYzFj',
    },

    frame: {
      version: '1',
      name: 'Monad Meme AI Assistant',
      iconUrl: `${APP_URL}/images/icon.png`,
      homeUrl: `${APP_URL}`,
      imageUrl: `${APP_URL}/images/feed.png`,
      screenshotUrls: [],
      tags: ['monad', 'farcaster', 'miniapp', 'meme', 'ai'],
      primaryCategory: 'social-media',
      buttonTitle: 'Launch AI Assistant',
      splashImageUrl: `${APP_URL}/images/splash.png`,
      splashBackgroundColor: '#ffffff',
      webhookUrl: `${APP_URL}/api/webhook`,
    },
  }

  return NextResponse.json(farcasterConfig)
}
