/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint during builds for better code quality
  },
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript checking during builds
  },
  images: {
    unoptimized: false, // Enable image optimization for better performance
    domains: ['supabase.co', 'avatars.githubusercontent.com'], // Add allowed domains
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'], // External packages for server components
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

export default nextConfig
