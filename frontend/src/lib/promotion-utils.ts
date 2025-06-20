import { HttpTypes } from "@medusajs/types"
import { getProductPromotions, getProductInventoryStatus } from "@lib/data/promotions"

// 促銷標籤類型定義
export type PromotionLabelType = 
  | 'auto-discount'      // 自動計算折扣
  | 'manual-discount'    // 手動設置折扣
  | 'promotion'          // 自定義促銷文字
  | 'campaign'           // 促銷活動
  | 'discount-code'      // 折扣碼提示
  | 'new'                // 新品
  | 'hot'                // 熱銷
  | 'limited'            // 限量
  | 'bestseller'         // 暢銷
  | 'featured'           // 精選
  | 'sale'               // 特價
  | 'special-event'      // 特殊活動
  | 'preorder'           // 預訂
  | 'sold-out'           // 售完
  | 'bundle'             // 組合優惠
  | 'flash-sale'         // 限時搶購
  | 'clearance'          // 清倉
  | 'exclusive'          // 獨家

export interface PromotionLabel {
  type: PromotionLabelType
  text: string
  priority: number
  className: string
  isDiscount?: boolean
}

// 標籤優先級配置（數字越小優先級越高）
const LABEL_PRIORITIES: Record<PromotionLabelType, number> = {
  'sold-out': 1,
  'flash-sale': 2,
  'auto-discount': 3,
  'manual-discount': 4,
  'clearance': 5,
  'campaign': 6,
  'bundle': 7,
  'exclusive': 8,
  'limited': 9,
  'promotion': 10,
  'special-event': 11,
  'discount-code': 12,
  'preorder': 13,
  'new': 14,
  'hot': 15,
  'bestseller': 16,
  'featured': 17,
  'sale': 18,
}

// 標籤文字對照表
const LABEL_TEXTS: Record<PromotionLabelType, string> = {
  'auto-discount': '{discount}% OFF',
  'manual-discount': '{text}',
  'promotion': '{text}',
  'campaign': '{text}',
  'discount-code': '輸入折扣碼享優惠',
  'new': 'NEW',
  'hot': 'HOT',
  'limited': 'LIMITED',
  'bestseller': 'BEST',
  'featured': 'FEATURED',
  'sale': 'SALE',
  'special-event': '{text}',
  'preorder': '預訂',
  'sold-out': '售完',
  'bundle': '組合優惠',
  'flash-sale': '限時搶購',
  'clearance': '清倉特價',
  'exclusive': '獨家',
}

// 計算商品折扣資訊
export function calculateProductDiscount(product: HttpTypes.StoreProduct) {
  if (!product.variants || product.variants.length === 0) {
    return { hasDiscount: false, discountPercentage: 0, maxDiscount: 0, averageDiscount: 0 }
  }

  let maxDiscountPercentage = 0
  let totalDiscount = 0
  let discountedVariants = 0
  let hasAnyDiscount = false

  product.variants.forEach(variant => {
    if (variant.calculated_price) {
      const calculatedAmount = variant.calculated_price.calculated_amount
      const originalAmount = variant.calculated_price.original_amount
      
      if (originalAmount && calculatedAmount && originalAmount > calculatedAmount) {
        const discountPercentage = Math.round(((originalAmount - calculatedAmount) / originalAmount) * 100)
        if (discountPercentage > maxDiscountPercentage) {
          maxDiscountPercentage = discountPercentage
        }
        totalDiscount += discountPercentage
        discountedVariants++
        hasAnyDiscount = true
      }
    }
  })

  const averageDiscount = discountedVariants > 0 ? Math.round(totalDiscount / discountedVariants) : 0

  return {
    hasDiscount: hasAnyDiscount,
    discountPercentage: maxDiscountPercentage,
    maxDiscount: maxDiscountPercentage,
    averageDiscount
  }
}

