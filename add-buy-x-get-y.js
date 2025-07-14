const MEDUSA_BACKEND_URL = 'http://localhost:9000'
const PUBLISHABLE_KEY = 'pk_6a5b6f62e29baea8089628c7713ce56a388c5944011f43fcf15b8837b00464b7'

async function addBuyXGetYMetadata() {
  try {
    console.log('🔍 正在查詢產品...')
    
    // 先獲取所有產品
    const productsResponse = await fetch(`${MEDUSA_BACKEND_URL}/store/products`, {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_KEY,
      }
    })
    
    if (!productsResponse.ok) {
      throw new Error(`HTTP error! status: ${productsResponse.status}`)
    }
    
    const productsData = await productsResponse.json()
    console.log(`📦 找到 ${productsData.products.length} 個產品`)
    
    // 選擇第一個產品來添加買X送Y metadata
    const product = productsData.products[0]
    
    if (!product) {
      console.log('❌ 沒有找到產品')
      return
    }
    
    console.log(`🎯 選擇產品: ${product.title} (ID: ${product.id})`)
    
    // 檢查當前 metadata
    console.log('📋 當前 metadata:', product.metadata)
    
    // 準備買X送Y的 metadata
    const buyXGetYData = {
      buy_quantity: 2,
      get_quantity: 1,
      free_item: '迷你裝髮蠟',
      conditions: '購買任意2件商品'
    }
    
    console.log('💡 建議手動添加以下 metadata 到產品:')
    console.log('Key: buyXGetY')
    console.log('Value:', JSON.stringify(buyXGetYData, null, 2))
    
    // 顯示如何在 Medusa Admin 中添加
    console.log('\n📝 如何在 Medusa Admin 中添加:')
    console.log('1. 進入 Medusa Admin (http://localhost:9000)')
    console.log('2. 找到產品: ' + product.title)
    console.log('3. 編輯產品')
    console.log('4. 在 Metadata 區域添加:')
    console.log('   Key: buyXGetY')
    console.log('   Value: ' + JSON.stringify(buyXGetYData))
    
  } catch (error) {
    console.error('❌ 錯誤:', error.message)
  }
}

addBuyXGetYMetadata()
