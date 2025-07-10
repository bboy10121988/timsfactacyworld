#!/usr/bin/env node
/**
 * 直接測試 Medusa API 折扣標籤
 */

const { default: fetch } = require('node-fetch')

const API_BASE = 'http://localhost:9000'
const FRONTEND_BASE = 'http://localhost:3000'
const PUBLISHABLE_KEY = 'pk_6a5b6f62e29baea8089628c7713ce56a388c5944011f43fcf15b8837b00464b7'

async function testMedusaAPI() {
  console.log('🧪 測試 Medusa API 折扣標籤')
  console.log('='.repeat(50))

  try {
    // 1. 檢查後端健康狀態
    console.log('\n1️⃣ 檢查 Medusa 後端狀態...')
    const healthResponse = await fetch(`${API_BASE}/health`)
    if (!healthResponse.ok) {
      throw new Error('Medusa 後端無法連接')
    }
    console.log('✅ Medusa 後端運行正常')

    // 2. 獲取商品列表
    console.log('\n2️⃣ 獲取商品列表...')
    const productsResponse = await fetch(`${API_BASE}/store/products?limit=5`, {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_KEY
      }
    })
    if (!productsResponse.ok) {
      throw new Error('無法獲取商品列表')
    }
    const productsData = await productsResponse.json()
    const products = productsData.products || []
    console.log(`✅ 找到 ${products.length} 個商品`)

    if (products.length === 0) {
      console.log('❌ 沒有商品可測試')
      return
    }

    // 3. 測試每個商品的促銷標籤
    console.log('\n3️⃣ 測試商品促銷標籤...')
    
    for (let i = 0; i < Math.min(3, products.length); i++) {
      const product = products[i]
      console.log(`\n📦 測試商品: ${product.title}`)
      console.log(`   ID: ${product.id}`)
      
      // 檢查商品是否有變體
      if (!product.variants || product.variants.length === 0) {
        console.log('   ⚠️  商品沒有變體，跳過')
        continue
      }

      const firstVariant = product.variants[0]
      console.log(`   變體: ${firstVariant.title}`)
      
      if (firstVariant.calculated_price) {
        const original = firstVariant.calculated_price.original_amount
        const calculated = firstVariant.calculated_price.calculated_amount
        console.log(`   價格: NT$${original} → NT$${calculated}`)
        
        if (original > calculated) {
          const discount = Math.round(((original - calculated) / original) * 100)
          console.log(`   💰 有折扣: ${discount}% OFF`)
        } else {
          console.log(`   無折扣`)
        }
      }

      // 測試創建購物車並檢查促銷
      await testCartPromotion(product, firstVariant)
    }

    // 4. 檢查是否有促銷活動
    console.log('\n4️⃣ 檢查促銷活動...')
    try {
      const promotionsResponse = await fetch(`${API_BASE}/admin/promotions`, {
        headers: {
          'Authorization': 'Bearer test_api_key' // 如果需要的話
        }
      })
      
      if (promotionsResponse.ok) {
        const promotionsData = await promotionsResponse.json()
        console.log(`✅ 找到 ${promotionsData.promotions?.length || 0} 個促銷活動`)
      } else {
        console.log('⚠️  無法獲取促銷活動列表 (可能需要管理員權限)')
      }
    } catch (error) {
      console.log('⚠️  促銷活動 API 測試失敗:', error.message)
    }

  } catch (error) {
    console.error('❌ 測試失敗:', error.message)
  }
}

async function testCartPromotion(product, variant) {
  try {
    console.log('   🛒 測試購物車促銷...')
    
    // 創建購物車
    const cartResponse = await fetch(`${API_BASE}/store/carts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_KEY,
      },
      body: JSON.stringify({
        region_id: 'reg_01JW1S1F7GB4ZP322G2DMETETH'
      })
    })

    if (!cartResponse.ok) {
      console.log('   ❌ 無法創建購物車')
      return
    }

    const cartData = await cartResponse.json()
    const cartId = cartData.cart.id
    console.log(`   購物車 ID: ${cartId}`)

    // 添加商品到購物車
    const addItemResponse = await fetch(`${API_BASE}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_KEY,
      },
      body: JSON.stringify({
        variant_id: variant.id,
        quantity: 1
      })
    })

    if (!addItemResponse.ok) {
      console.log('   ❌ 無法添加商品到購物車')
      return
    }

    const cartWithItem = await addItemResponse.json()
    const cart = cartWithItem.cart
    
    console.log(`   原始總價: NT$${cart.original_total || 0}`)
    console.log(`   實際總價: NT$${cart.total || 0}`)
    console.log(`   折扣總額: NT$${cart.discount_total || 0}`)
    
    if (cart.promotions && cart.promotions.length > 0) {
      console.log(`   🎉 應用的促銷活動:`)
      cart.promotions.forEach(promo => {
        console.log(`      - ${promo.code}: ${promo.type}`)
        if (promo.application_method) {
          console.log(`        方法: ${promo.application_method.type}`)
          console.log(`        數值: ${promo.application_method.value}`)
        }
      })
    } else {
      console.log('   📝 沒有應用促銷活動')
    }

    // 清理購物車
    await fetch(`${API_BASE}/store/carts/${cartId}`, {
      method: 'DELETE',
      headers: {
        'x-publishable-api-key': PUBLISHABLE_KEY,
      }
    })

  } catch (error) {
    console.log('   ❌ 購物車測試失敗:', error.message)
  }
}

// 執行測試
testMedusaAPI().then(() => {
  console.log('\n✅ 測試完成!')
  console.log('\n🌐 前端測試頁面: http://localhost:3000/test-labels')
})
