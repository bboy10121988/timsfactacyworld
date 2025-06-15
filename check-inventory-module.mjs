/**
 * 庫存模組配置檢查工具
 * 檢查 Medusa 是否已正確配置庫存模組
 */

import { createMedusaApp } from '@medusajs/medusa-app'
import { InternalModuleDeclaration } from '@medusajs/modules-sdk'
import { initialize } from '@medusajs/inventory'

async function checkInventoryModuleSetup() {
  console.log('檢查庫存模組配置...')
  
  try {
    // 嘗試初始化 Medusa 應用
    const app = await createMedusaApp()
    
    // 檢查庫存模組是否已註冊
    const registeredModules = app.getRegisteredModules()
    
    // 查找庫存模組
    const inventoryModule = registeredModules.find(
      (mod) => mod.definition.key === 'inventoryService'
    )
    
    if (inventoryModule) {
      console.log('✅ 庫存模組已正確配置!')
      console.log('模組資訊:', {
        key: inventoryModule.definition.key,
        registrationName: inventoryModule.definition.registrationName,
      })
      
      // 初始化庫存模組
      const inventoryService = await initialize({})
      
      // 獲取庫存模組版本
      const version = inventoryService?.getVersion?.() || '未知'
      console.log(`庫存模組版本: ${version}`)
      
      return true
    } else {
      console.error('❌ 未找到庫存模組配置。')
      console.log('請確認您已在 medusa-config.ts 中正確配置了 inventoryService')
      console.log(`
modules: {
  inventoryService: {
    resolve: "@medusajs/inventory",
    options: {}
  }
}`)
      return false
    }
  } catch (error) {
    console.error('❌ 檢查庫存模組時發生錯誤:', error)
    return false
  }
}

// 執行檢查
checkInventoryModuleSetup().then((isConfigured) => {
  if (isConfigured) {
    console.log('您可以開始使用庫存功能了!')
  } else {
    console.log('請修復庫存模組配置後再試。')
  }
  
  process.exit(0)
})
