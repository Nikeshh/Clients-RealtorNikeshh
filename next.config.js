/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google user profile images
      'avatars.githubusercontent.com', // GitHub user profile images
    ],
  },
}

module.exports = nextConfig 