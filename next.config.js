/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')("lib/i18n/request.ts");

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  images: { unoptimized: true },
};

module.exports = withNextIntl(nextConfig);