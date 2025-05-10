/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'i.imgur.com',
      'placehold.co',
      'imgur.com',
      'via.placeholder.com',
      'cdn.warpcast.com', // For Farcaster profile images
      'res.cloudinary.com',
      'api.memegen.link',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
