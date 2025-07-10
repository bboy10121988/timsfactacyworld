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

// 完整的服務卡片資料
const updatedServiceCardSection = {
  "_key": "bc86c0c4fe4f",
  "_type": "serviceCardSection",
  "isActive": true,
  "heading": "我們的服務",
  "subheading": "專業髮型設計服務，由經驗豐富的造型師為您打造專屬風格",
  "cardsPerRow": 3,
  "cards": [
    {
      "_key": "775e357d84cd",
      "title": "剪髮造型",
      "englishTitle": "Hair Cut & Style",
      "mainPrice": 800,
      "priceLabel": "up",
      "stylists": [
        {
          "_key": "fc044de1c2ed",
          "levelName": "資深設計師",
          "levelOrder": 1,
          "price": 1200,
          "stylistName": "Tim"
        },
        {
          "_key": "4df80aad4c4a",
          "levelName": "首席設計師",
          "levelOrder": 2,
          "price": 1500,
          "stylistName": "Sarah"
        },
        {
          "_key": "new-jenny-1",
          "levelName": "設計師",
          "levelOrder": 3,
          "price": 800,
          "stylistName": "Jenny"
        }
      ]
    },
    {
      "_key": "83c1cd2b4356",
      "title": "染髮服務",
      "englishTitle": "Hair Coloring",
      "mainPrice": 2000,
      "priceLabel": "up",
      "stylists": [
        {
          "_key": "1e88eb172b77",
          "levelName": "色彩專家",
          "levelOrder": 1,
          "price": 3500,
          "stylistName": "Tim"
        },
        {
          "_key": "new-sarah-2",
          "levelName": "資深設計師",
          "levelOrder": 2,
          "price": 2800,
          "stylistName": "Sarah"
        },
        {
          "_key": "new-jenny-2",
          "levelName": "設計師",
          "levelOrder": 3,
          "price": 2000,
          "stylistName": "Jenny"
        }
      ]
    },
    {
      "_key": "e7cb4353f428",
      "title": "燙髮造型",
      "englishTitle": "Hair Perm",
      "mainPrice": 1500,
      "priceLabel": "up",
      "stylists": [
        {
          "_key": "560e55f27a1e",
          "levelName": "燙髮專家",
          "levelOrder": 1,
          "price": 2500,
          "stylistName": "Tim"
        },
        {
          "_key": "ceef2206c707",
          "levelName": "資深設計師",
          "levelOrder": 2,
          "price": 2000,
          "stylistName": "Sarah"
        },
        {
          "_key": "new-jenny-3",
          "levelName": "設計師",
          "levelOrder": 3,
          "price": 1500,
          "stylistName": "Jenny"
        }
      ]
    }
  ]
}

async function updateServiceCards() {
  try {
    console.log('🔄 更新現有首頁的服務卡片區塊...')
    
    // 使用 patch 更新指定的服務卡片區塊
    const result = await client
      .patch('07fa7076-8e79-47a6-9fe2-e1a87bbe3fbb')
      .replace(
        "mainSections[_key == 'bc86c0c4fe4f']",
        updatedServiceCardSection
      )
      .commit()
    
    console.log('✅ 成功更新服務卡片區塊！')
    console.log('📄 文檔 ID:', result._id)
    
    console.log('\n🎉 更新完成！')
    console.log('📊 更新的內容：')
    console.log('   ✅ 標題：我們的服務')
    console.log('   ✅ 副標題：專業髮型設計服務...')
    console.log('   ✅ 服務項目：剪髮造型、染髮服務、燙髮造型')
    console.log('   ✅ 設計師：Tim、Sarah、Jenny')
    console.log('   ✅ 價格等級：每個服務 3 個等級')
    
  } catch (error) {
    console.error('❌ 更新失敗：', error.message)
  }
}

updateServiceCards()
