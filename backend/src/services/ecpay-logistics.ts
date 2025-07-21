// @ts-ignore
import ECPayLogistics from "ecpay_logistics_nodejs"
import crypto from "crypto"

interface ExpressMapParams {
  MerchantTradeNo: string
  ServerReplyURL: string
  LogisticsType: "CVS"
  LogisticsSubType: "FAMIC2C" | "UNIMARTC2C" | "HILIFEC2C" // 全家、7-11、萊爾富
  IsCollection: "Y" | "N" // 是否代收貨款
  ExtraData?: string
  Device?: string
  cartId?: string // 新增購物車 ID
}

class EcpayLogisticsService {
  private logistics: any

  constructor() {
    this.logistics = new ECPayLogistics()
  }

  /**
   * 產生超商電子地圖選擇門市的 HTML 表單
   * @param params 電子地圖參數
   * @returns HTML 表單字串
   */
  generateExpressMap(params: Partial<ExpressMapParams>): string {
    // 產生唯一的物流交易編號
    const merchantTradeNo = params.MerchantTradeNo || 
      `LOG${Date.now().toString().slice(-7)}${crypto.randomBytes(3).toString("hex").toUpperCase()}`

    const mapParams = {
      MerchantTradeNo: merchantTradeNo,
      ServerReplyURL: params.ServerReplyURL || process.env.ECPAY_LOGISTICS_RETURN_URL || "http://localhost:9000/store/ecpay/logistics/callback",
      LogisticsType: "CVS" as const,
      LogisticsSubType: params.LogisticsSubType || "UNIMARTC2C", // 預設 7-11
      IsCollection: params.IsCollection || "N", // 一般不代收貨款
      ExtraData: "", // 先設為空字串測試
      Device: "0" // 0=PC, 1=Mobile
    }

    console.log('🗺️ ECPay Logistics - 產生電子地圖參數:')
    console.log('- MerchantTradeNo:', mapParams.MerchantTradeNo)
    console.log('- LogisticsSubType:', mapParams.LogisticsSubType)
    console.log('- ServerReplyURL:', mapParams.ServerReplyURL)
    console.log('- ExtraData:', mapParams.ExtraData)

    try {
      const html = this.logistics.query_client.expressmap(mapParams)
      
      if (typeof html === 'string') {
        console.log('✅ ECPay Logistics - 電子地圖 HTML 生成成功')
        return html
      } else {
        throw new Error('ECPay 物流返回非字串類型的結果')
      }
    } catch (error) {
      console.error('❌ ECPay Logistics - 電子地圖生成失敗:', error)
      throw new Error(`ECPay 物流電子地圖生成失敗: ${error}`)
    }
  }

  /**
   * 根據超商類型取得對應的 LogisticsSubType
   * 統一使用 UNIMARTC2C，讓用戶在綠界地圖上選擇具體超商
   */
  getLogisticsSubType(storeType: string): "FAMIC2C" | "UNIMARTC2C" | "HILIFEC2C" {
    console.log('🏪 判斷超商類型:', storeType, '-> 統一使用 UNIMARTC2C (讓用戶在綠界地圖選擇)')
    
    // 統一回傳 UNIMARTC2C，讓用戶在綠界的電子地圖上選擇任何超商
    return "UNIMARTC2C"
  }

  /**
   * 解析門市選擇回調資料
   */
  parseStoreCallback(callbackData: any) {
    // ECPay 會回傳選擇的門市資訊
    // 通常包含：CVSStoreID, CVSStoreName, CVSAddress, CVSTelephone 等
    return {
      storeId: callbackData.CVSStoreID,
      storeName: callbackData.CVSStoreName,
      storeAddress: callbackData.CVSAddress,
      storeTelephone: callbackData.CVSTelephone,
      extraData: callbackData.ExtraData
    }
  }
}

export default EcpayLogisticsService
