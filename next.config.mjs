/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com',
      'zstezgvyrjgkmkdnvcok.supabase.co',
      'stripe.com',
      'files.stripe.com'
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    scrollRestoration: true,
  },
}

export default nextConfig;
