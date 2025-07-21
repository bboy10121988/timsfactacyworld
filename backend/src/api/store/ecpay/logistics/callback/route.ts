import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import EcpayLogisticsService from "../../../../../services/ecpay-logistics"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<any> {
  console.log('📦 ECPay Logistics Callback received:', new Date().toISOString())
  console.log('📦 Callback body:', req.body)
  
  try {
    const logisticsService = new EcpayLogisticsService()
    
    // 解析門市選擇回調資料
    const storeInfo = logisticsService.parseStoreCallback(req.body)
    
    console.log('🏪 Selected store info:', storeInfo)
    
    // 這裡可以將門市資訊存到資料庫或快取中
    // 通常會透過 ExtraData 中的 cartId 來關聯購物車
    
    // 回應 ECPay 成功收到回調
    res.send("1|OK")
    
  } catch (error) {
    console.error('💥 ECPay Logistics callback error:', error)
    res.status(500).send("0|Error")
  }
}
