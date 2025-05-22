# Meme AI Assitant - Farcaster MiniApp

A Farcaster MiniApp that allows users to generate, mint, and share meme images with just a text prompt.

## Features

- **AI-Powered Meme Generation**: Create custom memes with just a text prompt, no need to choose templates or manually position text
- **One-Click Minting**: Mint your favorite generated memes as NFTs with a simple click
- **Wallet Integration**: Connect your wallet to mint and manage your meme collection
- **Personal Gallery**: View all your minted meme NFTs in one place
- **Farcaster Integration**: Seamlessly share your memes to Farcaster with auto-generated casts
- **Daily Sign-In**: Earn XP by signing in daily with a secure on-chain authentication system

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Authentication**: Farcaster Auth, MemeAuth Contract
- **Blockchain**: Monad
- **Wallet Connection**: Wagmi
- **AI Image Generation**: [Image Generation API]

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A Farcaster account
- A compatible wallet for Monad network

### Installation

1. Clone the repository:

```bash
git clone [your-repo-url]
cd memegen-miniapp
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Then add your API keys and configuration values including:

- `SERVER_PRIVATE_KEY`: The private key used by the server to sign authentication messages
- `NEXT_PUBLIC_MEME_AUTH_ADDRESS`: The deployed MemeAuth contract address

4. Run the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## How to Use

1. **Connect with Farcaster**: Sign in with your Farcaster account
2. **Connect Your Wallet**: Connect your Ethereum wallet to access all features
3. **Daily Sign-In**: Sign in daily to earn XP points that unlock special features
4. **Generate a Meme**: Enter a text prompt describing the meme you want to create
5. **Customize (Optional)**: Make any adjustments to the generated image
6. **Mint Your Meme**: Connect your wallet and mint the image as an NFT
7. **Share to Farcaster**: Automatically post your meme to Farcaster with one click
8. **View Your Collection**: Browse all your minted memes in the gallery

## Development

This project is built on the Monad Farcaster MiniApp Template, providing a solid foundation for Farcaster integration and wallet connectivity.

To customize the meme generation:

- Modify the prompt handling in `components/MemeGeneration`
- Update the NFT minting logic in `components/MintActions`
- Customize the UI in the respective component files

### Authentication System

The MemeAuth contract provides on-chain authentication with daily sign-in:

1. **Server Signature**: The API endpoint at `/api/auth/sign-message` signs messages using the server's private key
2. **Sign-In Component**: `components/MemeSignIn.tsx` provides a UI for daily sign-in
3. **Auth Hook**: `hooks/useAuthSignature.ts` handles fetching signatures from the server

To customize the authentication:

- Adjust the sign-in reward in the MemeAuth contract
- Modify the cooldown period (currently 12 hours)
- Update the UI in the MemeSignIn component

## License

MIT

## Credits

Built with ❤️ on Farcaster and Monad
