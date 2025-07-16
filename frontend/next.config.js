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
  // output: 'export', // Disabled for Vercel deployment with dynamic routes
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  // distDir: 'out', // Not needed for Vercel deployment
  
  // 優化資源預加載
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@medusajs/ui', '@medusajs/icons'],
  },
  
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
  
  // 改善錯誤處理
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
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
  
  // 配置允許的圖片來源
  images: {
    // unoptimized: true, // Re-enable image optimization for Vercel
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
