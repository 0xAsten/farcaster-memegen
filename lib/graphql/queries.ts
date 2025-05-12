import { gql } from 'urql'

// Define GraphQL fragments, queries, and mutations
export const GET_USER_MEMES = gql`
  query GetUserMemes($owner: String!) {
    memeNFTS(
      limit: 1000
      orderBy: "id"
      orderDirection: "desc"
      where: { owner: $owner }
    ) {
      items {
        owner
        tokenId
        tokenURI
      }
    }
  }
`

// Define TypeScript types for GraphQL responses
export interface MemeNFT {
  id: string
  tokenId: string
  imageUrl: string
  name: string
}

export interface MemeNFTResponse {
  memeNFTS: {
    items: Array<{
      owner: string
      tokenId: string
      tokenURI: string
    }>
  }
}
