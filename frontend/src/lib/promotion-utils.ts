import { HttpTypes } from "@medusajs/types"

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
  
  // 1. 庫存狀態標籤（最高優先級）
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

  // 2. 自動計算的折扣標籤
  if (discountInfo.hasDiscount && discountInfo.discountPercentage > 0) {
    labels.push({
      type: 'auto-discount',
      text: `${discountInfo.discountPercentage}% OFF`,
      priority: LABEL_PRIORITIES['auto-discount'],
      className: 'product-label discount',
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
