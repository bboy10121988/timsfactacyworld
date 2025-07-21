import { Request, Response } from "express"

// 電子地圖回調參數介面
interface MapCallbackParams {
  MerchantID: string
  MerchantTradeNo: string
  LogisticsSubType: string
  CVSStoreID?: string
  CVSStoreName?: string
  CVSAddress?: string
  CVSTelephone?: string
  CVSOutSide?: string
  ExtraData?: string
}

export async function POST(req: Request, res: Response) {
  try {
    console.log('📍 ECPay 電子地圖回調被調用')
    console.log('📝 回調參數:', req.body)

    const callbackData: MapCallbackParams = req.body

    // 驗證必要參數
    if (!callbackData.MerchantID || !callbackData.MerchantTradeNo || !callbackData.LogisticsSubType) {
      console.error('❌ 缺少必要的回調參數')
      return res.status(400).json({
        success: false,
        message: "缺少必要的回調參數"
      })
    }

    // 記錄用戶選擇的店鋪資訊
    const storeInfo = {
      merchantId: callbackData.MerchantID,
      merchantTradeNo: callbackData.MerchantTradeNo,
      logisticsSubType: callbackData.LogisticsSubType,
      storeId: callbackData.CVSStoreID,
      storeName: callbackData.CVSStoreName,
      address: callbackData.CVSAddress,
      telephone: callbackData.CVSTelephone,
      isOutside: callbackData.CVSOutSide === "1" ? "離島" : "本島",
      extraData: callbackData.ExtraData,
      selectedAt: new Date().toISOString()
    }

    console.log('✅ 用戶選擇的店鋪資訊:', storeInfo)

    // 這裡可以將店鋪資訊保存到資料庫
    // 例如：await saveStoreSelection(storeInfo)

    // 根據物流子類型提供適當的回應
    let responseMessage = "店鋪選擇成功"
    
    if (callbackData.LogisticsSubType.includes("UNIMART")) {
      responseMessage += "（7-ELEVEN）"
      if (!callbackData.CVSTelephone) {
        console.log('ℹ️ 注意：7-ELEVEN不會回傳電話資訊')
      }
    } else if (callbackData.LogisticsSubType.includes("FAMI")) {
      responseMessage += "（全家）"
    } else if (callbackData.LogisticsSubType.includes("HILIFE")) {
      responseMessage += "（萊爾富）"
    } else if (callbackData.LogisticsSubType.includes("OKMART")) {
      responseMessage += "（OK超商）"
    }

    // 返回成功頁面或重導向
    const successHtml = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>店鋪選擇成功</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .success-icon {
            font-size: 48px;
            color: #4CAF50;
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        .store-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
        }
        .info-row {
            margin: 10px 0;
            display: flex;
            justify-content: space-between;
        }
        .label {
            font-weight: bold;
            color: #555;
        }
        .value {
            color: #333;
        }
        .close-btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
        }
        .close-btn:hover {
            background: #45a049;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon">✅</div>
        <h1>${responseMessage}</h1>
        
        <div class="store-info">
            <div class="info-row">
                <span class="label">交易編號：</span>
                <span class="value">${callbackData.MerchantTradeNo}</span>
            </div>
            <div class="info-row">
                <span class="label">物流類型：</span>
                <span class="value">${callbackData.LogisticsSubType}</span>
            </div>
            ${callbackData.CVSStoreID ? `
            <div class="info-row">
                <span class="label">店鋪編號：</span>
                <span class="value">${callbackData.CVSStoreID}</span>
            </div>
            ` : ''}
            ${callbackData.CVSStoreName ? `
            <div class="info-row">
                <span class="label">店鋪名稱：</span>
                <span class="value">${callbackData.CVSStoreName}</span>
            </div>
            ` : ''}
            ${callbackData.CVSAddress ? `
            <div class="info-row">
                <span class="label">店鋪地址：</span>
                <span class="value">${callbackData.CVSAddress}</span>
            </div>
            ` : ''}
            ${callbackData.CVSTelephone ? `
            <div class="info-row">
                <span class="label">店鋪電話：</span>
                <span class="value">${callbackData.CVSTelephone}</span>
            </div>
            ` : ''}
            ${callbackData.CVSOutSide ? `
            <div class="info-row">
                <span class="label">店鋪位置：</span>
                <span class="value">${callbackData.CVSOutSide === "1" ? "離島" : "本島"}</span>
            </div>
            ` : ''}
            ${callbackData.ExtraData ? `
            <div class="info-row">
                <span class="label">額外資訊：</span>
                <span class="value">${callbackData.ExtraData}</span>
            </div>
            ` : ''}
        </div>
        
        <button class="close-btn" onclick="window.close()">關閉視窗</button>
        
        <script>
            // 將選擇結果傳遞給父視窗（如果有的話）
            if (window.opener && typeof window.opener.onEcpayStoreSelected === 'function') {
                window.opener.onEcpayStoreSelected(${JSON.stringify(storeInfo)});
            }
            
            // 如果是在 iframe 中，嘗試向父視窗傳遞訊息
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'ECPAY_STORE_SELECTED',
                    data: ${JSON.stringify(storeInfo)}
                }, '*');
            }
            
            // 5秒後自動關閉視窗
            setTimeout(() => {
                window.close();
            }, 5000);
        </script>
    </div>
</body>
</html>`

    res.send(successHtml)

  } catch (error: any) {
    console.error('❌ 電子地圖回調處理失敗:', error)
    res.status(500).json({
      success: false,
      message: "回調處理失敗",
      error: error.message
    })
  }
}

export async function GET(req: Request, res: Response) {
  res.json({
    success: true,
    message: "ECPay 電子地圖回調端點",
    description: "此端點用於接收用戶選擇店鋪後的回調資料",
    expectedParams: [
      "MerchantID",
      "MerchantTradeNo", 
      "LogisticsSubType",
      "CVSStoreID",
      "CVSStoreName",
      "CVSAddress",
      "CVSTelephone",
      "CVSOutSide",
      "ExtraData"
    ]
  })
}
