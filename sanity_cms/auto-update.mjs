import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'm7o2mv1n',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
})

// 完整的服務卡片更新資料
const serviceCardUpdate = {
  "heading": "我們的服務",
  "subheading": "專業髮型設計服務，由經驗豐富的造型師為您打造專屬風格",
  "cards[0]": {
    "title": "剪髮造型",
    "englishTitle": "Hair Cut & Style", 
    "mainPrice": 800,
    "priceLabel": "up",
    "stylists": [
      {
        "levelName": "資深設計師",
        "levelOrder": 1,
        "price": 1200,
        "stylistName": "Tim"
      },
      {
        "levelName": "首席設計師", 
        "levelOrder": 2,
        "price": 1500,
        "stylistName": "Sarah"
      },
      {
        "levelName": "設計師",
        "levelOrder": 3,
        "price": 800,
        "stylistName": "Jenny"
      }
    ],
    "link": "#book-now"
  },
  "cards[1]": {
    "title": "染髮服務",
    "englishTitle": "Hair Coloring",
    "mainPrice": 2000,
    "priceLabel": "up", 
    "stylists": [
      {
        "levelName": "色彩專家",
        "levelOrder": 1,
        "price": 3500,
        "stylistName": "Tim"
      },
      {
        "levelName": "資深設計師",
        "levelOrder": 2,
        "price": 2800,
        "stylistName": "Sarah"
      },
      {
        "levelName": "設計師",
        "levelOrder": 3,
        "price": 2000,
        "stylistName": "Jenny"
      }
    ],
    "link": "#book-now"
  },
  "cards[2]": {
    "title": "燙髮造型",
    "englishTitle": "Hair Perm",
    "mainPrice": 1500,
    "priceLabel": "up",
    "stylists": [
      {
        "levelName": "燙髮專家",
        "levelOrder": 1,
        "price": 2500,
        "stylistName": "Tim"
      },
      {
        "levelName": "資深設計師",
        "levelOrder": 2,
        "price": 2000,
        "stylistName": "Sarah"
      },
      {
        "levelName": "設計師",
        "levelOrder": 3,
        "price": 1500,
        "stylistName": "Jenny"
      }
    ],
    "link": "#book-now"
  }
}

async function updateServiceCards() {
  try {
    console.log('🚀 開始自動更新服務卡片資料...')
    
    const patch = client
      .patch('07fa7076-8e79-47a6-9fe2-e1a87bbe3fbb')
      
    // 更新標題和副標題
    patch.set({
      'mainSections[_key == "bc86c0c4fe4f"].heading': serviceCardUpdate.heading,
      'mainSections[_key == "bc86c0c4fe4f"].subheading': serviceCardUpdate.subheading
    })
    
    // 替換所有卡片
    patch.set({
      'mainSections[_key == "bc86c0c4fe4f"].cards': [
        serviceCardUpdate["cards[0]"],
        serviceCardUpdate["cards[1]"], 
        serviceCardUpdate["cards[2]"]
      ]
    })
    
    const result = await patch.commit()
    
    console.log('✅ 成功更新！')
    console.log('📊 更新內容：')
    console.log('   - 標題：我們的服務')
    console.log('   - 副標題：專業髮型設計服務...')
    console.log('   - 3個服務：剪髮造型、染髮服務、燙髮造型')
    console.log('   - 3位設計師：Tim、Sarah、Jenny')
    console.log('   - 9個價格等級')
    
  } catch (error) {
    console.error('❌ 更新失敗：', error)
  }
}

updateServiceCards()
