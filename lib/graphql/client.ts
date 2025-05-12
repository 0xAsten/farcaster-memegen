import { createClient } from 'urql'
import { cacheExchange, fetchExchange } from 'urql'

// Create a GraphQL client instance
export const graphqlClient = createClient({
  url: 'https://api.ghostlogs.xyz/gg/pub/a4d7b20d-1a4a-402d-ae38-5995d463a308/ghostgraph',
  fetchOptions: () => {
    return {
      headers: {
        'X-GHOST-KEY': process.env.NEXT_PUBLIC_GHOST_API_KEY || '',
        'content-type': 'application/json',
      },
    }
  },
  exchanges: [cacheExchange, fetchExchange],
})
