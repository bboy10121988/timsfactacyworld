#!/usr/bin/env node

/**
 * 建立測試促銷活動來展示 Medusa API 折扣標籤
 */

const { execSync } = require('child_process')

console.log('🏷️ 建立 Medusa 促銷活動測試資料')
console.log('='.repeat(50))

// 執行後端創建促銷活動的腳本
try {
  console.log('\n📦 執行後端促銷活動創建腳本...')
  
  // 檢查後端腳本是否存在
  const fs = require('fs')
  const scriptPath = './backend/scripts/create-test-promotions.js'
  
  if (fs.existsSync(scriptPath)) {
    console.log('✅ 找到後端腳本，正在執行...')
    execSync(`cd backend && node scripts/create-test-promotions.js`, { 
      stdio: 'inherit',
      timeout: 30000 
    })
  } else {
    console.log('⚠️ 後端促銷腳本不存在，請手動在 Medusa Admin 中創建促銷活動')
  }

} catch (error) {
  console.error('❌ 執行失敗:', error.message)
  console.log('\n🔧 手動創建促銷活動步驟:')
  console.log('1. 開啟 Medusa Admin: http://localhost:9000/admin')
  console.log('2. 登入後進入「Promotions」頁面')
  console.log('3. 點擊「Create Promotion」')
  console.log('4. 設定以下資訊:')
  console.log('   - Code: SUMMER20')
  console.log('   - Type: Percentage')
  console.log('   - Value: 20')
  console.log('   - Application: Products')
  console.log('5. 儲存並啟用促銷活動')
}

console.log('\n🌐 測試頁面:')
console.log('• Medusa API 標籤: http://localhost:3000/test-labels')
console.log('• 產品頁面: http://localhost:3000/products')
console.log('• Medusa Admin: http://localhost:9000/admin')

console.log('\n✅ 完成!')
