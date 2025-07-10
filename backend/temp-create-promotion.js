
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
  