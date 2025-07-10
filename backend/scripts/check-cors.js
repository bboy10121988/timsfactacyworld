#!/usr/bin/env node

/**
 * CORS 配置檢查腳本
 * 用於驗證當前環境的 CORS 設置是否正確
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 檢查 CORS 配置...\n')

// 讀取環境變數
require('dotenv').config()

const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

console.log(`📌 當前環境: ${process.env.NODE_ENV || 'development'}`)

// 檢查必要的環境變數
const requiredEnvVars = [
  'STORE_CORS',
  'ADMIN_CORS', 
  'AUTH_CORS'
]

const optionalEnvVars = [
  'NEXT_PUBLIC_BASE_URL',
  'MEDUSA_ADMIN_URL',
  'MEDUSA_BACKEND_URL'
]

console.log('\n🔑 環境變數檢查:')
console.log('='.repeat(50))

// 檢查必要變數
requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${value}`)
  } else {
    console.log(`❌ ${varName}: 未設置`)
  }
})

// 檢查可選變數
console.log('\n📋 可選變數:')
optionalEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${value}`)
  } else {
    console.log(`⚠️  ${varName}: 未設置 (可選)`)
  }
})

// CORS 配置建議
console.log('\n💡 CORS 配置建議:')
console.log('='.repeat(50))

if (isDevelopment) {
  console.log('🔧 開發環境建議:')
  console.log('• STORE_CORS: http://localhost:3000,http://127.0.0.1:3000')
  console.log('• ADMIN_CORS: http://localhost:5173,http://localhost:9000,http://localhost:3000')
  console.log('• AUTH_CORS: http://localhost:5173,http://localhost:9000,http://localhost:3000,http://localhost:8000')
} else {
  console.log('🚀 生產環境建議:')
  console.log('• STORE_CORS: https://your-frontend-domain.com')
  console.log('• ADMIN_CORS: https://your-admin-domain.com,https://your-frontend-domain.com')
  console.log('• AUTH_CORS: https://your-admin-domain.com,https://your-frontend-domain.com')
  console.log('\n⚠️  請將 "your-frontend-domain.com" 和 "your-admin-domain.com" 替換為實際域名')
}

// 安全檢查
console.log('\n🔒 安全檢查:')
console.log('='.repeat(50))

const jwtSecret = process.env.JWT_SECRET
const cookieSecret = process.env.COOKIE_SECRET

if (jwtSecret === 'supersecret' || !jwtSecret) {
  console.log('❌ JWT_SECRET: 使用預設值或未設置，請更改為強密碼')
} else if (jwtSecret.length < 32) {
  console.log('⚠️  JWT_SECRET: 建議使用至少 32 字符的強密碼')
} else {
  console.log('✅ JWT_SECRET: 已設置且足夠強')
}

if (cookieSecret === 'supersecret' || !cookieSecret) {
  console.log('❌ COOKIE_SECRET: 使用預設值或未設置，請更改為強密碼')
} else if (cookieSecret.length < 32) {
  console.log('⚠️  COOKIE_SECRET: 建議使用至少 32 字符的強密碼')
} else {
  console.log('✅ COOKIE_SECRET: 已設置且足夠強')
}

// 生成強密碼建議
if (jwtSecret === 'supersecret' || cookieSecret === 'supersecret' || !jwtSecret || !cookieSecret) {
  console.log('\n🔐 強密碼生成建議:')
  console.log('可以使用以下命令生成安全的密鑰:')
  console.log('• node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"')
  console.log('• openssl rand -hex 32')
}

console.log('\n✨ 檢查完成！')
