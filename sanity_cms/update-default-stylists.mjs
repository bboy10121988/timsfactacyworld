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

async function updateDefaultStylists() {
  try {
    console.log('🔄 更新預設設計師設定...')
    
    // 為每個服務的第一個設計師設定為預設
    const result = await client
      .patch('07fa7076-8e79-47a6-9fe2-e1a87bbe3fbb')
      .set({
        // 剪髮造型 - 設定 Jenny 為預設（最便宜的選項）
        'mainSections[_key == "bc86c0c4fe4f"].cards[_key == "775e357d84cd"].stylists[_key == "new-jenny-1"].isDefault': true,
        // 染髮服務 - 設定 Jenny 為預設
        'mainSections[_key == "bc86c0c4fe4f"].cards[_key == "83c1cd2b4356"].stylists[_key == "new-jenny-2"].isDefault': true,
        // 燙髮造型 - 設定 Jenny 為預設
        'mainSections[_key == "bc86c0c4fe4f"].cards[_key == "e7cb4353f428"].stylists[_key == "new-jenny-3"].isDefault': true,
      })
      .commit()
    
    console.log('✅ 成功更新預設設計師設定！')
    console.log('📄 文檔 ID:', result._id)
    
    console.log('\n🎉 更新完成！')
    console.log('📊 預設設計師設定：')
    console.log('   ✅ 剪髮造型：Jenny (NT$ 800)')
    console.log('   ✅ 染髮服務：Jenny (NT$ 2000)')
    console.log('   ✅ 燙髮造型：Jenny (NT$ 1500)')
    
  } catch (error) {
    console.error('❌ 更新失敗：', error.message)
  }
}

updateDefaultStylists()
