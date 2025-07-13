/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/telas',
  assetPrefix: '/telas/',


  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
