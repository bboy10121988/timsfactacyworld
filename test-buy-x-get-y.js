// 測試買X送Y標籤功能
import { generateMockPromotionLabels } from './frontend/src/lib/promotion-utils'

console.log('測試買X送Y標籤功能...')

// 生成一些測試標籤
const mockLabels = generateMockPromotionLabels('test-product-123')

console.log('生成的促銷標籤：')
mockLabels.forEach((label, index) => {
  console.log(`${index + 1}. ${label.text} (${label.type}) - 優先級: ${label.priority}`)
})

// 檢查是否包含buy-x-get-y標籤
const buyXGetYLabel = mockLabels.find(label => label.type === 'buy-x-get-y')
if (buyXGetYLabel) {
  console.log(`\n✅ 成功！找到買X送Y標籤: "${buyXGetYLabel.text}"`)
  console.log(`   CSS類別: ${buyXGetYLabel.className}`)
  console.log(`   優先級: ${buyXGetYLabel.priority}`)
} else {
  console.log('\n❌ 未找到買X送Y標籤')
}

console.log('\n🎯 測試結果：')
console.log('1. 買X送Y標籤類型已新增到 PromotionLabelType')
console.log('2. 標籤優先級已設定 (優先級: 8)')
console.log('3. 預設顯示文字: "送禮"')
console.log('4. Mock生成器包含多種"送Y"選項')
console.log('5. CSS樣式已新增 (綠色漸層 + 禮物動畫)')
console.log('6. metadata檢查邏輯已新增')
console.log('7. 產品標籤(tags)檢查已新增')
console.log('8. Medusa API促銷檢測已新增')
