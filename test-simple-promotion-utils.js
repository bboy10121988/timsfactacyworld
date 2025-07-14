// 測試 simple-promotion-utils.ts 的買X送Y標籤功能
const fs = require('fs')
const path = require('path')

console.log('🧪 測試 simple-promotion-utils.ts 買X送Y標籤功能...\n')

// 1. 測試帶有 buyXGetY metadata 的模擬商品
const mockProductWithMetadata = {
  id: 'test-product-metadata',
  title: '測試商品 (metadata)',
  metadata: {
    buyXGetY: JSON.stringify({
      buy_quantity: 2,
      get_quantity: 1,
      free_item: '面膜'
    })
  },
  variants: [
    { id: 'variant-1', inventory_quantity: 10 }
  ],
  tags: []
}

// 2. 測試帶有 tags 的模擬商品
const mockProductWithTags = {
  id: 'test-product-tags',
  title: '測試商品 (tags)',
  metadata: {},
  variants: [
    { id: 'variant-2', inventory_quantity: 5 }
  ],
  tags: [
    { value: 'new' },
    { value: 'hot' },
    { value: 'limited' }
  ]
}

// 3. 測試帶有多種 metadata 的模擬商品
const mockProductWithMultiple = {
  id: 'test-product-multiple',
  title: '測試商品 (多重標籤)',
  metadata: {
    buyXGetY: JSON.stringify({
      buy_quantity: 1,
      get_quantity: 1,
      free_item: '贈品小物'
    }),
    promotion_text: '限時特惠',
    special_event: '週年慶',
    flash_sale: '閃購中'
  },
  variants: [
    { id: 'variant-3', inventory_quantity: 15 }
  ],
  tags: [
    { value: 'featured' },
    { value: 'bestseller' }
  ]
}

console.log('📝 測試案例：')
console.log('1. 商品含 buyXGetY metadata (送面膜)')
console.log('2. 商品含 tags (新品+熱銷+限量)')
console.log('3. 商品含多重標籤 (買X送Y + 促銷文字 + tags)')

console.log('\n✅ 預期結果：')
console.log('- 案例1: 應顯示 "送面膜" 標籤 (buy-x-get-y類型)')
console.log('- 案例2: 應顯示 "新品"、"熱銷"、"限量" 標籤')
console.log('- 案例3: 應顯示所有標籤類型，無數量限制')

console.log('\n💡 注意：')
console.log('這是 simple-promotion-utils.ts 的測試模擬')
console.log('實際使用需要呼叫 getActivePromotionLabels() 函數')
console.log('該函數會處理 Medusa API 促銷 + metadata + tags')

// 建立 HTML 測試預覽
const htmlContent = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>simple-promotion-utils.ts 買X送Y 測試</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .test-container { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .test-title { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
        .label-preview { display: inline-block; margin: 5px; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; color: white; }
        .buy-x-get-y { background: linear-gradient(135deg, #28a745, #20c997); animation: pulse 2s infinite; }
        .new { background: #007bff; }
        .hot { background: #dc3545; }
        .limited { background: #fd7e14; }
        .featured { background: #6f42c1; }
        .bestseller { background: #ffc107; color: #000; }
        .promotion { background: #17a2b8; }
        .special-event { background: #e83e8c; }
        .flash-sale { background: #dc3545; animation: blink 1s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .product-card { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; background: #fafafa; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .warning { background: #fff3cd; color: #856404; border: 1px solid #ffeeba; }
    </style>
</head>
<body>
    <h1>🧪 simple-promotion-utils.ts 買X送Y 測試</h1>
    
    <div class="status success">
        ✅ <strong>LABEL_PRIORITIES 已修正：</strong> 所有 PromotionLabelType 都已包含優先級設定
    </div>
    
    <div class="status success">
        ✅ <strong>metadata 支援已新增：</strong> buyXGetY、promotion_text、campaign_text 等
    </div>
    
    <div class="status success">
        ✅ <strong>tags 支援已新增：</strong> new、hot、limited、bestseller、featured 等
    </div>
    
    <div class="test-container">
        <h2 class="test-title">測試案例 1: buyXGetY metadata</h2>
        <div class="product-card">
            <h3>測試商品 (metadata)</h3>
            <p><strong>metadata.buyXGetY:</strong> { "free_item": "面膜" }</p>
            <div class="label-preview buy-x-get-y">送面膜</div>
            <p><small>類型: buy-x-get-y, 優先級: 6</small></p>
        </div>
    </div>
    
    <div class="test-container">
        <h2 class="test-title">測試案例 2: tags 標籤</h2>
        <div class="product-card">
            <h3>測試商品 (tags)</h3>
            <p><strong>tags:</strong> ["new", "hot", "limited"]</p>
            <div class="label-preview new">新品</div>
            <div class="label-preview hot">熱銷</div>
            <div class="label-preview limited">限量</div>
            <p><small>類型: new(10), hot(11), limited(12)</small></p>
        </div>
    </div>
    
    <div class="test-container">
        <h2 class="test-title">測試案例 3: 多重標籤 (無上限)</h2>
        <div class="product-card">
            <h3>測試商品 (多重標籤)</h3>
            <p><strong>metadata:</strong> buyXGetY + promotion_text + special_event + flash_sale</p>
            <p><strong>tags:</strong> ["featured", "bestseller"]</p>
            <div class="label-preview buy-x-get-y">送贈品小物</div>
            <div class="label-preview promotion">限時特惠</div>
            <div class="label-preview special-event">週年慶</div>
            <div class="label-preview flash-sale">閃購中</div>
            <div class="label-preview featured">精選</div>
            <div class="label-preview bestseller">暢銷</div>
            <p><small>總計 6 個標籤，無數量限制</small></p>
        </div>
    </div>
    
    <div class="test-container">
        <h2 class="test-title">🔧 實際測試步驟</h2>
        <ol>
            <li>確保 Medusa 後端已啟動 (port 9000)</li>
            <li>確保 Next.js 前端已啟動 (port 8000)</li>
            <li>在 Medusa Admin 中設定商品的 metadata 或 tags</li>
            <li>或使用 API 直接新增含有 buyXGetY 的商品</li>
            <li>在前端商品列表頁查看標籤顯示</li>
        </ol>
    </div>
    
    <div class="status info">
        💡 <strong>提示：</strong> getActivePromotionLabels() 會依序處理：
        <br>1. Medusa API 促銷折扣 (優先級 1-5)
        <br>2. metadata 的 buyXGetY (優先級 6) 
        <br>3. 其他 metadata 標籤 (優先級 3-22)
        <br>4. tags 標籤 (優先級 10-18)
    </div>
    
    <div class="status warning">
        ⚠️ <strong>注意：</strong> 如果商品沒有顯示 buy-x-get-y 標籤，請檢查：
        <br>1. metadata.buyXGetY 格式是否正確
        <br>2. 是否有語法錯誤導致函數提早返回
        <br>3. 瀏覽器 console 是否有錯誤訊息
    </div>
</body>
</html>
`

fs.writeFileSync(path.join(process.cwd(), 'test-simple-promotion-utils.html'), htmlContent)

console.log('\n🎯 測試文件已建立: test-simple-promotion-utils.html')
console.log('📂 請在瀏覽器中開啟該文件查看測試預覽')
