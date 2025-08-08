import { HttpTypes } from "@medusajs/types"

// 簡化的促銷標籤類型
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
  | 'buy-x-get-y'        // 買X送Y
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

// 標籤優先級配置
const LABEL_PRIORITIES: Record<PromotionLabelType, number> = {
  'auto-discount': 1,
  'manual-discount': 2,
  'promotion': 3,
  'campaign': 4,
  'discount-code': 5,
  'new': 10,
  'hot': 11,
  'limited': 12,
  'bestseller': 13,
  'featured': 14,
  'sale': 15,
  'special-event': 16,
  'preorder': 17,
  'sold-out': 18,
  'bundle': 19,
  'buy-x-get-y': 6,    // 買X送Y 標籤優先級較高
  'flash-sale': 20,
  'clearance': 21,
  'exclusive': 22
}

/**
 * 獲取商品的促銷標籤
 * 
 * 注意：此函數不再嘗試從 API 獲取標籤，直接從商品數據中讀取
 */
export async function getActivePromotionLabels(
  product: HttpTypes.StoreProduct,
  regionId: string = 'reg_01JW1S1F7GB4ZP322G2DMETETH'
): Promise<PromotionLabel[]> {
  try {
    if (!product || !product.id) {
      console.warn('❌ 獲取促銷標籤失敗: 商品資料無效')
      return []
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🧪 [${product.title || '未命名商品'}] 獲取促銷標籤`)
    }
    
    // 檢查商品變體
    const firstVariant = product.variants?.[0]
    if (!firstVariant) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚠️ [${product.title || '未命名商品'}] 商品沒有變體，跳過促銷測試`)
      }
      return []
    }

    // 直接從商品數據中讀取標籤
    return getPromotionLabelsFromProduct(product)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ [${product?.title || '未命名商品'}] 處理促銷標籤失敗:`, error)
    }
    return []
  }
}

/**
 * 從商品數據中讀取促銷標籤
 */
function getPromotionLabelsFromProduct(product: HttpTypes.StoreProduct): PromotionLabel[] {
  const labels: PromotionLabel[] = []
  const addedLabels = new Set<string>() // 用於追蹤已添加的標籤文字

  try {
    if (!product) {
      return labels
    }
    
    // 處理價格折扣標籤
    const firstVariant = product.variants?.[0]
    if (firstVariant?.calculated_price) {
      const calculatedPrice = firstVariant.calculated_price
      if (calculatedPrice.calculated_amount && calculatedPrice.original_amount &&
          calculatedPrice.calculated_amount < calculatedPrice.original_amount) {
        
        const originalPrice = calculatedPrice.original_amount
        const finalPrice = calculatedPrice.calculated_amount
        const discountTotal = originalPrice - finalPrice
        const discountPercent = Math.round((discountTotal / originalPrice) * 100)
        
        if (discountPercent > 0) {
          const taiwanDiscount = (100 - discountPercent) / 10
          const discountText = taiwanDiscount === Math.floor(taiwanDiscount)
            ? `${taiwanDiscount}折`
            : `${taiwanDiscount.toFixed(1)}折`
          
          labels.push({
            type: 'auto-discount',
            text: discountText,
            priority: LABEL_PRIORITIES['auto-discount'],
            className: 'inline-block bg-stone-800/90 text-white px-2 py-1 shadow-sm text-xs font-medium tracking-widest uppercase whitespace-nowrap w-auto',
            isDiscount: true
          })
          addedLabels.add(discountText)
        }
      }
    }

    // 從 metadata 處理各種促銷標籤
    if (product.metadata) {
      // 處理 buy_x_get_y 標籤
      if (product.metadata.buyXGetY) {
        try {
          const buyXGetY = typeof product.metadata.buyXGetY === 'string' 
            ? JSON.parse(product.metadata.buyXGetY)
            : product.metadata.buyXGetY

          if (buyXGetY && typeof buyXGetY === 'object') {
            const freeItem = buyXGetY.free_item || buyXGetY.get_item || '贈品'
            const labelText = `送${freeItem}`
            
            if (!addedLabels.has(labelText)) {
              labels.push({
                type: 'buy-x-get-y',
                text: labelText,
                priority: LABEL_PRIORITIES['buy-x-get-y'],
                className: 'inline-block bg-stone-800/90 text-white px-2 py-1 shadow-sm text-xs font-medium tracking-widest uppercase whitespace-nowrap w-auto',
                isDiscount: false
              })
              addedLabels.add(labelText)
            }
          }
        } catch (error) {
          console.warn(`⚠️ [${product.title}] buyXGetY metadata 解析失敗:`, error)
        }
      }

      // 處理其他 metadata 促銷標籤
      const metadataLabels = [
        { key: 'promotion_text', type: 'promotion' as PromotionLabelType },
        { key: 'campaign_text', type: 'campaign' as PromotionLabelType },
        { key: 'special_event', type: 'special-event' as PromotionLabelType },
        { key: 'bundle_text', type: 'bundle' as PromotionLabelType },
        { key: 'flash_sale', type: 'flash-sale' as PromotionLabelType },
        { key: 'clearance', type: 'clearance' as PromotionLabelType },
        { key: 'exclusive', type: 'exclusive' as PromotionLabelType }
      ]

      for (const { key, type } of metadataLabels) {
        if (product.metadata[key]) {
          const labelText = String(product.metadata[key])
          
          if (!addedLabels.has(labelText)) {
            labels.push({
              type,
              text: labelText,
              priority: LABEL_PRIORITIES[type],
              className: 'inline-block bg-stone-800/90 text-white px-2 py-1 shadow-sm text-xs font-medium tracking-widest uppercase whitespace-nowrap w-auto',
              isDiscount: false
            })
            addedLabels.add(labelText)
          }
        }
      }
    }

    // 從 tags 處理促銷標籤
    if (product.tags && product.tags.length > 0) {
      const tagLabels = [
        { value: 'new', type: 'new' as PromotionLabelType, text: '新品' },
        { value: 'hot', type: 'hot' as PromotionLabelType, text: '熱銷' },
        { value: 'limited', type: 'limited' as PromotionLabelType, text: '限量' },
        { value: 'bestseller', type: 'bestseller' as PromotionLabelType, text: '暢銷' },
        { value: 'featured', type: 'featured' as PromotionLabelType, text: '精選' },
        { value: 'sale', type: 'sale' as PromotionLabelType, text: '特價' },
        { value: 'preorder', type: 'preorder' as PromotionLabelType, text: '預訂' },
        { value: 'sold-out', type: 'sold-out' as PromotionLabelType, text: '售完' }
      ]

      for (const tag of product.tags) {
        const tagValue = tag.value?.toLowerCase()
        const matchedLabel = tagLabels.find(label => label.value === tagValue)
        
        if (matchedLabel && !addedLabels.has(matchedLabel.text)) {
          labels.push({
            type: matchedLabel.type,
            text: matchedLabel.text,
            priority: LABEL_PRIORITIES[matchedLabel.type],
            className: 'inline-block bg-stone-800/90 text-white px-2 py-1 shadow-sm text-xs font-medium tracking-widest uppercase whitespace-nowrap w-auto',
            isDiscount: false
          })
          addedLabels.add(matchedLabel.text)
        }
      }
    }

    console.log(`📋 [${product?.title || '未命名商品'}] 從產品數據中獲取標籤數量: ${labels.length}`)
    
    return labels.sort((a, b) => a.priority - b.priority)
  } catch (error) {
    console.warn(`⚠️ [${product?.title || '未命名商品'}] 從產品數據讀取標籤失敗:`, error)
    return []
  }
}
