#!/usr/bin/env node

import { createClient } from '@sanity/client'

// Sanity 配置  
const client = createClient({
  projectId: 'm7o2mv1n',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
})

async function updatePriceTypes() {
  try {
    console.log('🔄 更新價格類型設定...')
    
    // 為所有現有的設計師等級設定價格類型
    const result = await client
      .patch('07fa7076-8e79-47a6-9fe2-e1a87bbe3fbb')
      .set({
        // 剪髮造型 - 所有等級都設定為「起價」
        'mainSections[_key == "bc86c0c4fe4f"].cards[_key == "775e357d84cd"].stylists[_key == "fc044de1c2ed"].priceType': 'up',
        'mainSections[_key == "bc86c0c4fe4f"].cards[_key == "775e357d84cd"].stylists[_key == "4df80aad4c4a"].priceType': 'up', 
        'mainSections[_key == "bc86c0c4fe4f"].cards[_key == "775e357d84cd"].stylists[_key == "new-jenny-1"].priceType': 'up',
        
        // 染髮服務 - 設定不同的價格類型
        'mainSections[_key == "bc86c0c4fe4f"].cards[_key == "83c1cd2b4356"].stylists[_key == "1e88eb172b77"].priceType': 'up',
        'mainSections[_key == "bc86c0c4fe4f"].cards[_key == "83c1cd2b4356"].stylists[_key == "new-sarah-2"].priceType': 'fixed',
        'mainSections[_key == "bc86c0c4fe4f"].cards[_key == "83c1cd2b4356"].stylists[_key == "new-jenny-2"].priceType': 'up',
        
        // 燙髮造型 - 設定不同的價格類型
        'mainSections[_key == "bc86c0c4fe4f"].cards[_key == "e7cb4353f428"].stylists[_key == "560e55f27a1e"].priceType': 'fixed',
        'mainSections[_key == "bc86c0c4fe4f"].cards[_key == "e7cb4353f428"].stylists[_key == "ceef2206c707"].priceType': 'up',
        'mainSections[_key == "bc86c0c4fe4f"].cards[_key == "e7cb4353f428"].stylists[_key == "new-jenny-3"].priceType': 'up',
      })
      .commit()
    
    console.log('✅ 成功更新價格類型設定！')
    console.log('📄 文檔 ID:', result._id)
    
    console.log('\n🎉 更新完成！')
    console.log('📊 價格類型設定：')
    console.log('   剪髮造型：')
    console.log('     - Tim (資深設計師): NT$ 1200 起')
    console.log('     - Sarah (首席設計師): NT$ 1500 起') 
    console.log('     - Jenny (設計師): NT$ 800 起')
    console.log('   染髮服務：')
    console.log('     - Tim (色彩專家): NT$ 3500 起')
    console.log('     - Sarah (資深設計師): NT$ 2800 (固定)')
    console.log('     - Jenny (設計師): NT$ 2000 起')
    console.log('   燙髮造型：')
    console.log('     - Tim (燙髮專家): NT$ 2500 (固定)')
    console.log('     - Sarah (資深設計師): NT$ 2000 起')
    console.log('     - Jenny (設計師): NT$ 1500 起')
    
  } catch (error) {
    console.error('❌ 更新失敗：', error.message)
  }
}

updatePriceTypes()