// 檢查商品庫存狀態
export function getProductStockStatus(product: HttpTypes.StoreProduct) {
  if (!product.variants || product.variants.length === 0) {
    return { isOutOfStock: false, canPreorder: false, isSoldOut: false, hasStock: true }
  }
  
  const allVariantsStatus = product.variants.map(variant => {
    // 如果不管理庫存，則永遠有庫存
    if (!variant.manage_inventory) {
      return { hasStock: true, canPreorder: false, isSoldOut: false }
    }
    
    // 檢查庫存數量
    const hasStock = variant.inventory_quantity !== undefined && variant.inventory_quantity > 0
    
    if (hasStock) {
      return { hasStock: true, canPreorder: false, isSoldOut: false }
    } else {
      if (variant.allow_backorder) {
        return { hasStock: false, canPreorder: true, isSoldOut: false }
      } else {
        return { hasStock: false, canPreorder: false, isSoldOut: true }
      }
    }
  })
  
  const hasAnyStock = allVariantsStatus.some(status => status.hasStock)
  const canAnyPreorder = allVariantsStatus.some(status => status.canPreorder)
  const allSoldOut = allVariantsStatus.every(status => status.isSoldOut)
  
  return {
    isOutOfStock: !hasAnyStock,
    canPreorder: !hasAnyStock && canAnyPreorder,
    isSoldOut: allSoldOut,
    hasStock: hasAnyStock
  }
}

// 格式化折扣文字
function formatDiscountText(text: string): string {
  if (!text || typeof text !== 'string') return ''
  
  let displayText = text.trim()
  
  // 智能格式化折扣文字
  if (!displayText.includes('%') && !displayText.toLowerCase().includes('off') && !displayText.toLowerCase().includes('折')) {
    if (/^\d+$/.test(displayText)) {
      displayText = `${displayText}% OFF`
    }
  } else if (displayText.includes('%') && !displayText.toLowerCase().includes('off')) {
    displayText = `${displayText} OFF`
  }
  
  return displayText
}

// 從 metadata 獲取促銷標籤
function getMetadataLabels(product: HttpTypes.StoreProduct): PromotionLabel[] {
  const labels: PromotionLabel[] = []
  const metadata = product.metadata || {}

  // 手動設置的折扣標籤
  const discount = metadata.discount
  if (discount && typeof discount === 'string' && discount.trim()) {
    const displayText = formatDiscountText(discount)
    if (displayText) {
      labels.push({
        type: 'manual-discount',
        text: displayText,
        priority: LABEL_PRIORITIES['manual-discount'],
        className: 'product-label discount',
        isDiscount: true
      })
    }
  }

  // 促銷活動標籤
  const promotion = metadata.promotion
  const promotionType = metadata.promotion_type
  
  if (promotion && typeof promotion === 'string' && promotion.trim()) {
    const safePromotionType = (promotionType && typeof promotionType === 'string') ? promotionType : 'promotion'
    labels.push({
      type: 'promotion',
      text: promotion.trim(),
      priority: LABEL_PRIORITIES['promotion'],
      className: `product-label ${safePromotionType.toLowerCase()}`
    })
  } else if (promotionType && typeof promotionType === 'string' && promotionType !== 'none') {
    const labelText = LABEL_TEXTS[promotionType as PromotionLabelType]
    if (labelText && labelText !== '{text}') {
      labels.push({
        type: promotionType as PromotionLabelType,
        text: labelText,
        priority: LABEL_PRIORITIES[promotionType as PromotionLabelType] || 99,
        className: `product-label ${promotionType.toLowerCase()}`
      })
    }
  }

  // 特殊活動標籤
  const specialEvent = metadata.special_event
  if (specialEvent && typeof specialEvent === 'string' && specialEvent.trim()) {
    labels.push({
      type: 'special-event',
      text: specialEvent.trim(),
      priority: LABEL_PRIORITIES['special-event'],
      className: 'product-label special-event'
    })
  }

  // 活動類型標籤
  const campaign = metadata.campaign
  if (campaign && typeof campaign === 'string' && campaign.trim()) {
    labels.push({
      type: 'campaign',
      text: campaign.trim(),
      priority: LABEL_PRIORITIES['campaign'],
      className: 'product-label campaign'
    })
  }

  // 組合優惠標籤
  const bundle = metadata.bundle
  if (bundle && typeof bundle === 'string' && bundle.trim()) {
    labels.push({
      type: 'bundle',
      text: bundle.trim(),
      priority: LABEL_PRIORITIES['bundle'],
      className: 'product-label bundle'
    })
  }

  // 限時搶購標籤
  const flashSale = metadata.flash_sale
  if (flashSale && (flashSale === 'true' || flashSale === true)) {
    labels.push({
      type: 'flash-sale',
      text: LABEL_TEXTS['flash-sale'],
      priority: LABEL_PRIORITIES['flash-sale'],
      className: 'product-label flash-sale'
    })
  }

  // 清倉標籤
  const clearance = metadata.clearance
  if (clearance && (clearance === 'true' || clearance === true)) {
    labels.push({
      type: 'clearance',
      text: LABEL_TEXTS['clearance'],
      priority: LABEL_PRIORITIES['clearance'],
      className: 'product-label clearance'
    })
  }

  // 獨家標籤
  const exclusive = metadata.exclusive
  if (exclusive && (exclusive === 'true' || exclusive === true)) {
    labels.push({
      type: 'exclusive',
      text: LABEL_TEXTS['exclusive'],
      priority: LABEL_PRIORITIES['exclusive'],
      className: 'product-label exclusive'
    })
  }

  // 折扣碼提示標籤
  const discountCode = metadata.discount_code_available
  if (discountCode && (discountCode === 'true' || discountCode === true)) {
    labels.push({
      type: 'discount-code',
      text: LABEL_TEXTS['discount-code'],
      priority: LABEL_PRIORITIES['discount-code'],
      className: 'product-label discount-code'
    })
  }

  return labels
}

