/**
 * 檢查 Medusa 促銷 API 的腳本
 * 用來了解如何從 API 獲取商品的促銷活動資訊
 */

import { getAdminToken } from './get-admin-token.mjs'

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'

async function checkPromotionApis() {
  try {
    const token = await getAdminToken()
    
    console.log('🔍 檢查 Medusa 促銷相關 API...\n')
    
    // 1. 檢查促銷活動列表
    console.log('1. 檢查促銷活動 (Promotions):')
    try {
      const promotionsResponse = await fetch(`${BACKEND_URL}/admin/promotions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (promotionsResponse.ok) {
        const promotionsData = await promotionsResponse.json()
        console.log(`   找到 ${promotionsData.promotions?.length || 0} 個促銷活動`)
        
        if (promotionsData.promotions?.length > 0) {
          console.log('   促銷活動範例:')
          promotionsData.promotions.slice(0, 2).forEach((promo, index) => {
            console.log(`   ${index + 1}. ${promo.code} - ${promo.type} (${promo.is_automatic ? '自動' : '需要代碼'})`)
            if (promo.rules?.length > 0) {
              console.log(`      規則: ${JSON.stringify(promo.rules[0], null, 2)}`)
            }
          })
        }
      } else {
        console.log(`   ❌ 無法取得促銷活動: ${promotionsResponse.status}`)
      }
    } catch (error) {
      console.log(`   ❌ 促銷活動 API 錯誤: ${error.message}`)
    }
    
    // 2. 檢查折扣 (可能是舊版 API)
    console.log('\n2. 檢查折扣 (Discounts):')
    try {
      const discountsResponse = await fetch(`${BACKEND_URL}/admin/discounts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (discountsResponse.ok) {
        const discountsData = await discountsResponse.json()
        console.log(`   找到 ${discountsData.discounts?.length || 0} 個折扣`)
        
        if (discountsData.discounts?.length > 0) {
          console.log('   折扣範例:')
          discountsData.discounts.slice(0, 2).forEach((discount, index) => {
            console.log(`   ${index + 1}. ${discount.code} - ${discount.rule?.type} (${discount.rule?.value}${discount.rule?.type === 'percentage' ? '%' : ''})`)
          })
        }
      } else {
        console.log(`   ❌ 無法取得折扣: ${discountsResponse.status}`)
      }
    } catch (error) {
      console.log(`   ❌ 折扣 API 錯誤: ${error.message}`)
    }
    
    // 3. 檢查商品資料中是否包含促銷資訊
    console.log('\n3. 檢查商品資料結構:')
    try {
      const productsResponse = await fetch(`${BACKEND_URL}/admin/products?limit=1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        if (productsData.products?.length > 0) {
          const product = productsData.products[0]
          console.log(`   商品範例: ${product.title}`)
          console.log(`   商品欄位: ${Object.keys(product).join(', ')}`)
          
          if (product.variants?.length > 0) {
            const variant = product.variants[0]
            console.log(`   變體欄位: ${Object.keys(variant).join(', ')}`)
            
            if (variant.calculated_price) {
              console.log(`   價格資訊:`)
              console.log(`     - 原價: ${variant.calculated_price.original_amount}`)
              console.log(`     - 實際價格: ${variant.calculated_price.calculated_amount}`)
              console.log(`     - 是否有折扣: ${variant.calculated_price.original_amount > variant.calculated_price.calculated_amount}`)
            }
          }
        }
      } else {
        console.log(`   ❌ 無法取得商品資料: ${productsResponse.status}`)
      }
    } catch (error) {
      console.log(`   ❌ 商品 API 錯誤: ${error.message}`)
    }
    
    // 4. 檢查 Store API 的商品資料
    console.log('\n4. 檢查 Store API 商品資料:')
    try {
      // 首先獲取 publishable key
      const publishableKeysResponse = await fetch(`${BACKEND_URL}/admin/publishable-api-keys`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (publishableKeysResponse.ok) {
        const keysData = await publishableKeysResponse.json()
        if (keysData.publishable_api_keys?.length > 0) {
          const publishableKey = keysData.publishable_api_keys[0].id
          
          const storeProductsResponse = await fetch(`${BACKEND_URL}/store/products?limit=1`, {
            headers: {
              'x-publishable-api-key': publishableKey,
              'Content-Type': 'application/json'
            }
          })
          
          if (storeProductsResponse.ok) {
            const storeData = await storeProductsResponse.json()
            if (storeData.products?.length > 0) {
              const product = storeData.products[0]
              console.log(`   Store API 商品: ${product.title}`)
              console.log(`   Store API 商品欄位: ${Object.keys(product).join(', ')}`)
              
              if (product.variants?.length > 0) {
                const variant = product.variants[0]
                console.log(`   Store API 變體欄位: ${Object.keys(variant).join(', ')}`)
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(`   ❌ Store API 錯誤: ${error.message}`)
    }
    
  } catch (error) {
    console.error('檢查 API 時發生錯誤:', error)
  }
}

checkPromotionApis()
