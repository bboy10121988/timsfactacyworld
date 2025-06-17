#!/usr/bin/env node

/**
 * 測試促銷標籤系統
 * 用於驗證各種促銷活動標籤的生成和顯示邏輯
 */

// 模擬商品資料
const mockProducts = [
  {
    id: "prod_1",
    title: "自動折扣商品",
    handle: "auto-discount-product",
    variants: [
      {
        id: "var_1",
        calculated_price: {
          original_amount: 1000,
          calculated_amount: 800,
          currency_code: "TWD"
        },
        manage_inventory: true,
        inventory_quantity: 10,
        allow_backorder: false
      }
    ],
    metadata: {}
  },
  {
    id: "prod_2", 
    title: "手動促銷商品",
    handle: "manual-promotion-product",
    variants: [
      {
        id: "var_2",
        calculated_price: {
          original_amount: 1000,
          calculated_amount: 1000,
          currency_code: "TWD"
        },
        manage_inventory: true,
        inventory_quantity: 5,
        allow_backorder: false
      }
    ],
    metadata: {
      discount: "25% OFF",
      promotion: "春季特賣",
      promotion_type: "sale"
    }
  },
  {
    id: "prod_3",
    title: "限時搶購商品", 
    handle: "flash-sale-product",
    variants: [
      {
        id: "var_3",
        calculated_price: {
          original_amount: 2000,
          calculated_amount: 1400,
          currency_code: "TWD"
        },
        manage_inventory: true,
        inventory_quantity: 2,
        allow_backorder: false
      }
    ],
    metadata: {
      flash_sale: "true",
      special_event: "雙11購物節"
    }
  },
  {
    id: "prod_4",
    title: "售完商品",
    handle: "sold-out-product", 
    variants: [
      {
        id: "var_4",
        calculated_price: {
          original_amount: 1500,
          calculated_amount: 1500,
          currency_code: "TWD"
        },
        manage_inventory: true,
        inventory_quantity: 0,
        allow_backorder: false
      }
    ],
    metadata: {
      promotion: "熱銷商品",
      promotion_type: "hot"
    }
  },
  {
    id: "prod_5",
    title: "預訂商品",
    handle: "preorder-product",
    variants: [
      {
        id: "var_5", 
        calculated_price: {
          original_amount: 3000,
          calculated_amount: 3000,
          currency_code: "TWD"
        },
        manage_inventory: true,
        inventory_quantity: 0,
        allow_backorder: true
      }
    ],
    metadata: {
      promotion: "即將上市",
      promotion_type: "new"
    }
  },
  {
    id: "prod_6",
    title: "組合優惠商品",
    handle: "bundle-product",
    variants: [
      {
        id: "var_6",
        calculated_price: {
          original_amount: 1200,
          calculated_amount: 1200,
          currency_code: "TWD"
        },
        manage_inventory: false,
        inventory_quantity: null,
        allow_backorder: false
      }
    ],
    metadata: {
      bundle: "買二送一",
      discount_code_available: "true",
      exclusive: "true"
    }
  }
]

/**
 * 模擬促銷標籤工具函數
 * 這裡簡化實現，實際應該使用 @lib/promotion-utils
 */ 

function calculateProductDiscount(product) {
  if (!product.variants || product.variants.length === 0) {
    return { hasDiscount: false, discountPercentage: 0, maxDiscount: 0 }
  }

  let maxDiscountPercentage = 0
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
        hasAnyDiscount = true
      }
    }
  })

  return {
    hasDiscount: hasAnyDiscount,
    discountPercentage: maxDiscountPercentage,
    maxDiscount: maxDiscountPercentage
  }
}

function getProductStockStatus(product) {
  if (!product.variants || product.variants.length === 0) {
    return { isOutOfStock: false, canPreorder: false, isSoldOut: false, hasStock: true }
  }
  
  const allVariantsStatus = product.variants.map(variant => {
    if (!variant.manage_inventory) {
      return { hasStock: true, canPreorder: false, isSoldOut: false }
    }
    
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

function testPromotionLabels() {
  console.log("🏷️ 測試促銷標籤系統\n")
  
  mockProducts.forEach((product, index) => {
    const discountInfo = calculateProductDiscount(product)
    const stockStatus = getProductStockStatus(product)
    
    console.log(`📦 商品 ${index + 1}: ${product.title}`)
    console.log(`   Handle: ${product.handle}`)
    console.log(`   折扣資訊:`, discountInfo)
    console.log(`   庫存狀態:`, stockStatus)
    console.log(`   Metadata:`, product.metadata)
    
    // 模擬標籤生成邏輯
    const labels = []
    
    // 庫存狀態標籤
    if (stockStatus.isSoldOut) {
      labels.push({ type: 'sold-out', text: 'SOLD OUT', priority: 1 })
    } else if (stockStatus.canPreorder) {
      labels.push({ type: 'preorder', text: '預訂', priority: 13 })
    }
    
    // 自動折扣標籤
    if (discountInfo.hasDiscount && discountInfo.discountPercentage > 0) {
      labels.push({ 
        type: 'auto-discount', 
        text: `${discountInfo.discountPercentage}% OFF`, 
        priority: 3 
      })
    }
    
    // 手動折扣標籤（只有在沒有自動折扣時）
    if (!discountInfo.hasDiscount && product.metadata.discount) {
      labels.push({ 
        type: 'manual-discount', 
        text: product.metadata.discount, 
        priority: 4 
      })
    }
    
    // 其他標籤
    if (product.metadata.flash_sale === "true") {
      labels.push({ type: 'flash-sale', text: '限時搶購', priority: 2 })
    }
    
    if (product.metadata.bundle) {
      labels.push({ type: 'bundle', text: product.metadata.bundle, priority: 7 })
    }
    
    if (product.metadata.exclusive === "true") {
      labels.push({ type: 'exclusive', text: '獨家', priority: 8 })
    }
    
    if (product.metadata.discount_code_available === "true") {
      labels.push({ type: 'discount-code', text: '輸入折扣碼享優惠', priority: 12 })
    }
    
    if (product.metadata.promotion) {
      labels.push({ 
        type: 'promotion', 
        text: product.metadata.promotion, 
        priority: 10 
      })
    }
    
    if (product.metadata.special_event) {
      labels.push({ 
        type: 'special-event', 
        text: product.metadata.special_event, 
        priority: 11 
      })
    }
    
    // 排序並限制顯示數量
    const sortedLabels = labels.sort((a, b) => a.priority - b.priority).slice(0, 3)
    
    console.log(`   🏷️ 將顯示的標籤:`)
    sortedLabels.forEach(label => {
      console.log(`      - ${label.text} (${label.type}, 優先級: ${label.priority})`)
    })
    
    console.log("")
  })
}

// 執行測試
testPromotionLabels()

console.log("✅ 測試完成！")
console.log("\n📋 使用指南:")
console.log("1. 自動折扣標籤會根據 original_amount 和 calculated_amount 自動計算")
console.log("2. 手動折扣標籤只在沒有自動折扣時顯示")
console.log("3. 庫存狀態標籤具有最高優先級")
console.log("4. 最多同時顯示 3 個標籤")
console.log("5. 標籤按優先級排序顯示")