// 獲取所有促銷標籤
export function getPromotionLabels(product: HttpTypes.StoreProduct): PromotionLabel[] {
  const labels: PromotionLabel[] = []
  
  // 計算折扣資訊
  const discountInfo = calculateProductDiscount(product)
  
  // 獲取庫存狀態
  const stockStatus = getProductStockStatus(product)
  
  // 1. 庫存狀態標籤（最高優先級，始終顯示）
  if (stockStatus.isSoldOut) {
    labels.push({
      type: 'sold-out',
      text: LABEL_TEXTS['sold-out'],
      priority: LABEL_PRIORITIES['sold-out'],
      className: 'product-label sold-out'
    })
  } else if (stockStatus.canPreorder) {
    labels.push({
      type: 'preorder',
      text: LABEL_TEXTS['preorder'],
      priority: LABEL_PRIORITIES['preorder'],
      className: 'product-label preorder'
    })
  }

  // 檢查是否使用假資料模式
  if (shouldUseMockLabels()) {
    // 假資料模式：生成假標籤但不覆蓋真實庫存狀態
    const mockLabels = generateMockPromotionLabels(product.id)
    // 過濾掉與真實庫存狀態衝突的假標籤
    const filteredMockLabels = mockLabels.filter(label => {
      // 如果已經有售完標籤，不要添加其他促銷標籤
      if (stockStatus.isSoldOut && ['sale', 'discount', 'flash-sale'].includes(label.type)) {
        return false
      }
      return true
    })
    labels.push(...filteredMockLabels)
  } else {
    // 正常模式：使用真實的促銷邏輯
    
    // 2. 自動計算的折扣標籤
    if (discountInfo.hasDiscount && discountInfo.discountPercentage > 0) {
      labels.push({
        type: 'auto-discount',
        text: `${discountInfo.discountPercentage}% OFF`,
        priority: LABEL_PRIORITIES['auto-discount'],
        className: 'px-2 py-1 text-xs font-semibold rounded-md shadow-lg border bg-stone-800/90 text-white border-white',
        isDiscount: true
      })
    }

    // 3. 從 metadata 獲取標籤（只有在沒有自動折扣時才加入手動折扣）
    const metadataLabels = getMetadataLabels(product)
    metadataLabels.forEach(label => {
      // 如果已經有自動折扣，跳過手動折扣標籤
      if (label.type === 'manual-discount' && discountInfo.hasDiscount) {
        return
      }
      labels.push(label)
    })
  }

  // 按優先級排序並限制顯示數量
  return labels
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3) // 最多顯示3個標籤
}

