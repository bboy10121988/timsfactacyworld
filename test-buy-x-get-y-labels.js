// 測試買X送Y標籤腳本
const testProduct = {
  id: 'prod_01JWFGZX3RDSS1JWZVZAQFJGR6',
  title: '綠罐 Fantasy World 水凝髮蠟',
  metadata: null,
  tags: []
}

console.log('🧪 測試買X送Y標籤生成...')
console.log('產品ID:', testProduct.id)
console.log('產品標題:', testProduct.title)

// 模擬測試邏輯
const testBuyXGetYProducts = [
  { id: 'prod_01JWFGZX3RDSS1JWZVZAQFJGR6', gift: '迷你髮蠟' },  // 綠罐
  { id: 'prod_01JWFH49N3BGG4T5YNH582RN26', gift: '造型梳' },    // 黃罐
  { id: 'prod_01JWFHF0RKVR8W8JWW3MJ2TZM5', gift: '髮帶' },      // 紅帽
]

const matchedProduct = testBuyXGetYProducts.find(item => item.id === testProduct.id)

if (matchedProduct) {
  const labelText = `買2送${matchedProduct.gift}`
  console.log('✅ 匹配的產品:', matchedProduct)
  console.log('🏷️ 生成的標籤:', labelText)
  console.log('🎯 標籤類型: buy-x-get-y')
  console.log('📝 CSS 類別: inline-block bg-stone-800/90 text-white px-2 py-1 shadow-sm text-xs font-medium tracking-widest uppercase whitespace-nowrap w-auto max-w-fit')
} else {
  console.log('❌ 沒有找到匹配的產品')
}

console.log('\n📋 測試所有產品ID:')
testBuyXGetYProducts.forEach((product, index) => {
  console.log(`  ${index + 1}. ID: ${product.id} - 贈品: ${product.gift}`)
})
