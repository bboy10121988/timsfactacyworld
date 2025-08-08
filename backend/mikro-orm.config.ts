import { defineConfig } from '@mikro-orm/core'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'

export default defineConfig({
  driver: PostgreSqlDriver,
  clientUrl: process.env.DATABASE_URL,
  schema: process.env.DATABASE_SCHEMA || 'public',
  debug: process.env.NODE_ENV === 'development',
  
  // 實體掃描配置
  entities: [
    // Medusa 框架核心實體
    'node_modules/@medusajs/framework/dist/**/*.entity.js',
    'node_modules/@medusajs/medusa/dist/**/*.entity.js',
    
    // 庫存管理模組實體
    'node_modules/@medusajs/inventory/dist/**/*.entity.js',
    'node_modules/@medusajs/inventory/dist/models/*.js',
    
    // 認證模組實體
    'node_modules/@medusajs/auth/dist/**/*.entity.js',
    'node_modules/@medusajs/auth/dist/models/*.js',
    
    // 物流模組實體
    'node_modules/@medusajs/fulfillment/dist/**/*.entity.js',
    'node_modules/@medusajs/fulfillment/dist/models/*.js',
    
    // 自定義模組實體
    'src/modules/**/models/*.ts',
    'dist/modules/**/models/*.js',
  ],
  
  entitiesTs: [
    // TypeScript 實體（開發時使用）
    'src/modules/**/models/*.ts',
    'node_modules/@medusajs/framework/src/**/*.entity.ts',
    'node_modules/@medusajs/medusa/src/**/*.entity.ts',
    'node_modules/@medusajs/inventory/src/**/*.entity.ts',
    'node_modules/@medusajs/auth/src/**/*.entity.ts',
    'node_modules/@medusajs/fulfillment/src/**/*.entity.ts',
  ],

  // 遷移設定
  migrations: {
    path: './migrations',
    pathTs: './migrations',
    glob: '!(*.d).{js,ts}',
    transactional: true,
    allOrNothing: true,
    safe: false,
    snapshot: true,
    emit: 'ts',
  },

  // 連接設定
  pool: {
    min: 2,
    max: 10,
  },
  
  // 發現設定
  discovery: {
    warnWhenNoEntities: false,
    requireEntitiesArray: false,
    alwaysAnalyseProperties: false,
  },

  // 驗證設定
  validate: true,
  strict: true,
})
