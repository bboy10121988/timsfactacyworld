/**
 * 測試腳本：為商品添加行銷活動標籤
 * 這個腳本可以用來快速為商品設置各種行銷活動標籤進行測試
 */

import { getAdminToken } from './get-admin-token.mjs'

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'

// 測試用的標籤配置
const labelConfigs = [
  {
    title: '折扣標籤測試',
    metadata: {
      discount: '20%'
    }
  },
  {
    title: '新品標籤測試',
    metadata: {
      promotion_type: 'new'
    }
  },
  {
    title: '熱銷標籤測試',
    metadata: {
      promotion: '熱銷商品',
      promotion_type: 'hot'
    }
  },
  {
    title: '限量標籤測試',
    metadata: {
      promotion: '限量發售',
      promotion_type: 'limited'
    }
  },
  {
    title: '暢銷標籤測試',
    metadata: {
      promotion_type: 'bestseller'
    }
  },
  {
    title: '特殊活動標籤測試',
    metadata: {
      discount: '50% OFF',
      special_event: '雙11特惠'
    }
  },
  {
    title: '多標籤組合測試',
    metadata: {
      discount: '30%',
      promotion: '限時特價',
      promotion_type: 'sale',
      special_event: '年末清倉'
    }
  }
]

async function getProducts() {
  try {
    const token = await getAdminToken()
    
    const response = await fetch(`${BACKEND_URL}/admin/products?limit=20`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.products || []
  } catch (error) {
    console.error('獲取商品失敗:', error)
    return []
  }
}

async function updateProductLabels(productId, metadata) {
  try {
    const token = await getAdminToken()
    
    const response = await fetch(`${BACKEND_URL}/admin/products/${productId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        metadata: metadata
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`✅ 成功更新商品 ${productId} 的標籤`)
    return data.product
  } catch (error) {
    console.error(`❌ 更新商品 ${productId} 失敗:`, error)
    return null
  }
}

async function addMarketingLabels() {
  console.log('🚀 開始為商品添加行銷活動標籤...')
  
  const products = await getProducts()
  
  if (products.length === 0) {
    console.log('❌ 沒有找到任何商品')
    return
  }
  
  console.log(`📦 找到 ${products.length} 個商品`)
  
  // 為每個標籤配置分配一個商品
  for (let i = 0; i < Math.min(labelConfigs.length, products.length); i++) {
    const product = products[i]
    const config = labelConfigs[i]
    
    console.log(`\n📝 為商品 "${product.title}" 設置標籤: ${config.title}`)
    console.log('標籤配置:', JSON.stringify(config.metadata, null, 2))
    
    await updateProductLabels(product.id, config.metadata)
    
    // 短暫延遲避免 API 限制
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log('\n🎉 標籤設置完成！')
  console.log('\n📋 測試建議:')
  console.log('1. 前往商品列表頁面查看標籤顯示效果')
  console.log('2. 測試搜尋結果頁面的標籤顯示')
  console.log('3. 檢查商品卡片的 hover 效果')
  console.log('4. 在不同裝置尺寸下測試響應式效果')
}

async function clearAllLabels() {
  console.log('🧹 開始清除所有商品的行銷標籤...')
  
  const products = await getProducts()
  
  for (const product of products) {
    if (product.metadata && (
      product.metadata.discount || 
      product.metadata.promotion || 
      product.metadata.promotion_type || 
      product.metadata.special_event
    )) {
      console.log(`清除商品 "${product.title}" 的標籤`)
      
      const cleanMetadata = { ...product.metadata }
      delete cleanMetadata.discount
      delete cleanMetadata.promotion
      delete cleanMetadata.promotion_type
      delete cleanMetadata.special_event
      
      await updateProductLabels(product.id, cleanMetadata)
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }
  
  console.log('✅ 所有標籤已清除')
}

async function showCurrentLabels() {
  console.log('📊 顯示當前商品標籤狀態...')
  
  const products = await getProducts()
  
  products.forEach(product => {
    const hasLabels = product.metadata && (
      product.metadata.discount || 
      product.metadata.promotion || 
      product.metadata.promotion_type || 
      product.metadata.special_event
    )
    
    if (hasLabels) {
      console.log(`\n📦 ${product.title}:`)
      
      if (product.metadata.discount) {
        console.log(`  💰 折扣: ${product.metadata.discount}`)
      }
      
      if (product.metadata.promotion) {
        console.log(`  🏷️  促銷: ${product.metadata.promotion}`)
      }
      
      if (product.metadata.promotion_type) {
        console.log(`  🎯 類型: ${product.metadata.promotion_type}`)
      }
      
      if (product.metadata.special_event) {
        console.log(`  🎉 活動: ${product.metadata.special_event}`)
      }
    }
  })
}

// 檢查命令行參數
const command = process.argv[2]

switch (command) {
  case 'add':
    addMarketingLabels()
    break
  case 'clear':
    clearAllLabels()
    break
  case 'show':
    showCurrentLabels()
    break
  default:
    console.log('使用方法:')
    console.log('  node test-marketing-labels.mjs add    # 添加測試標籤')
    console.log('  node test-marketing-labels.mjs clear  # 清除所有標籤')
    console.log('  node test-marketing-labels.mjs show   # 顯示當前標籤')
    break
}
