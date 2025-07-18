const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

// 動態獲取後端URL
const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 
         process.env.MEDUSA_BACKEND_URL || 
         'http://localhost:9000'
}

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  // output: 'export', // 移除靜態導出，恢復完整功能
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  // distDir: 'out', // 移除自定義輸出目錄
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
  
  // 配置 webpack 別名解析
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    const path = require('path')
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@pages': path.resolve(__dirname, 'src/pages'),
    }
    
    // 修正模組解析問題
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.jsx': ['.jsx', '.tsx'],
    }
    
    // 處理 ES 模組兼容性
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    return config
  },
  
  // 配置CORS和API代理
  async headers() {
    return [
      {
        // 為所有API路由設置CORS headers
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // 在生產環境中應該設置具體的域名
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With",
          },
        ],
      },
    ]
  },
  
  // 修復跨域和 fetch 問題
  async rewrites() {
    const backendUrl = getBackendUrl()
    
    return [
      // 代理 Medusa API 請求到後端
      {
        source: "/api/medusa/:path*",
        destination: `${backendUrl}/:path*`,
      },
      // 代理圖片請求到 Medusa 後端
      {
        source: "/static/:path*",
        destination: `${backendUrl}/static/:path*`,
      },
    ]
  },
  // 配置允許的圖片來源
  images: {
    // unoptimized: true, // 恢復圖片優化功能
    remotePatterns: [
      // 本地開發
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
        protocol: "http",
        hostname: "127.0.0.1",
      },
      // AWS S3 圖片
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
      // Sanity CDN
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      // 生產環境後端域名 (動態)
      ...(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL 
        ? [{
            protocol: new URL(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL).protocol.slice(0, -1),
            hostname: new URL(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL).hostname,
            ...(new URL(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL).port 
              ? { port: new URL(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL).port }
              : {}),
            pathname: "/static/**",
          }]
        : []),
    ],
    domains: [
      "localhost",
      "127.0.0.1",
      "images.unsplash.com",
      "plus.unsplash.com",
      "cdn.sanity.io",
      // 動態添加生產環境域名
      ...(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL 
        ? [new URL(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL).hostname]
        : []),
    ],
  },
}

module.exports = nextConfig
