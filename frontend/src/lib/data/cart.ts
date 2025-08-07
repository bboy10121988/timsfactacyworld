"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  setCartId,
} from "./cookies"
import { getRegion } from "./regions"

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @returns The cart object if found, or null if not found.
 */
export async function retrieveCart(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    // 這是正常情況 - 新用戶還沒有購物車
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("carts")),
  }

  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: {
        fields:
          "*items, *region, *items.product, *items.variant, *items.variant.options, *items.variant.options.option, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name",
      },
      headers,
      next,
      cache: "no-store", // 不緩存購物車資料，確保每次都是最新的
    })
    .then(({ cart }) => cart)
    .catch((error) => {
      // 只在真正的錯誤時記錄，而不是沒有購物車時
      if (error.status !== 404) {
        // 在開發環境才顯示錯誤
        if (process.env.NODE_ENV === 'development') {
          console.error("❌ retrieveCart 失敗:", error)
        }
      }
      return null
    })
}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let cart = await retrieveCart()

  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!cart) {
    try {
      const cartResp = await sdk.store.cart.create(
        { region_id: region.id },
        {},
        headers
      )
      cart = cartResp.cart

      await setCartId(cart.id)

      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
    } catch (error) {
      throw error
    }
  }

  if (cart && cart?.region_id !== region.id) {
    try {
      await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
    } catch (error) {
      throw error
    }
  }

  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  try {
    const cart = await getOrSetCart(countryCode)

    if (!cart) {
      throw new Error("Error retrieving or creating cart")
    }

    const headers = {
      ...(await getAuthHeaders()),
    }

    await sdk.store.cart
      .createLineItem(
        cart.id,
        {
          variant_id: variantId,
          quantity,
        },
        {},
        headers
      )
      .then(async (response) => {
        const cartCacheTag = await getCacheTag("carts")
        revalidateTag(cartCacheTag)

        const fulfillmentCacheTag = await getCacheTag("fulfillment")
        revalidateTag(fulfillmentCacheTag)
      })
      .catch((error) => {
        throw error
      })
  } catch (error) {
    throw error
  }
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .updateLineItem(
      cartId,
      lineId,
      {
        quantity,
      },
      {},
      headers
    )
    .then(async (response) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

      return response
    })
    .catch(medusaError)
}

/**
 * 從購物車中刪除商品
 * @param lineId 商品行項目ID
 * @returns 
 */
export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    console.error("❌ 刪除商品失敗: 缺少商品ID")
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    console.error("❌ 刪除商品失敗: 缺少購物車ID")
    throw new Error("Missing cart ID when deleting line item")
  }

  console.log("🗑️ 嘗試刪除購物車商品，cartId:", cartId, "lineId:", lineId)
  
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    // 檢查 SDK 是否正確初始化
    if (!sdk || !sdk.store || !sdk.store.cart || !sdk.store.cart.deleteLineItem) {
      console.error("❌ SDK 未正確初始化")
      throw new Error("SDK not properly initialized")
    }

    const response = await sdk.store.cart.deleteLineItem(cartId, lineId, headers)
    console.log("✅ 成功刪除商品，回應:", response)
    
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)

    const fulfillmentCacheTag = await getCacheTag("fulfillment")
    revalidateTag(fulfillmentCacheTag)
    
    return response
  } catch (error) {
    console.error("❌ 刪除商品失敗:", error)
    throw medusaError(error)
  }
}

export async function removeLineItem(lineId: string) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when removing line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when removing line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .deleteLineItem(cartId, lineId, headers)
    .then(async (response) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

      return response
    })
    .catch(medusaError)
}

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
    
    // 嘗試手動 API 呼叫
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

export async function completeCart(cartId: string) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const cartRes = await sdk.store.cart.complete(cartId, {}, headers)

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)

    const fulfillmentCacheTag = await getCacheTag("fulfillment")
    revalidateTag(fulfillmentCacheTag)

    await removeCartId()

    return cartRes
  } catch (error) {
    console.error("❌ completeCart 失敗:", error)
    throw medusaError(error)
  }
}

/**
 * Places an order for a cart. If no cart ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to place an order for.
 * @returns The cart object if the order was successful, or null if not.
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    throw new Error("No existing cart found when placing an order")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    console.log("🛒 嘗試完成訂單，cartId:", id)
    const cartRes = await sdk.store.cart.complete(id, {}, headers)
    console.log("✅ 訂單完成結果:", cartRes)

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)

    if (cartRes?.type === "order") {
      console.log("✅ 訂單創建成功，訂單ID:", cartRes.order.id)
      const countryCode = cartRes.order.shipping_address?.country_code?.toLowerCase()

      const orderCacheTag = await getCacheTag("orders")
      revalidateTag(orderCacheTag)

      await removeCartId()
      return { success: true, order: cartRes.order }
    }

    return { success: true, cart: cartRes.cart }
  } catch (error) {
    console.error("❌ placeOrder 失敗:", error)
    throw medusaError(error)
  }
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = await getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const data = {
      shipping_address: {
        first_name: formData.get("shipping_address.first_name"),
        last_name: formData.get("shipping_address.last_name"),
        address_1: formData.get("shipping_address.address_1"),
        address_2: "",
        company: formData.get("shipping_address.company"),
        postal_code: formData.get("shipping_address.postal_code"),
        city: formData.get("shipping_address.city"),
        country_code: formData.get("shipping_address.country_code"),
        province: formData.get("shipping_address.province"),
        phone: formData.get("shipping_address.phone"),
      },
      email: formData.get("email"),
    } as any

    const sameAsBilling = formData.get("same_as_billing")
    if (sameAsBilling === "on") data.billing_address = data.shipping_address

    if (sameAsBilling !== "on")
      data.billing_address = {
        first_name: formData.get("billing_address.first_name"),
        last_name: formData.get("billing_address.last_name"),
        address_1: formData.get("billing_address.address_1"),
        address_2: "",
        company: formData.get("billing_address.company"),
        postal_code: formData.get("billing_address.postal_code"),
        city: formData.get("billing_address.city"),
        country_code: formData.get("billing_address.country_code"),
        province: formData.get("billing_address.province"),
        phone: formData.get("billing_address.phone"),
      }
    
    console.log("📝 設置地址，cartId:", cartId, "data:", data)
    await updateCart(data)
  } catch (e: any) {
    console.error("❌ 設置地址失敗:", e)
    return e.message
  }

  redirect(
    `/${formData.get("shipping_address.country_code")}/checkout?step=delivery`
  )
}

/**
 * 應用促銷代碼到購物車
 * @param codes 促銷代碼數組
 * @returns 
 */
