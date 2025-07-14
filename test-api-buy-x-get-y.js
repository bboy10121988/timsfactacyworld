// 實際測試 buy-x-get-y 標籤的 API 調用
const { default: fetch } = require('node-fetch')

async function testBuyXGetYLabels() {
  console.log('🧪 測試實際 API 中的 buy-x-get-y 標籤...\n')
  
  const baseUrl = 'http://localhost:9000'
  const publishableKey = 'pk_6a5b6f62e29baea8089628c7713ce56a388c5944011f43fcf15b8837b00464b7'
  
  try {
    // 1. 獲取現有商品列表
    console.log('📡 獲取商品列表...')
    const productsResponse = await fetch(`${baseUrl}/store/products?limit=5`, {
      headers: {
        'x-publishable-api-key': publishableKey,
      }
    })
    
    if (!productsResponse.ok) {
      throw new Error(`獲取商品失敗: ${productsResponse.status}`)
    }
    
    const { products } = await productsResponse.json()
    console.log(`✅ 找到 ${products.length} 個商品`)
    
    if (products.length === 0) {
      console.log('❌ 沒有商品可測試，請先在 Medusa Admin 中新增商品')
      return
    }
    
    // 2. 選擇第一個商品進行測試
    const product = products[0]
    console.log(`\n🎯 測試商品: ${product.title}`)
    console.log(`   商品 ID: ${product.id}`)
    
    // 3. 檢查商品的 metadata
    if (product.metadata) {
      console.log('\n📋 商品 metadata:')
      Object.entries(product.metadata).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`)
      })
      
      // 檢查是否有 buyXGetY
      if (product.metadata.buyXGetY) {
        console.log('\n✅ 發現 buyXGetY metadata!')
        try {
          const buyXGetY = typeof product.metadata.buyXGetY === 'string' 
            ? JSON.parse(product.metadata.buyXGetY)
            : product.metadata.buyXGetY
          console.log('   解析結果:', buyXGetY)
          
          const freeItem = buyXGetY.free_item || buyXGetY.get_item || '贈品'
          console.log(`   標籤文字: "送${freeItem}"`)
        } catch (error) {
          console.log('   ❌ 解析失敗:', error.message)
        }
      } else {
        console.log('\n⚠️ 該商品沒有 buyXGetY metadata')
        console.log('   建議透過 API 或 Admin 新增測試 metadata')
      }
    } else {
      console.log('\n⚠️ 該商品沒有 metadata')
    }
    
    // 4. 檢查商品的 tags
    if (product.tags && product.tags.length > 0) {
      console.log('\n🏷️ 商品 tags:')
      product.tags.forEach(tag => {
        console.log(`   - ${tag.value}`)
      })
    } else {
      console.log('\n⚠️ 該商品沒有 tags')
    }
    
    // 5. 提供添加 buyXGetY 的 API 範例
    console.log('\n💡 如果要測試 buy-x-get-y 標籤，可以使用以下 API 更新商品:')
    console.log(`curl -X POST "${baseUrl}/admin/products/${product.id}" \\`)
    console.log('  -H "Content-Type: application/json" \\')
    console.log('  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\')
    console.log('  -d \'{')
    console.log('    "metadata": {')
    console.log('      "buyXGetY": "{\\"buy_quantity\\": 2, \\"get_quantity\\": 1, \\"free_item\\": \\"面膜\\"}"')
    console.log('    }')
    console.log('  }\'')
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 提示: 請確保 Medusa 後端已啟動 (port 9000)')
      console.log('   執行: npm run dev (在 backend 目錄下)')
    }
  }
}

// 執行測試
testBuyXGetYLabels()
