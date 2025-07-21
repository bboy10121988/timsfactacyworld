import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import EcpayLogisticsService from "../../../../../services/ecpay-logistics"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<any> {
  console.log('🗺️ ECPay Logistics Map API called:', new Date().toISOString())
  
  try {
    const { storeType, shippingMethod, cartId, extraData } = req.body as {
      storeType?: string
      shippingMethod?: string
      cartId?: string
      extraData?: any
    }

    if (!cartId) {
      return res.status(400).json({ error: '缺少購物車 ID' })
    }

    const logisticsService = new EcpayLogisticsService()
    
    // 決定要使用的超商類型（優先使用 shippingMethod，否則使用 storeType）
    const targetStoreType = shippingMethod || storeType || '7-11'
    console.log('🏪 使用的超商類型:', targetStoreType)
    
    // 根據超商類型取得對應的物流子類型
    const logisticsSubType = logisticsService.getLogisticsSubType(targetStoreType)
    
    // 產生電子地圖 HTML
    const html = logisticsService.generateExpressMap({
      LogisticsSubType: logisticsSubType,
      ExtraData: JSON.stringify({ cartId, ...(extraData || {}) })
    })

    console.log('✅ ECPay Logistics Map - HTML 生成成功')
    
    res.json({ 
      html,
      storeType: logisticsSubType
    })
    
  } catch (error: any) {
    console.error('❌ ECPay Logistics Map Error:', error)
    res.status(500).json({ error: error.message })
  }
}
