import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Ensure Prisma engine binaries are included in the standalone output
  outputFileTracingIncludes: {
    '/**': ['./node_modules/.prisma/**/*', './node_modules/@prisma/client/**/*'],
  },
};

export default nextConfig;
