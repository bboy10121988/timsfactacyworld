#!/usr/bin/env node
/**
 * 行銷標籤展示腳本
 * 此腳本會列出所有可用的行銷標籤類型與範例
 */

// 模擬 PromotionLabel 介面
const ALL_LABEL_TYPES = [
  'auto-discount',      // 自動計算折扣
  'manual-discount',    // 手動設置折扣
  'promotion',          // 自定義促銷文字
  'campaign',           // 促銷活動
  'discount-code',      // 折扣碼提示
  'new',                // 新品
  'hot',                // 熱銷
  'limited',            // 限量
  'bestseller',         // 暢銷
  'featured',           // 精選
  'sale',               // 特價
  'special-event',      // 特殊活動
  'preorder',           // 預訂
  'sold-out',           // 售完
  'bundle',             // 組合優惠
  'flash-sale',         // 限時搶購
  'clearance',          // 清倉
  'exclusive'           // 獨家
]

// 標籤優先級配置
const LABEL_PRIORITIES = {
  'sold-out': 1,
  'flash-sale': 2,
  'auto-discount': 3,
  'manual-discount': 4,
  'clearance': 5,
  'campaign': 6,
  'bundle': 7,
  'exclusive': 8,
  'limited': 9,
  'promotion': 10,
  'special-event': 11,
  'discount-code': 12,
  'preorder': 13,
  'new': 14,
  'hot': 15,
  'bestseller': 16,
  'featured': 17,
  'sale': 18,
}

// 標籤文字範例
const LABEL_EXAMPLES = {
  'auto-discount': '7折',
  'manual-discount': '-NT$200',
  'promotion': '夏日特惠',
  'campaign': '週年慶',
  'discount-code': '輸入折扣碼享優惠',
  'new': 'NEW',
  'hot': 'HOT',
  'limited': 'LIMITED',
  'bestseller': 'BEST',
  'featured': 'FEATURED',
  'sale': 'SALE',
  'special-event': '限時活動',
  'preorder': '預訂',
  'sold-out': '售完',
  'bundle': '買2送1',
  'flash-sale': '限時搶購',
  'clearance': '清倉特價',
  'exclusive': '獨家'
}

// 標籤來源說明
const LABEL_SOURCES = {
  'auto-discount': 'Medusa API / 價格計算',
  'manual-discount': 'Metadata / Medusa API',
  'promotion': 'Metadata',
  'campaign': 'Metadata / Medusa API',
  'discount-code': 'Metadata',
  'new': 'Metadata / Tags',
  'hot': 'Metadata / Tags',
  'limited': 'Metadata / Tags',
  'bestseller': 'Metadata / Tags',
  'featured': 'Metadata / Tags / Collection',
  'sale': 'Metadata / Tags',
  'special-event': 'Metadata',
  'preorder': '庫存系統',
  'sold-out': '庫存系統',
  'bundle': 'Metadata / Medusa API',
  'flash-sale': 'Metadata',
  'clearance': 'Metadata',
  'exclusive': 'Metadata'
}

// 標籤分類
const LABEL_CATEGORIES = {
  '折扣相關': ['auto-discount', 'manual-discount', 'clearance'],
  '活動促銷': ['campaign', 'promotion', 'special-event', 'discount-code'],
  '商品特性': ['new', 'hot', 'bestseller', 'featured', 'sale'],
  '限制性': ['limited', 'exclusive', 'flash-sale'],
  '庫存狀態': ['sold-out', 'preorder'],
  '購買優惠': ['bundle']
}

console.log('🏷️  行銷標籤完整展示')
console.log('='.repeat(50))

console.log('\n📊 標籤統計')
console.log(`總共 ${ALL_LABEL_TYPES.length} 種標籤類型`)

console.log('\n📋 按分類列出所有標籤：')
Object.entries(LABEL_CATEGORIES).forEach(([category, types]) => {
  console.log(`\n🎯 ${category}：`)
  types.forEach(type => {
    const priority = LABEL_PRIORITIES[type]
    const example = LABEL_EXAMPLES[type]
    const source = LABEL_SOURCES[type]
    console.log(`   • ${type.padEnd(15)} | 優先級: ${priority.toString().padStart(2)} | 範例: ${example.padEnd(12)} | 來源: ${source}`)
  })
})

console.log('\n🔀 按優先級排序（數字越小優先級越高）：')
const sortedByPriority = ALL_LABEL_TYPES.sort((a, b) => LABEL_PRIORITIES[a] - LABEL_PRIORITIES[b])
sortedByPriority.forEach((type, index) => {
  const priority = LABEL_PRIORITIES[type]
  const example = LABEL_EXAMPLES[type]
  console.log(`${(index + 1).toString().padStart(2)}. ${type.padEnd(15)} | 優先級: ${priority.toString().padStart(2)} | 範例: ${example}`)
})

console.log('\n📝 Metadata 設定範例：')
console.log(JSON.stringify({
  "discount": "20% OFF",
  "promotion": "夏日特惠",
  "promotion_type": "hot",
  "special_event": "週年慶",
  "campaign": "新品上市",
  "bundle": "買2送1",
  "flash_sale": "true",
  "clearance": "true",
  "exclusive": "true",
  "discount_code_available": "true"
}, null, 2))

console.log('\n🏷️  Tags 設定範例：')
console.log('["new", "hot", "limited", "bestseller", "featured"]')

console.log('\n✅ 展示完成！')
console.log('詳細說明請參考：/行銷標籤完整清單.md')
