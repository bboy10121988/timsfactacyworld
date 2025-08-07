"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { revalidateTag } from "next/cache"
import { getAuthHeaders, getCacheTag } from "./cookies"

/**
 * 設置購物車的配送方式
 * @param cartId 購物車ID
 * @param shippingMethodId 配送方式ID
 * @returns 
 */
export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  if (!cartId) {
    console.error("❌ 設置配送方法失敗: 缺少購物車ID")
    throw new Error("Missing cart ID when setting shipping method")
  }
  
  if (!shippingMethodId) {
    console.error("❌ 設置配送方法失敗: 缺少配送方式ID")
    throw new Error("Missing shipping method ID when setting shipping method")
  }
  
  console.log("🚚 嘗試設置配送方法，cartId:", cartId, "shippingMethodId:", shippingMethodId)
  
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    console.log("🚚 正在呼叫 SDK API 設置配送方法...", {
      cartId,
      option_id: shippingMethodId,
      headers
    })
    
    // 首先檢查 SDK 是否正確初始化
    if (!sdk || !sdk.store || !sdk.store.cart || !sdk.store.cart.addShippingMethod) {
      console.error("❌ SDK 未正確初始化")
      throw new Error("SDK not properly initialized")
    }
    
    // 使用 try-catch 包裝每一個可能失敗的操作
    try {
      console.log("🚚 正在傳遞參數:", {
        cartId,
        shippingMethodData: { option_id: shippingMethodId },
        customHeaders: headers
      })
      
      // 更詳細地記錄 SDK 方法呼叫的參數
      const response = await sdk.store.cart.addShippingMethod(
        cartId, 
        { option_id: shippingMethodId }, 
        {}, 
        headers
      )
      
      if (!response) {
        console.error("❌ SDK 調用返回空響應")
        throw new Error("SDK returned empty response")
      }
      
      console.log("✅ 成功設置配送方法，回應:", response)
      
      // 重新驗證緩存
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      
      return response
    } catch (sdkError) {
      console.error("❌ SDK 調用失敗:", sdkError)
      
      // 記錄更多有關 SDK 錯誤的信息
      if (sdkError instanceof Error) {
        console.error("SDK 錯誤名稱:", sdkError.name)
        console.error("SDK 錯誤消息:", sdkError.message)
        console.error("SDK 錯誤堆棧:", sdkError.stack)
      }
      
      throw sdkError
    }
  } catch (error) {
    console.error("❌ 設置配送方法失敗:", error)
    
    // 嘗試手動 API 呼叫作為備用方案
    try {
      console.log("🔄 嘗試手動呼叫 API 設置配送方法...")
      const res = await fetch(`/api/store/carts/${cartId}/shipping-methods`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ option_id: shippingMethodId }),
      })
      
      if (!res.ok) {
        console.error("❌ 手動 API 呼叫失敗，狀態碼:", res.status, "狀態文本:", res.statusText)
        
        // 添加額外日誌以診斷問題
        try {
          const errorText = await res.text()
          console.error("錯誤響應內容:", errorText)
        } catch (textError) {
          console.error("無法讀取錯誤響應內容:", textError)
        }
        
        throw new Error(`Failed to set shipping method: ${res.status} ${res.statusText}`)
      }
      
      const data = await res.json()
      console.log("✅ 手動 API 呼叫成功，回應:", data)
      
      // 重新驗證緩存
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      
      return data
    } catch (fetchError) {
      console.error("❌ 手動 API 呼叫也失敗:", fetchError)
      // 使用最後一個捕獲的錯誤（fetchError）而不是原始錯誤
      throw medusaError(fetchError || error)
    }
  }
}

/**
 * 獲取購物車可用的配送方式
 * @param cartId 購物車ID
 * @returns 可用的配送方式列表
 */
export async function getCartShippingOptions(cartId: string) {
  console.log("🔍 嘗試獲取購物車配送選項，cartId:", cartId)

  if (!cartId) {
    console.error("❌ 獲取配送選項失敗: 缺少購物車ID")
    return []
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    console.log("🔍 正在嘗試使用 SDK 獲取配送選項...")
    
    // 檢查 SDK 是否正確初始化
    if (sdk?.store?.fulfillment?.listCartOptions) {
      try {
        console.log("🚚 正在傳遞參數:", {
          cart_id: cartId,
          customHeaders: headers
        })
        
        const response = await sdk.store.fulfillment.listCartOptions({ 
          cart_id: cartId 
        }, headers)
        
        if (!response) {
          console.error("❌ SDK 調用返回空響應")
          throw new Error("SDK returned empty response")
        }
        
        // 添加額外的數據驗證，確保返回的數據結構符合預期
        if (!response.shipping_options || !Array.isArray(response.shipping_options)) {
          console.error("❌ SDK 返回的數據格式不正確:", response)
          console.log("✅ 返回空數組作為備用")
          return []
        }
        
        console.log("✅ SDK 成功獲取配送選項，數量:", response.shipping_options.length)
        return response.shipping_options ?? []
      } catch (sdkError) {
        console.error("❌ SDK 獲取配送選項失敗:", sdkError)
        
        // 記錄更多有關 SDK 錯誤的信息
        if (sdkError instanceof Error) {
          console.error("SDK 錯誤名稱:", sdkError.name)
          console.error("SDK 錯誤消息:", sdkError.message)
          console.error("SDK 錯誤堆棧:", sdkError.stack)
        }
        
        // 繼續嘗試使用 fetch API
      }
    } else {
      console.log("⚠️ SDK 方法不可用，使用 fetch API 替代")
    }
    
    // 使用 fetch API 作為備用或主要方法
    console.log("🔍 正在呼叫 API 獲取配送選項...")
    const response = await fetch(`/api/store/shipping-options/${cartId}`, {
      method: "GET",
      headers
    })
    
    if (!response.ok) {
      console.error("❌ API 呼叫失敗，狀態碼:", response.status)
      return []
    }
    
    const data = await response.json()
    console.log("✅ 成功獲取配送選項，數量:", data.shipping_options?.length ?? 0)
    return data.shipping_options ?? []
  } catch (error) {
    console.error("❌ 獲取配送選項失敗:", error)
    
    // 嘗試手動 API 呼叫作為備用方案
    try {
      console.log("🔄 嘗試手動呼叫 API 獲取配送選項...")
      const res = await fetch(`/api/store/shipping-options/${cartId}`, {
        method: "GET",
        headers
      })
      
      if (!res.ok) {
        console.error("❌ 手動 API 呼叫失敗，狀態碼:", res.status, "狀態文本:", res.statusText)
        
        // 添加額外日誌以診斷問題
        try {
          const errorText = await res.text()
          console.error("錯誤響應內容:", errorText)
        } catch (textError) {
          console.error("無法讀取錯誤響應內容:", textError)
        }
        
        return []
      }
      
      const data = await res.json()
      console.log("✅ 手動 API 呼叫成功，配送選項數量:", data.shipping_options?.length ?? 0)
      return data.shipping_options ?? []
    } catch (fetchError) {
      console.error("❌ 手動 API 呼叫也失敗:", fetchError)
      return []
    }
  }
}
