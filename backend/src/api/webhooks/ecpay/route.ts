import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { addTradeMapping, getTradeMapping, removeTradeMapping } from "../../../utils/trade-mapping"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const timestamp = new Date().toISOString()
  console.log('🔔 ========== ECPay Webhook Callback Received ==========')
  console.log(`⏰ Timestamp: ${timestamp}`)
  console.log(`🌐 Request URL: ${req.url}`)
  console.log(`📡 Request Method: ${req.method}`)
  console.log(`🔗 Request Headers:`, JSON.stringify(req.headers, null, 2))
  console.log(`📦 Raw Callback Data:`, JSON.stringify(req.body, null, 2))
  
  try {
    const callbackData = req.body as any
    const { 
      MerchantTradeNo, 
      RtnCode, 
      RtnMsg, 
      TradeNo, 
      TradeAmt, 
      PaymentDate,
      PaymentType
    } = callbackData

    console.log(`💳 ECPay Transaction Details:`)
    console.log(`   - MerchantTradeNo: ${MerchantTradeNo}`)
    console.log(`   - RtnCode: ${RtnCode}`)
    console.log(`   - RtnMsg: ${RtnMsg}`)
    console.log(`   - TradeNo: ${TradeNo}`)
    console.log(`   - TradeAmt: ${TradeAmt}`)
    console.log(`   - PaymentDate: ${PaymentDate}`)
    console.log(`   - PaymentType: ${PaymentType}`)

    // 檢查支付是否成功
    if (RtnCode !== '1') {
      console.log(`❌ Payment failed with code ${RtnCode}: ${RtnMsg}`)
      res.status(200).send('0|Payment failed')
      return
    }

    console.log('✅ Payment successful, processing order...')

    // 1. 首先嘗試從 trade mapping 系統中查找購物車 ID
    let cartId = getTradeMapping(MerchantTradeNo)
    
    if (cartId) {
      console.log(`🔍 Found cart in memory: ${cartId}`)
    } else {
      console.log(`⚠️ No cart mapping found in memory, searching in database...`)
      
      // 2. 使用 Medusa 的 API 搜尋所有購物車
      const fetch = require('node-fetch')
      
      try {
        console.log(`🔍 Searching for carts with MerchantTradeNo ${MerchantTradeNo} in metadata...`)
        
        // 從資料庫尋找帶有對應 MerchantTradeNo 的購物車
        const manager: any = req.scope.resolve("manager")
        
        const cartResult = await manager.query(
          `SELECT id FROM "cart" 
           WHERE metadata::jsonb ? 'ecpay_merchant_trade_no' 
           AND metadata::jsonb->>'ecpay_merchant_trade_no' = $1
           LIMIT 1`,
          [MerchantTradeNo]
        )
        
        if (cartResult && cartResult.length > 0) {
          cartId = cartResult[0].id
          console.log(`🔍 Found cart in database: ${cartId}`)
          
          // 更新內存映射以備後用
          if (cartId) {
            addTradeMapping(MerchantTradeNo, cartId, parseInt(TradeAmt))
          }
        } else {
          console.log(`❌ No cart found with MerchantTradeNo ${MerchantTradeNo} in metadata`)
          
          // 3. 嘗試從最近的未完成購物車中查找（作為最後手段）
          console.log(`🔍 Searching recent incomplete carts as last resort...`)
          const recentCartsResult = await manager.query(
            `SELECT id, created_at, metadata FROM "cart" 
             WHERE completed_at IS NULL 
             ORDER BY created_at DESC 
             LIMIT 5`
          )
          
          console.log(`ℹ️ Found ${recentCartsResult.length} recent incomplete carts`)
          
          if (recentCartsResult && recentCartsResult.length > 0) {
            // 選擇最近創建的未完成購物車
            const fallbackCartId = recentCartsResult[0].id;
            if (fallbackCartId) {
              cartId = fallbackCartId;
              console.log(`🔍 Using most recent cart as fallback: ${cartId}`);
              console.log(`⚠️ Warning: This is a fallback method and may not be the correct cart!`);
              // 將映射存入內存供後續使用
              addTradeMapping(MerchantTradeNo, cartId as string, parseInt(TradeAmt));
              // 更新這個購物車的 metadata 以記錄 ECPay 訊息
              await manager.query(
                `UPDATE "cart" 
                 SET metadata = jsonb_set(
                   COALESCE(metadata, '{}'::jsonb), 
                   '{ecpay_merchant_trade_no}', 
                   '"${MerchantTradeNo}"'::jsonb
                 )
                 WHERE id = $1`,
                [cartId]
              );
              console.log(`✅ Updated cart metadata with MerchantTradeNo: ${MerchantTradeNo}`);
            }
          }
        }
      } catch (searchError) {
        console.error('❌ Error searching for carts:', searchError)
      }
    }

    // 檢查是否找到了購物車
    if (!cartId) {
      console.log(`❌ No cart found for MerchantTradeNo: ${MerchantTradeNo}`)
      res.status(200).send('0|Cart not found')
      return
    }

    console.log(`🛒 Using cart ID: ${cartId}`)

    try {
      console.log('🚀 Attempting to complete cart via Store API...')
      
      // 使用 node-fetch 調用 Store API 完成購物車
      const fetch = require('node-fetch')
      const apiKey = 'pk_12345678901234567890123456789012'
      
      // 先檢查購物車狀態
      const cartResponse = await fetch(`http://localhost:9000/store/carts/${cartId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': apiKey
        }
      })
      
      if (!cartResponse.ok) {
        const errorText = await cartResponse.text()
        console.log(`❌ Cart retrieval failed: ${errorText}`)
        res.status(200).send('0|Cart retrieval failed')
        return
      }
      
      const cartData = await cartResponse.json()
      console.log(`📊 Current cart status:`)
      console.log(`   - Completed: ${cartData.cart.completed_at ? 'Yes' : 'No'}`)
      console.log(`   - Total: ${cartData.cart.total}`)
      console.log(`   - Items: ${cartData.cart.items?.length || 0}`)
      console.log(`   - Metadata:`, JSON.stringify(cartData.cart.metadata, null, 2))
      
      // 如果購物車已經完成，不需要再次完成
      if (cartData.cart.completed_at) {
        console.log(`⚠️ Cart already completed at ${cartData.cart.completed_at}`)
        res.status(200).send('1|Cart already completed')
        return
      }
      
      // 確保購物車有電子郵件地址
      if (!cartData.cart.email) {
        console.log(`⚠️ Cart has no email, trying to set a default one...`)
        
        // 設置一個默認的電子郵件地址
        const emailUpdateResponse = await fetch(`http://localhost:9000/store/carts/${cartId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': apiKey
          },
          body: JSON.stringify({
            email: `customer-${Date.now()}@example.com`
          })
        })
        
        if (!emailUpdateResponse.ok) {
          console.log(`❌ Failed to set email on cart`)
        } else {
          console.log(`✅ Default email set on cart`)
        }
      }
      
      // 確保購物車準備完成（有配送地址等）
      if (!cartData.cart.shipping_address_id || !cartData.cart.shipping_methods?.length) {
        console.log(`❌ Cart not ready for completion:`)
        console.log(`   - Email: ${cartData.cart.email || 'Missing'}`)
        console.log(`   - Shipping Address: ${cartData.cart.shipping_address_id || 'Missing'}`)
        console.log(`   - Shipping Methods: ${cartData.cart.shipping_methods?.length || 0}`)
        res.status(200).send('0|Cart not ready for completion')
        return
      }
      
      // 嘗試完成購物車
      console.log(`🚀 Completing cart ${cartId}...`)
      const completeResponse = await fetch(`http://localhost:9000/store/carts/${cartId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': apiKey
        },
        body: JSON.stringify({})
      })

      if (completeResponse.ok) {
        const orderResult = await completeResponse.json()
        console.log(`🎉 Order created successfully!`)
        console.log(`   - Order ID: ${orderResult.order?.id}`)
        console.log(`   - Order Status: ${orderResult.order?.status}`)
        console.log(`   - Payment Status: ${orderResult.order?.payment_status}`)
        console.log(`   - Total: ${orderResult.order?.currency_code} ${orderResult.order?.total}`)
        
        // 清除 trade mapping（訂單已完成）
        removeTradeMapping(MerchantTradeNo)
        console.log(`🗑️ Trade mapping cleaned up for ${MerchantTradeNo}`)
        
        // 回應 ECPay：成功
        res.status(200).send('1|OK')
        return
        
      } else {
        const errorText = await completeResponse.text()
        console.log(`❌ Cart completion failed: ${errorText}`)
        
        // 即使失敗也要回應 ECPay 避免重複回調
        res.status(200).send('0|Cart completion failed')
        return
      }

    } catch (orderError) {
      console.error('❌ Order creation error:', orderError)
      
      // 記錄錯誤但仍回應 ECPay
      res.status(200).send('0|Order creation error')
      return
    }

  } catch (error: any) {
    console.error('❌ Callback processing error:', error)
    
    // 即使出錯也要正確回應 ECPay
    res.status(200).send('0|Callback error')
    return
  }
}

// 處理 OPTIONS 請求（CORS 預檢）
export const OPTIONS = (
  req: MedusaRequest,
  res: MedusaResponse
): void => {
  res.status(200).end()
}
