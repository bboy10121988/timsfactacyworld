import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    // 庫存模組（必須的）
    {
      resolve: "@medusajs/inventory",
      options: {
        enableUI: true
      }
    },
    // 自定義聯盟模組
    {
      resolve: "./src/modules/affiliate",
      key: "affiliate"
    }
  ],
  plugins: []
})
