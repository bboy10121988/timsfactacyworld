// 全域 trade mapping store
// 用於存儲 ECPay MerchantTradeNo 與 Cart ID 的映射關係

interface TradeMapping {
  cartId: string
  timestamp: number
  totalAmount: number
  customer?: any
  items?: any[]
}

export const tradeMapping = new Map<string, TradeMapping>()

export function addTradeMapping(merchantTradeNo: string, data: TradeMapping) {
  tradeMapping.set(merchantTradeNo, data)
  console.log(`✅ Trade mapping added: ${merchantTradeNo} -> ${data.cartId}`)
}

export function getTradeMapping(merchantTradeNo: string): TradeMapping | undefined {
  const mapping = tradeMapping.get(merchantTradeNo)
  console.log(`🔍 Trade mapping lookup: ${merchantTradeNo} -> ${mapping ? mapping.cartId : 'NOT FOUND'}`)
  return mapping
}

export function removeTradeMapping(merchantTradeNo: string): boolean {
  const deleted = tradeMapping.delete(merchantTradeNo)
  console.log(`🗑️ Trade mapping removed: ${merchantTradeNo} -> ${deleted}`)
  return deleted
}

export function getAllTradeMappings(): Map<string, TradeMapping> {
  return tradeMapping
}
