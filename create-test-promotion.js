#!/usr/bin/env node

/**
 * 直接在資料庫中創建測試促銷活動
 */

const { execSync } = require('child_process')
const path = require('path')

console.log('🏷️ 建立測試促銷活動')
console.log('='.repeat(50))

try {
  // 進入後端目錄
  process.chdir('./backend')
  
  // 使用 Medusa CLI 創建促銷活動
  console.log('📦 使用 Medusa CLI 創建促銷活動...')
  
  // 創建 20% 折扣促銷活動
  const createPromotionScript = `
    const { MedusaApp } = require('@medusajs/framework')
    
    async function createTestPromotion() {
      const app = await MedusaApp({ 
        workerMode: 'shared'
      })
      
      try {
        const promotionModuleService = app.modules.promotion
        
        // 創建促銷活動
        const promotion = await promotionModuleService.create({
          code: 'MEDUSA20',
          type: 'percentage',
          value: 20,
          is_automatic: true,
          application_method: {
            type: 'percentage',
            target_type: 'items',
            value: 20
          }
        })
        
        console.log('✅ 促銷活動創建成功:', promotion)
        
      } catch (error) {
        console.error('❌ 創建促銷活動失敗:', error)
      } finally {
        await app.shutdown()
      }
    }
    
    createTestPromotion()
  `
  
  // 寫入臨時腳本
  require('fs').writeFileSync('./temp-create-promotion.js', createPromotionScript)
  
  // 執行腳本
  execSync('node temp-create-promotion.js', { stdio: 'inherit' })
  
  // 清理臨時檔案
  require('fs').unlinkSync('./temp-create-promotion.js')
  
} catch (error) {
  console.error('❌ 執行失敗:', error.message)
  
  console.log('\n🔧 手動創建促銷活動:')
  console.log('1. 開啟 Medusa Admin: http://localhost:9000/admin')
  console.log('2. 登入管理員帳號')
  console.log('3. 進入 Promotions 頁面')
  console.log('4. 點擊 "Create Campaign"')
  console.log('5. 設定促銷活動:')
  console.log('   - Campaign ID: test-campaign')
  console.log('   - Name: Test 20% Discount')
  console.log('   - Budget: 10000 (NT$)')
  console.log('6. 創建促銷規則:')
  console.log('   - Type: Percentage')
  console.log('   - Value: 20')
  console.log('   - Application: Items')
  console.log('7. 儲存並啟用')
}

console.log('\n🌐 測試連結:')
console.log('• 商品頁面: http://localhost:3000/products')
console.log('• 測試頁面: http://localhost:3000/test-labels')
console.log('• Admin 管理: http://localhost:9000/admin')

console.log('\n✅ 完成!')
