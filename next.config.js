/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'zstezgvyrjgkmkdnvcok.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/auth',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/settings',
        destination: '/settings/profile',
        permanent: true,
      }
    ]
  },
  // Add rewrites for API routes if needed
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        source: '/listings/browse',
        destination: '/listings',
      }
    ]
  }
}

module.exports = nextConfig 