import { useQuery } from 'urql'
import { GET_USER_MEMES, MemeNFT, MemeNFTResponse } from './queries'

export function useUserMemes(address: string | undefined) {
  const [result, reexecuteQuery] = useQuery<MemeNFTResponse>({
    query: GET_USER_MEMES,
    variables: { owner: address?.toLowerCase() || '' },
    pause: !address,
  })

  const { data, fetching, error } = result

  const memes = data?.memeNFTS?.items || []

  // Transform the GraphQL response into our MemeNFT format
  const transformedMemes: MemeNFT[] = memes.map((item) => ({
    id: item.tokenId,
    tokenId: item.tokenId,
    imageUrl: item.tokenURI,
    name: `Meme #${item.tokenId}`,
  }))

  return {
    memes: transformedMemes,
    isLoading: fetching,
    error,
  }
}
