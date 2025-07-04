import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS || 'http://localhost:8000',
      adminCors: process.env.ADMIN_CORS || 'http://localhost:5173,http://localhost:9000',
      authCors: process.env.AUTH_CORS || 'http://localhost:5173,http://localhost:9000,http://localhost:8000',
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: {
    // 在 Medusa v2 中，庫存服務已被內建整合，無需額外定義
    // 如果需要自定義配置，可以在這裡添加其他模組
    // Google Auth 暫時移除，等待官方支援
  },
  plugins: []
})
