import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// 動態構建CORS允許的來源
const buildCorsOrigins = (envVar: string, defaultValues: string[]) => {
  const envValue = process.env[envVar]
  if (envValue) {
    return envValue.split(',').map(origin => origin.trim()).filter(Boolean)
  }
  return defaultValues
}

// 根據環境設置CORS來源
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// 開發環境的CORS設置
const developmentCors = {
  storeCors: [
    'http://localhost:3000',
    'http://localhost:8000', 
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8000'
  ],
  adminCors: [
    'http://localhost:5173',
    'http://localhost:9000',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:9000',
    'http://127.0.0.1:3000'
  ],
  authCors: [
    'http://localhost:5173',
    'http://localhost:9000',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:9000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8000'
  ]
}

// 生產環境的CORS設置
const productionCors = {
  storeCors: buildCorsOrigins('STORE_CORS', [
    process.env.NEXT_PUBLIC_BASE_URL || 'https://your-frontend-domain.com'
  ]),
  adminCors: buildCorsOrigins('ADMIN_CORS', [
    process.env.MEDUSA_ADMIN_URL || 'https://your-admin-domain.com',
    process.env.NEXT_PUBLIC_BASE_URL || 'https://your-frontend-domain.com'
  ]),
  authCors: buildCorsOrigins('AUTH_CORS', [
    process.env.MEDUSA_ADMIN_URL || 'https://your-admin-domain.com',
    process.env.NEXT_PUBLIC_BASE_URL || 'https://your-frontend-domain.com'
  ])
}

// 選擇適當的CORS設置
const corsConfig = isDevelopment ? developmentCors : productionCors

const config = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: corsConfig.storeCors.join(','),
      adminCors: corsConfig.adminCors.join(','),
      authCors: corsConfig.authCors.join(','),
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    // 核心模組 - 按 Medusa v2 要求順序註冊
    {
      resolve: "@medusajs/medusa/auth",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
            options: {
              jwt_secret: process.env.JWT_SECRET || "supersecret",
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/api-key",
    },
    {
      resolve: "@medusajs/medusa/store",
    },
    {
      resolve: "@medusajs/medusa/user",
      options: {
        jwt_secret: process.env.JWT_SECRET || "supersecret",
      },
    },
    {
      resolve: "@medusajs/medusa/customer",
    },
    {
      resolve: "@medusajs/medusa/region",
    },
    {
      resolve: "@medusajs/medusa/sales-channel",
    },
    {
      resolve: "@medusajs/medusa/currency",
    },
    {
      resolve: "@medusajs/medusa/product",
    },
    {
      resolve: "@medusajs/medusa/pricing",
    },
    {
      resolve: "@medusajs/medusa/cart",
    },
    {
      resolve: "@medusajs/medusa/promotion",
    },
    {
      resolve: "@medusajs/medusa/tax",
    },
    {
      resolve: "@medusajs/medusa/order",
    },
    // 庫存和庫存位置模組 - 這是必需的
    {
      resolve: "@medusajs/medusa/stock-location",
    },
    {
      resolve: "@medusajs/medusa/inventory",
    },
    // 物流模組
    {
      resolve: "@medusajs/fulfillment",
      options: {
        providers: [
          {
            resolve: "@medusajs/fulfillment-manual",
            id: "manual",
            name: "Manual Fulfillment"
          }
        ]
      }
    },
    // 付款模組
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/ecpay-payment",
            id: "ecpay",
            options: {
              merchant_id: process.env.ECPAY_MERCHANT_ID,
              hash_key: process.env.ECPAY_HASH_KEY,
              hash_iv: process.env.ECPAY_HASH_IV,
              is_production: process.env.ECPAY_IS_PRODUCTION === 'true'
            }
          }
        ]
      }
    },
    // 自定義聯盟模組 - 暫時禁用以修復啟動問題
    // {
    //   resolve: "./src/modules/affiliate",
    //   key: "affiliate"
    // }
  ],
  admin: {
    disable: false,
  },
  plugins: [
    {
      resolve: "@medusajs/file-local",
      options: {
        upload_dir: "uploads"
      }
    }
  ]
})

export default config
