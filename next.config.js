/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;