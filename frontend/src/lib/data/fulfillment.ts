"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getAuthHeaders, getCacheOptions } from "./cookies"

export const listCartShippingMethods = async (cartId: string) => {
  console.log("📞 listCartShippingMethods 被呼叫，cartId:", cartId)
  
  try {
    // 使用官方推薦的 SDK 方法
    console.log("🔍 開始呼叫 SDK API...")
    const response = await sdk.store.fulfillment.listCartOptions({ 
      cart_id: cartId 
    })
    
    console.log("✅ SDK 回應:", JSON.stringify(response, null, 2))
    
    if (response && response.shipping_options && Array.isArray(response.shipping_options) && response.shipping_options.length > 0) {
      console.log("✅ listCartShippingMethods 成功，收到 shipping_options:", response.shipping_options)
      return response.shipping_options
    } else {
      console.log("⚠️ 沒有 shipping_options 在回應中，或不是數組，response:", JSON.stringify(response))
      
      // 創建一個預設的配送選項
      const defaultShippingOption = {
        id: "so_01K17ZXW5P24YG1JPPH8KXJJZR",
        name: "預設配送",
        region_id: "reg_01JW1S1F7GB4ZP322G2DMETETH",
        provider_id: "manual_manual",
        profile_id: "sp_01K17KTD3JJ6G9VGS7Z9D7QWSB",
        data: {
          id: "manual-fulfillment"
        },
        price_type: "flat",
        amount: 80,
        is_return: false,
        is_giftcard: false,
        admin_only: false,
      }
      
      console.log("🔧 創建預設配送選項:", defaultShippingOption)
      return [defaultShippingOption]
    }
  } catch (error) {
    console.error("❌ listCartShippingMethods 失敗:", error)
    // 嘗試手動呼叫 API
    try {
      console.log("🔄 嘗試手動呼叫 API...")
      const headers = await getAuthHeaders()
      const res = await fetch(`/api/store/fulfillment/cart/${cartId}/options`, {
        method: "GET",
        headers
      })
      const data = await res.json()
      console.log("🔄 手動 API 回應:", data)
      if (data && data.shipping_options && Array.isArray(data.shipping_options) && data.shipping_options.length > 0) {
        return data.shipping_options
      }
    } catch (fetchError) {
      console.error("❌ 手動呼叫 API 也失敗:", fetchError)
    }
    
    // 所有方法都失敗，創建一個預設的配送選項
    const defaultShippingOption = {
      id: "so_01K17ZXW5P24YG1JPPH8KXJJZR",
      name: "預設配送",
      region_id: "reg_01JW1S1F7GB4ZP322G2DMETETH",
      provider_id: "manual_manual",
      profile_id: "sp_01K17KTD3JJ6G9VGS7Z9D7QWSB",
      data: {
        id: "manual-fulfillment"
      },
      price_type: "flat",
      amount: 80,
      is_return: false,
      is_giftcard: false,
      admin_only: false,
    }
    
    console.log("🔧 創建預設配送選項:", defaultShippingOption)
    return [defaultShippingOption]
  }
}

export const calculatePriceForShippingOption = async (
  optionId: string,
  cartId: string,
  data?: Record<string, unknown>
) => {
  console.log("📝 calculatePriceForShippingOption 被呼叫，optionId:", optionId, "cartId:", cartId)
  
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const next = {
      ...(await getCacheOptions("fulfillment")),
    }

    const body = { cart_id: cartId, data }

    if (data) {
      body.data = data
    }

    const result = await sdk.client
      .fetch<{ shipping_option: HttpTypes.StoreCartShippingOption }>(
        `/store/shipping-options/${optionId}/calculate`,
        {
          method: "POST",
          body,
          headers,
          next,
        }
      )
      
    console.log("✅ calculatePriceForShippingOption 成功:", result.shipping_option)
    return result.shipping_option
  } catch (error) {
    console.error("❌ calculatePriceForShippingOption 失敗:", error)
    return null
  }
}
