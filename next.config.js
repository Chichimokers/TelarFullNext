/** @type {import('next').NextConfig} */
const nextConfig = {

  assetPrefix: '/telas/',


  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