// 為了除錯，提供詳細的標籤分析
export function debugPromotionLabels(product: HttpTypes.StoreProduct) {
  const discountInfo = calculateProductDiscount(product)
  const stockStatus = getProductStockStatus(product)
  const labels = getPromotionLabels(product)
  
  return {
    productTitle: product.title,
    discountInfo,
    stockStatus,
    metadata: product.metadata,
    generatedLabels: labels,
    variantPrices: product.variants?.map(v => ({
      id: v.id,
      title: v.title,
      original: v.calculated_price?.original_amount,
      calculated: v.calculated_price?.calculated_amount,
      currency: v.calculated_price?.currency_code
    }))
  }
}

// 假資料促銷標籤生成器（用於預覽和測試）
export function generateMockPromotionLabels(productId?: string): PromotionLabel[] {
  // 基於產品ID生成一致的數值用於變化（用於演示）
  const seed = productId ? productId.length + productId.charCodeAt(0) : Math.random() * 100
  const randomValue = (seed * 9301 + 49297) % 233280 / 233280
  
  const mockLabels: PromotionLabel[] = []
  
  // 顯示所有6種 Medusa 行銷模組標籤
  
  // 1. Percentage off product (商品百分比折扣) - 使用脈動金色效果
  const discountPercent = Math.floor((randomValue * 5 + 1) * 10) // 10%-60%
  const taiwanDiscount = (100 - discountPercent) / 10 // 轉換成幾折 (4折-9折)
  const discountText = taiwanDiscount === Math.floor(taiwanDiscount) 
    ? `${taiwanDiscount}折` 
    : `${taiwanDiscount.toFixed(1)}折`
  
  mockLabels.push({
    type: 'auto-discount',
    text: discountText,
    priority: LABEL_PRIORITIES['auto-discount'],
    className: 'px-2 py-1 text-xs font-semibold rounded-md shadow-lg border bg-stone-800/90 text-white border-white',
    isDiscount: true
  })
  
  // 2. Amount off products (商品金額折扣) - 使用新的黑底白字樣式
  const discountAmount = Math.floor((randomValue * 10 + 1) * 50) // NT$50-500
  mockLabels.push({
    type: 'manual-discount',
    text: `-NT$${discountAmount}`,
    priority: LABEL_PRIORITIES['manual-discount'],
    className: 'px-2 py-1 text-xs font-semibold rounded-md shadow-lg border bg-stone-800/90 text-white border-white'
  })
  
  // 3. Percentage off order (訂單百分比折扣) - 使用基礎金色效果
  const orderDiscountPercent = Math.floor((randomValue * 3 + 1) * 5) // 5%-20%
  const orderTaiwanDiscount = (100 - orderDiscountPercent) / 10 // 轉換成幾折 (8折-9.5折)
  const orderDiscountText = orderTaiwanDiscount === Math.floor(orderTaiwanDiscount) 
    ? `滿額享${orderTaiwanDiscount}折` 
    : `滿額享${orderTaiwanDiscount.toFixed(1)}折`
    
  mockLabels.push({
    type: 'campaign',
    text: orderDiscountText,
    priority: LABEL_PRIORITIES['campaign'],
    className: 'px-2 py-1 text-xs font-semibold rounded-md shadow-lg border bg-stone-800/90 text-white border-white'
  })
  
  // 4. Amount off order (訂單金額折扣) - 使用新的黑底白字樣式
  const orderDiscountAmount = Math.floor((randomValue * 5 + 1) * 100) // NT$100-600
  mockLabels.push({
    type: 'special-event',
    text: `滿額折NT$${orderDiscountAmount}`,
    priority: LABEL_PRIORITIES['special-event'],
    className: 'px-2 py-1 text-xs font-semibold rounded-md shadow-lg border bg-stone-800/90 text-white border-white'
  })
  
  // 5. Buy X Get Y (買X送Y優惠) - 使用光澤金色效果
  const buyXGetYOptions = [
    // 數量型 (安全通用，適用所有商品)
    '買2送1',
    '買3送1', 
    '買1送1',
    '買4送2',
    
    // 通用表達 (不涉及具體商品名稱)
    '買就送',      // 購買即有贈品
    '加碼贈送',    // 額外贈送商品
    '組合優惠',    // 套裝組合優惠
    '多買多送',    // 買越多送越多
    '滿件贈品',    // 滿一定數量就送
    '加購好禮'     // 加購即可獲得好禮
  ]
  
  const selectedBuyXGetY = buyXGetYOptions[Math.floor(randomValue * buyXGetYOptions.length)]
  mockLabels.push({
    type: 'bundle',
    text: selectedBuyXGetY,
    priority: LABEL_PRIORITIES['bundle'],
    className: 'px-2 py-1 text-xs font-semibold rounded-md shadow-lg border bg-stone-800/90 text-white border-white'
  })
  
  // 6. Flash Sale (限時特價) - 使用新的黑底白字樣式
  mockLabels.push({
    type: 'flash-sale',
    text: '限時特價',
    priority: LABEL_PRIORITIES['flash-sale'],
    className: 'px-2 py-1 text-xs font-semibold rounded-md shadow-lg border bg-stone-800/90 text-white border-white'
  })
  
  // 注意：不生成售完/預訂假標籤，這些由真實庫存狀態決定
  
  // 按優先級排序，顯示所有標籤
  return mockLabels.sort((a, b) => a.priority - b.priority)
}

