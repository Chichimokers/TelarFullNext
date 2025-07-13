/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/telas',

  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