export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("無法獲取購物車 ID，請先添加商品到購物車")
  }

  // 確保 codes 是有效的字符串數組
  const validCodes = codes.filter(code => typeof code === 'string' && code.trim() !== '')
  
  console.log("🏷️ 嘗試應用促銷代碼，cartId:", cartId, "codes:", validCodes)

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    // 檢查 SDK 是否正確初始化
    if (!sdk || !sdk.store || !sdk.store.cart || !sdk.store.cart.update) {
      console.error("❌ SDK 未正確初始化")
      throw new Error("SDK not properly initialized")
    }

    const response = await sdk.store.cart
      .update(cartId, { promo_codes: validCodes }, {}, headers)
    
    console.log("✅ 成功應用促銷代碼，回應:", response)
    
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)

    const fulfillmentCacheTag = await getCacheTag("fulfillment")
    revalidateTag(fulfillmentCacheTag)
    
    return response
  } catch (error) {
    console.error("❌ 應用促銷代碼失敗:", error)
    throw medusaError(error)
  }
}

/**
 * 提交促銷表單
 * @param currentState 當前狀態
 * @param formData 表單數據
 * @returns 
 */
export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  console.log("🏷️ 提交促銷表單，code:", code)
  
  try {
    return await applyPromotions([code])
  } catch (e: any) {
    console.error("❌ 提交促銷表單失敗:", e)
    return e.message
  }
}

/**
 * 獲取購物車的配送選項列表
 * @returns 配送選項列表
 */
export async function listCartOptions() {
  const cartId = await getCartId()
  
  // 如果沒有購物車 ID，返回空的運送選項
  if (!cartId) {
    console.log("⚠️ 沒有購物車 ID，返回空的配送選項列表")
    return { shipping_options: [] }
  }
  
  console.log("🔍 嘗試獲取購物車配送選項列表，cartId:", cartId)
  
  const headers = {
    ...(await getAuthHeaders()),
  }
  
  try {
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
          return { shipping_options: [] }
        }
        
        console.log("✅ SDK 成功獲取配送選項，數量:", response.shipping_options?.length ?? 0)
        return response
      } catch (sdkError) {
        console.error("❌ SDK 獲取配送選項失敗:", sdkError)
        // 繼續嘗試使用 fetch API
      }
    } else {
      console.log("⚠️ SDK 方法不可用，使用 fetch API 替代")
    }
    
    // 使用 fetch API 作為備用或主要方法
    console.log("🔍 正在呼叫 API 獲取配送選項...")
    const response = await fetch(`/api/store/shipping-options?cart_id=${cartId}`, {
      method: "GET",
      headers,
      cache: "no-store"
    })
    
    if (!response.ok) {
      console.error("❌ API 呼叫失敗，狀態碼:", response.status)
      return { shipping_options: [] }
    }
    
    const data = await response.json()
    console.log("✅ 成功獲取配送選項，數量:", data.shipping_options?.length ?? 0)
    return data
  } catch (error) {
    console.error("❌ 獲取配送選項失敗:", error)
    return { shipping_options: [] }
  }
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  console.log("💰 嘗試初始化支付會話，cart id:", cart.id, "payment data:", data)
  
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    console.log("💰 正在呼叫 SDK API 初始化支付會話...")
    const response = await sdk.store.payment.initiatePaymentSession(cart, data, {}, headers)
    console.log("✅ 支付會話初始化成功")
    
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    
    return response
  } catch (error) {
    console.error("❌ 支付會話初始化失敗:", error)
    
    // 嘗試手動 API 呼叫
    try {
      console.log("🔄 嘗試手動呼叫 API 初始化支付會話...")
      const res = await fetch(`/api/store/payment-sessions`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          cart_id: cart.id,
          ...data
        }),
      })
      
      if (!res.ok) {
        console.error("❌ 手動 API 呼叫失敗，狀態碼:", res.status)
        throw new Error(`Failed to initiate payment session: ${res.statusText}`)
      }
      
      const responseData = await res.json()
      console.log("✅ 手動 API 呼叫成功")
      
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      
      return responseData
    } catch (fetchError) {
      console.error("❌ 手動 API 呼叫也失敗:", fetchError)
      throw medusaError(error)
    }
  }
}