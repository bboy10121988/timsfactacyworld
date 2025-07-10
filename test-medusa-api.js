#!/usr/bin/env node

/**
 * 測試 Medusa API 連接和基本功能
 */

const MEDUSA_URL = 'http://localhost:9000'
const PUBLISHABLE_KEY = 'pk_6a5b6f62e29baea8089628c7713ce56a388c5944011f43fcf15b8837b00464b7'
const REGION_ID = 'reg_01JW1S1F7GB4ZP322G2DMETETH'

async function testMedusaAPI() {
  console.log('🧪 測試 Medusa API 連接')
  console.log('='.repeat(40))
  
  try {
    // 1. 測試取得商品列表
    console.log('1️⃣ 測試取得商品列表...')
    const productsResponse = await fetch(`${MEDUSA_URL}/store/products`, {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_KEY,
      }
    })
    
    if (!productsResponse.ok) {
      throw new Error(`商品 API 失敗: ${productsResponse.status} ${productsResponse.statusText}`)
    }
    
    const productsData = await productsResponse.json()
    console.log(`✅ 商品數量: ${productsData.products?.length || 0}`)
    
    if (productsData.products && productsData.products.length > 0) {
      const firstProduct = productsData.products[0]
      console.log(`📦 第一個商品: ${firstProduct.title} (${firstProduct.id})`)
      console.log(`📦 變體數量: ${firstProduct.variants?.length || 0}`)
      
      if (firstProduct.variants && firstProduct.variants.length > 0) {
        const firstVariant = firstProduct.variants[0]
        console.log(`📦 第一個變體: ${firstVariant.title || firstVariant.id}`)
        
        // 2. 測試創建購物車
        console.log('\n2️⃣ 測試創建購物車...')
        const cartResponse = await fetch(`${MEDUSA_URL}/store/carts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            region_id: REGION_ID
          })
        })
        
        if (!cartResponse.ok) {
          const errorText = await cartResponse.text()
          throw new Error(`購物車 API 失敗: ${cartResponse.status} ${cartResponse.statusText}\n${errorText}`)
        }
        
        const cartData = await cartResponse.json()
        const cartId = cartData.cart.id
        console.log(`✅ 購物車創建成功: ${cartId}`)
        console.log(`💰 購物車原價: NT$${cartData.cart.original_total || 0}`)
        console.log(`💰 購物車總價: NT$${cartData.cart.total || 0}`)
        
        // 3. 測試添加商品到購物車
        console.log('\n3️⃣ 測試添加商品到購物車...')
        const addItemResponse = await fetch(`${MEDUSA_URL}/store/carts/${cartId}/line-items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            variant_id: firstVariant.id,
            quantity: 1
          })
        })
        
        if (!addItemResponse.ok) {
          const errorText = await addItemResponse.text()
          throw new Error(`添加商品 API 失敗: ${addItemResponse.status} ${addItemResponse.statusText}\n${errorText}`)
        }
        
        const cartWithItem = await addItemResponse.json()
        const cart = cartWithItem.cart
        console.log(`✅ 商品添加成功`)
        console.log(`💰 更新後原價: NT$${cart.original_total || 0}`)
        console.log(`💰 更新後總價: NT$${cart.total || 0}`)
        console.log(`💰 折扣金額: NT$${cart.discount_total || 0}`)
        console.log(`🎯 促銷活動數量: ${cart.promotions?.length || 0}`)
        
        if (cart.promotions && cart.promotions.length > 0) {
          cart.promotions.forEach((promotion, index) => {
            console.log(`   ${index + 1}. ${promotion.code || '無代碼'} - ${promotion.application_method?.type || '未知'}`)
          })
        }
        
        // 4. 清理購物車
        console.log('\n4️⃣ 清理購物車...')
        await fetch(`${MEDUSA_URL}/store/carts/${cartId}`, {
          method: 'DELETE',
          headers: {
            'x-publishable-api-key': PUBLISHABLE_KEY,
          },
        })
        console.log(`✅ 購物車清理完成`)
      }
    }
    
    console.log('\n🎉 API 測試完成!')
    
  } catch (error) {
    console.error('❌ API 測試失敗:', error.message)
    if (error.stack) {
      console.error('詳細錯誤:', error.stack)
    }
  }
}

// 執行測試
testMedusaAPI()
