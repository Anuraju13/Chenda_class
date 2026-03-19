import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow YouTube thumbnails and player images
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
  },
};

export default nextConfig;
