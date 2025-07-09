const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 修復跨域和 fetch 問題
  async rewrites() {
    return [
      // 代理 Medusa API 請求到後端
      {
        source: "/api/medusa/:path*",
        destination: `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}/:path*`,
      },
      // 代理圖片請求到 Medusa 後端
      {
        source: "/static/:path*",
        destination: `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}/static/:path*`,
      },
    ]
  },
  // 配置允許的圖片來源
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/static/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
    domains: [
      "localhost",
      "images.unsplash.com",
      "plus.unsplash.com",
      "cdn.sanity.io",
    ],
  },
}

module.exports = nextConfig