/**
 * 從真實 Medusa API 獲取促銷標籤
 * @param product 產品資料
 * @param regionId 地區 ID，預設為台灣地區
 * @returns Promise<PromotionLabel[]>
 */
export async function getRealPromotionLabels(
  product: HttpTypes.StoreProduct,
  regionId: string = 'reg_01JW1S1F7GB4ZP322G2DMETETH'
): Promise<PromotionLabel[]> {
  try {
    const [promotionData, inventoryData] = await Promise.all([
      getProductPromotions(product.id, regionId),
      getProductInventoryStatus(product.id, regionId)
    ])

    const labels: PromotionLabel[] = []

    // 折扣標籤
    if (promotionData.discountPercentage && promotionData.discountPercentage > 0) {
      labels.push({
        type: 'auto-discount',
        text: `-${promotionData.discountPercentage}%`,
        priority: LABEL_PRIORITIES['auto-discount'],
        className: 'px-2 py-1 text-xs font-semibold rounded-md shadow-lg border bg-stone-800/90 text-white border-white',
        isDiscount: true
      })
    }

    // 限時搶購
    if (promotionData.hasFlashSale) {
      labels.push({
        type: 'flash-sale',
        text: '限時搶購',
        priority: LABEL_PRIORITIES['flash-sale'],
        className: 'px-2 py-1 text-xs font-semibold rounded-md shadow-lg border bg-stone-800/90 text-white border-white'
      })
    }

    // 新品標籤
    if (promotionData.isNew) {
      labels.push({
        type: 'new',
        text: '新品',
        priority: LABEL_PRIORITIES['new'],
        className: 'px-2 py-1 text-xs font-semibold rounded-md shadow-lg border bg-stone-800/90 text-white border-white'
      })
    }

    // 熱銷標籤
    if (promotionData.isHot) {
      labels.push({
        type: 'hot',
        text: '熱銷',
        priority: LABEL_PRIORITIES['hot'],
        className: 'px-2 py-1 text-xs font-semibold rounded-md shadow-lg border bg-stone-800/90 text-white border-white'
      })
    }

    // 限量標籤
    if (promotionData.isLimited) {
      labels.push({
        type: 'limited',
        text: '限量',
        priority: LABEL_PRIORITIES['limited'],
        className: 'product-label limited'
      })
    }

    // 暢銷標籤
    if (promotionData.isBestseller) {
      labels.push({
        type: 'bestseller',
        text: '暢銷',
        priority: LABEL_PRIORITIES['bestseller'],
        className: 'product-label bestseller'
      })
    }

    // 精選標籤
    if (promotionData.isFeatured) {
      labels.push({
        type: 'featured',
        text: '精選',
        priority: LABEL_PRIORITIES['featured'],
        className: 'product-label featured'
      })
    }

    // 特價標籤
    if (promotionData.isOnSale) {
      labels.push({
        type: 'sale',
        text: '特價',
        priority: LABEL_PRIORITIES['sale'],
        className: 'product-label sale'
      })
    }

    // 獨家標籤
    if (promotionData.isExclusive) {
      labels.push({
        type: 'exclusive',
        text: '獨家',
        priority: LABEL_PRIORITIES['exclusive'],
        className: 'product-label exclusive'
      })
    }

    // 特殊活動標籤
    if (promotionData.specialEvent) {
      labels.push({
        type: 'special-event',
        text: promotionData.specialEvent,
        priority: LABEL_PRIORITIES['special-event'],
        className: 'product-label special-event'
      })
    }

    // 折扣碼提示
    if (promotionData.hasDiscountCode) {
      labels.push({
        type: 'discount-code',
        text: `優惠碼: ${promotionData.hasDiscountCode}`,
        priority: LABEL_PRIORITIES['discount-code'],
        className: 'product-label discount-code'
      })
    }

    // 組合優惠
    if (promotionData.bundleDiscount && promotionData.bundleDiscount > 0) {
      labels.push({
        type: 'bundle',
        text: `組合省${promotionData.bundleDiscount}%`,
        priority: LABEL_PRIORITIES['bundle'],
        className: 'product-label bundle'
      })
    }

    // 庫存狀態標籤
    if (inventoryData.isOutOfStock) {
      labels.push({
        type: 'sold-out',
        text: '售完',
        priority: LABEL_PRIORITIES['sold-out'],
        className: 'product-label sold-out'
      })
    } else if (inventoryData.canBackorder) {
      labels.push({
        type: 'preorder',
        text: '可預訂',
        priority: LABEL_PRIORITIES['preorder'],
        className: 'product-label preorder'
      })
    }

    // 按優先級排序
    return labels.sort((a, b) => a.priority - b.priority)

  } catch (error) {
    console.error('Error fetching real promotion labels:', error)
    // 如果 API 出錯，回退到假資料
    return generateMockPromotionLabels(product.id)
  }
}

