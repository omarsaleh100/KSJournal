import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'image.pollinations.ai' },
      { protocol: 'https', hostname: 'www.yorku.ca' },
      { protocol: 'https', hostname: 'smartcdn.gprod.postmedia.digital' },
      { protocol: 'https', hostname: '*.cbc.ca' },
      { protocol: 'https', hostname: '*.bbci.co.uk' },
    ],
  },
};

export default nextConfig;
