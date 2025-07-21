import { Request, Response } from "express"
import crypto from "crypto"

// 取得台灣時區的 YYYY/MM/DD HH:mm:ss
function getTaiwanDateTimeString() {
  const now = new Date();
  now.setHours(now.getHours() + 8 - now.getTimezoneOffset() / 60);
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${min}:${ss}`;
}

// ECPay CheckMacValue 加密函數
function generateCheckMacValue(params: Record<string, any>, hashKey: string, hashIV: string): string {
  // 1. 排除 CheckMacValue 參數
  const filteredParams = { ...params }
  delete filteredParams.CheckMacValue

  // 2. 按照 key 排序
  const sortedKeys = Object.keys(filteredParams).sort()
  
  // 3. 組成查詢字串
  const queryString = sortedKeys
    .map(key => `${key}=${filteredParams[key]}`)
    .join('&')
  
  // 4. 前後加上 HashKey 和 HashIV
  const rawString = `HashKey=${hashKey}&${queryString}&HashIV=${hashIV}`
  
  // 5. URL encode (特殊字元處理)
  let encodedString = encodeURIComponent(rawString)
  encodedString = encodedString.replace(/%20/g, '+')
  
  // 6. 轉為小寫
  encodedString = encodedString.toLowerCase()
  
  // 7. MD5 加密並轉大寫
  const checkMacValue = crypto.createHash('md5').update(encodedString).digest('hex').toUpperCase()
  
  console.log('🔐 CheckMacValue 生成過程:')
  console.log('- 原始字串:', rawString)
  console.log('- 編碼後:', encodedString)
  console.log('- CheckMacValue:', checkMacValue)
  
  return checkMacValue
}

// 電子地圖參數介面
interface LogisticsMapParams {
  MerchantID: string
  MerchantTradeNo: string
  LogisticsType: string
  LogisticsSubType: string
  IsCollection: string
  ServerReplyURL: string
  ExtraData?: string
  Device?: number
  CheckMacValue?: string
}

export async function POST(req: Request, res: Response) {
  try {
    console.log('🗺️ ECPay 電子地圖 API 被調用')
    console.log('📝 請求參數:', req.body)

    const {
      logisticsType = "CVS",
      logisticsSubType = "FAMI", // 預設全家
      isCollection = "N", // 預設不代收貨款
      extraData = "",
      device = 0 // 預設 PC
    } = req.body

    // 驗證必要參數
    if (!logisticsSubType) {
      return res.status(400).json({
        success: false,
        message: "物流子類型 (logisticsSubType) 為必填欄位"
      })
    }

    // 驗證物流子類型
    const validSubTypes = [
      'FAMI', 'UNIMART', 'UNIMARTFREEZE', 'HILIFE', // B2C
      'FAMIC2C', 'UNIMARTC2C', 'HILIFEC2C', 'OKMARTC2C' // C2C
    ]
    
    if (!validSubTypes.includes(logisticsSubType)) {
      return res.status(400).json({
        success: false,
        message: `無效的物流子類型: ${logisticsSubType}。有效值: ${validSubTypes.join(', ')}`
      })
    }

    // 檢查環境變數
    const merchantId = process.env.ECPAY_MERCHANT_ID
    const hashKey = process.env.ECPAY_HASH_KEY
    const hashIV = process.env.ECPAY_HASH_IV
    const mapCallbackUrl = process.env.ECPAY_MAP_CALLBACK_URL

    if (!merchantId || !hashKey || !hashIV) {
      console.error('❌ ECPay 設定不完整:', { merchantId: !!merchantId, hashKey: !!hashKey, hashIV: !!hashIV })
      return res.status(500).json({
        success: false,
        message: "ECPay 設定不完整，請檢查環境變數"
      })
    }

    // 生成唯一的交易編號
    const merchantTradeNo = `MAP${Date.now().toString().slice(-7)}${crypto.randomBytes(3).toString("hex").toUpperCase()}`

    // 準備電子地圖參數
    const mapParams: LogisticsMapParams = {
      MerchantID: merchantId,
      MerchantTradeNo: merchantTradeNo,
      LogisticsType: logisticsType,
      LogisticsSubType: logisticsSubType,
      IsCollection: isCollection,
      ServerReplyURL: mapCallbackUrl || "http://localhost:9000/store/ecpay/map-callback",
      ExtraData: extraData,
      Device: device
    }

    // 過濾掉空值
    const filteredParams = Object.fromEntries(
      Object.entries(mapParams).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    )

    console.log('🔧 電子地圖參數 (加密前):', filteredParams)

    // 生成 CheckMacValue
    const checkMacValue = generateCheckMacValue(filteredParams, hashKey, hashIV)
    filteredParams.CheckMacValue = checkMacValue

    console.log('🔧 電子地圖參數 (加密後):', filteredParams)

    // 生成電子地圖 HTML 表單
    const mapUrl = "https://logistics-stage.ecpay.com.tw/Express/map"
    const formId = `ecpay_map_form_${Date.now()}`

    let formHtml = `<form id="${formId}" action="${mapUrl}" method="post" target="_blank">\n`
    
    // 添加所有參數作為隱藏欄位
    Object.entries(filteredParams).forEach(([key, value]) => {
      formHtml += `  <input type="hidden" name="${key}" value="${value}" />\n`
    })

    // 添加自動提交的 JavaScript
    formHtml += `  <script type="text/javascript">\n`
    formHtml += `    document.getElementById("${formId}").submit();\n`
    formHtml += `  </script>\n`
    formHtml += `</form>`

    console.log('📄 生成的電子地圖表單:')
    console.log('- 表單 ID:', formId)
    console.log('- 目標 URL:', mapUrl)
    console.log('- 參數數量:', Object.keys(filteredParams).length)
    console.log('- HTML 長度:', formHtml.length)

    res.json({
      success: true,
      message: "電子地圖表單生成成功",
      html: formHtml,
      mapUrl: mapUrl,
      params: filteredParams,
      formId: formId,
      timestamp: getTaiwanDateTimeString()
    })

  } catch (error: any) {
    console.error('❌ 電子地圖生成失敗:', error)
    res.status(500).json({
      success: false,
      message: "電子地圖生成失敗",
      error: error.message,
      timestamp: getTaiwanDateTimeString()
    })
  }
}

export async function GET(req: Request, res: Response) {
  // 返回支援的物流類型資訊
  res.json({
    success: true,
    message: "ECPay 電子地圖 API 資訊",
    mapUrl: "https://logistics-stage.ecpay.com.tw/Express/map",
    supportedLogisticsTypes: {
      CVS: "超商取貨"
    },
    supportedSubTypes: {
      B2C: {
        FAMI: "全家",
        UNIMART: "7-ELEVEN超商", 
        UNIMARTFREEZE: "7-ELEVEN冷凍店取",
        HILIFE: "萊爾富"
      },
      C2C: {
        FAMIC2C: "全家店到店",
        UNIMARTC2C: "7-ELEVEN超商交貨便",
        HILIFEC2C: "萊爾富店到店",
        OKMARTC2C: "OK超商店到店"
      }
    },
    deviceTypes: {
      0: "PC（預設值）",
      1: "Mobile"
    },
    isCollectionOptions: {
      "N": "不代收貨款",
      "Y": "代收貨款"
    },
    timestamp: getTaiwanDateTimeString()
  })
}