/**
 * 統一的促銷標籤獲取函數
 * 根據環境變數決定使用真實 API 或假資料
 */
export async function getPromotionLabelsAsync(
  product: HttpTypes.StoreProduct,
  regionId?: string
): Promise<PromotionLabel[]> {
  // 檢查是否使用真實 API
  const useRealAPI = process.env.NEXT_PUBLIC_USE_REAL_PROMOTION_API === 'true'
  
  if (useRealAPI) {
    // 使用新的主動促銷標籤獲取方法
    const activeLabels = await getActivePromotionLabels(product, regionId)
    if (activeLabels.length > 0) {
      return activeLabels
    }
    // 如果沒有主動促銷，回退到原方法
    return await getRealPromotionLabels(product, regionId)
  } else {
    // 使用現有的同步方法
    if (shouldUseMockLabels()) {
      return generateMockPromotionLabels(product.id)
    } else {
      return getPromotionLabels(product)
    }
  }
}

// 切換假資料模式的環境變數檢查
export function shouldUseMockLabels(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_PROMOTION_LABELS === 'true' || 
         process.env.NODE_ENV === 'development'
}

/**
 * 直接從 Medusa API 獲取商品的促銷資訊
 * @param product 產品資料
 * @param regionId 地區 ID
 * @returns Promise<PromotionLabel[]>
 */
