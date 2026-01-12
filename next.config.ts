import type { NextConfig } from "next";

<<<<<<< HEAD
const nextConfig: NextConfig = {
  output: process.env.NEXT_STATIC_EXPORT === 'true' ? 'export' : undefined,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    unoptimized: true,
  },
};
=======
const isProd = process.env.NODE_ENV === 'production';
const repoName = 'web_opefssl';
>>>>>>> 7c205311cbfe5f8a6f3c04208da294eb2f07ab24

const nextConfig = {
  output: 'export',
  basePath: isProd ? `/${repoName}` : '',

  images: {
    unoptimized: true,
  },

  trailingSlash: true,

  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? `/${repoName}` : '',
  },
}

module.exports = nextConfig;
