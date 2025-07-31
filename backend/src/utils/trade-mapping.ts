// ECPay Trade Mapping System
// 用於 MerchantTradeNo 與 Cart ID 之間的映射
import * as fs from 'fs'
import * as path from 'path'

interface TradeMapping {
  cartId: string
  createdAt: Date
  amount: number
}

// 定義持久化文件路徑
const STORAGE_DIR = path.join(__dirname, '../../.ecpay-cache')
const MAPPING_FILE = path.join(STORAGE_DIR, 'trade-mappings.json')

// 使用 Map 存儲映射關係
const tradeMappings = new Map<string, TradeMapping>()

// 確保存儲目錄存在
try {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true })
    console.log(`📁 Created storage directory: ${STORAGE_DIR}`)
  }
} catch (error) {
  console.warn(`⚠️ Failed to create storage directory: ${error}`)
}

// 從文件加載映射（初始化時）
try {
  if (fs.existsSync(MAPPING_FILE)) {
    const fileContent = fs.readFileSync(MAPPING_FILE, 'utf-8')
    const storedData = JSON.parse(fileContent)
    
    for (const [key, value] of Object.entries(storedData)) {
      const mapping = value as any
      tradeMappings.set(key, {
        ...mapping,
        createdAt: new Date(mapping.createdAt)
      })
    }
    
    console.log(`📥 Loaded ${tradeMappings.size} trade mappings from file`)
  }
} catch (error) {
  console.warn(`⚠️ Failed to load trade mappings: ${error}`)
}

// 持久化儲存映射
function persistMappings(): void {
  try {
    const data: Record<string, any> = {}
    tradeMappings.forEach((value, key) => {
      data[key] = value
    })
    
    fs.writeFileSync(MAPPING_FILE, JSON.stringify(data, null, 2), 'utf-8')
    console.log(`📤 Persisted ${tradeMappings.size} trade mappings to file`)
  } catch (error) {
    console.warn(`⚠️ Failed to persist trade mappings: ${error}`)
  }
}

/**
 * 添加 trade mapping
 */
export function addTradeMapping(merchantTradeNo: string, cartId: string, amount: number): void {
  tradeMappings.set(merchantTradeNo, {
    cartId,
    createdAt: new Date(),
    amount
  })
  
  console.log(`✅ Trade mapping stored - MerchantTradeNo: ${merchantTradeNo} -> CartID: ${cartId}`)
  console.log(`📊 Current mappings count: ${tradeMappings.size}`)
  
  // 持久化到文件
  persistMappings()
}

/**
 * 獲取 trade mapping
 */
export function getTradeMapping(merchantTradeNo: string): string | null {
  const mapping = tradeMappings.get(merchantTradeNo)
  
  if (mapping) {
    console.log(`🔍 Trade mapping found - MerchantTradeNo: ${merchantTradeNo} -> CartID: ${mapping.cartId}`)
    return mapping.cartId
  }
  
  console.log(`❌ Trade mapping not found for MerchantTradeNo: ${merchantTradeNo}`)
  
  if (tradeMappings.size > 0) {
    console.log(`📊 Available mappings:`, Array.from(tradeMappings.keys()))
  } else {
    console.log(`📊 No mappings available in memory`)
  }
  
  return null
}

/**
 * 移除 trade mapping
 */
export function removeTradeMapping(merchantTradeNo: string): boolean {
  const deleted = tradeMappings.delete(merchantTradeNo)
  
  if (deleted) {
    console.log(`🗑️ Trade mapping removed - MerchantTradeNo: ${merchantTradeNo}`)
    // 持久化更新
    persistMappings()
  } else {
    console.log(`⚠️ Trade mapping not found for removal - MerchantTradeNo: ${merchantTradeNo}`)
  }
  
  console.log(`📊 Remaining mappings count: ${tradeMappings.size}`)
  return deleted
}

/**
 * 獲取所有 trade mappings（調試用）
 */
export function getAllTradeMappings(): Record<string, TradeMapping> {
  const result: Record<string, TradeMapping> = {}
  tradeMappings.forEach((value, key) => {
    result[key] = value
  })
  return result
}

/**
 * 清理過期的 trade mappings（超過24小時）
 */
export function cleanupExpiredMappings(): number {
  const now = new Date()
  const expiredKeys: string[] = []
  
  tradeMappings.forEach((mapping, merchantTradeNo) => {
    const hoursDiff = (now.getTime() - mapping.createdAt.getTime()) / (1000 * 60 * 60)
    if (hoursDiff > 24) {
      expiredKeys.push(merchantTradeNo)
    }
  })
  
  expiredKeys.forEach(key => {
    tradeMappings.delete(key)
  })
  
  if (expiredKeys.length > 0) {
    console.log(`🧹 Cleaned up ${expiredKeys.length} expired trade mappings`)
  }
  
  return expiredKeys.length
}