export async function getActivePromotionLabels(
  product: HttpTypes.StoreProduct,
  regionId: string = 'reg_01JW1S1F7GB4ZP322G2DMETETH'
): Promise<PromotionLabel[]> {
  try {
    const labels: PromotionLabel[] = []
    
    // 創建一個測試購物車來檢查促銷活動
    const cartResponse = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/carts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
      },
      body: JSON.stringify({
        region_id: regionId
      })
    })

    if (!cartResponse.ok) {
      throw new Error('Failed to create cart')
    }

    const cartData = await cartResponse.json()
    const cartId = cartData.cart.id

    // 如果商品有變體，選擇第一個變體
    const firstVariant = product.variants?.[0]
    if (!firstVariant) {
      return labels
    }

    // 添加商品到購物車
    const addItemResponse = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
      },
      body: JSON.stringify({
        variant_id: firstVariant.id,
        quantity: 1
      })
    })

    if (!addItemResponse.ok) {
      throw new Error('Failed to add item to cart')
    }

    const cartWithItem = await addItemResponse.json()
    const originalPrice = cartWithItem.cart.original_total || 0
    const finalPrice = cartWithItem.cart.total || 0
    const discountTotal = cartWithItem.cart.discount_total || 0

    // 檢查是否有促銷活動應用
    const promotions = cartWithItem.cart.promotions || []
    const processedCodes = new Set<string>() // 用來追蹤已處理的促銷代碼，避免重複
    
    if (promotions.length > 0) {
      for (const promotion of promotions) {
        if (promotion.application_method && !processedCodes.has(promotion.code)) {
          processedCodes.add(promotion.code)
          
          const method = promotion.application_method
          const code = promotion.code || ''
          
          if (method.type === 'percentage') {
            // 百分比折扣
            const discountPercent = method.value
            const taiwanDiscount = (100 - discountPercent) / 10
            const discountText = taiwanDiscount === Math.floor(taiwanDiscount) 
              ? `${taiwanDiscount}折` 
              : `${taiwanDiscount.toFixed(1)}折`
            
            // 根據促銷代碼判斷是訂單折扣還是商品折扣
            let labelText = discountText
            let labelType: PromotionLabelType = 'auto-discount'
            
            if (code.toLowerCase().includes('order')) {
              labelText = `滿額訂單${discountText}`
              labelType = 'campaign'
            } else if (code.toLowerCase().includes('product')) {
              labelText = `指定商品${discountText}`
              labelType = 'auto-discount'
            } else {
              // 默認顯示為商品折扣
              labelText = `指定商品${discountText}`
              labelType = 'auto-discount'
            }
            
            labels.push({
              type: labelType,
              text: labelText,
              priority: LABEL_PRIORITIES[labelType],
              className: 'px-2 py-1 text-xs font-semibold rounded-md shadow-lg border bg-stone-800/90 text-white border-white',
              isDiscount: true
            })
          } else if (method.type === 'fixed') {
            // 固定金額折扣
            const discountAmount = method.value
            
            // 根據促銷代碼判斷是訂單折扣還是商品折扣
            let labelText = `-NT$${discountAmount}`
            let labelType: PromotionLabelType = 'manual-discount'
            
            if (code.toLowerCase().includes('order')) {
              labelText = `滿額折NT$${discountAmount}`
              labelType = 'special-event'
            } else if (code.toLowerCase().includes('product')) {
              labelText = `商品折NT$${discountAmount}`
              labelType = 'manual-discount'
            } else {
              // 默認顯示為商品折扣
              labelText = `折NT$${discountAmount}`
              labelType = 'manual-discount'
            }
            
            labels.push({
              type: labelType,
              text: labelText,
              priority: LABEL_PRIORITIES[labelType],
              className: 'px-2 py-1 text-xs font-semibold rounded-md shadow-lg border bg-stone-800/90 text-white border-white',
              isDiscount: true
            })
          }
        }
      }
    }

    // 如果總折扣大於 0，但沒有具體的促銷標籤，則顯示總折扣
    if (discountTotal > 0 && labels.length === 0) {
      const discountPercent = Math.round((discountTotal / originalPrice) * 100)
      const taiwanDiscount = (100 - discountPercent) / 10
      const discountText = taiwanDiscount === Math.floor(taiwanDiscount) 
        ? `${taiwanDiscount}折` 
        : `${taiwanDiscount.toFixed(1)}折`
      
      labels.push({
        type: 'auto-discount',
        text: discountText,
        priority: LABEL_PRIORITIES['auto-discount'],
        className: 'px-2 py-1 text-xs font-semibold rounded-md shadow-lg border bg-stone-800/90 text-white border-white',
        isDiscount: true
      })
    }

    // 清理測試購物車（可選）
    try {
      await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
        method: 'DELETE',
        headers: {
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
        }
      })
    } catch (error) {
      console.warn('Failed to cleanup test cart:', error)
    }

    return labels.sort((a, b) => a.priority - b.priority)

  } catch (error) {
    console.error('Error fetching active promotion labels:', error)
    return []
  }
}
