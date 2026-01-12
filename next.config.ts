import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'web_opefssl';

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
