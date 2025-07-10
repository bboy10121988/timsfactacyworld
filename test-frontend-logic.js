/**
 * 測試前端服務卡片邏輯
 */

const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: "m7o2mv1n",
  dataset: "production",
  apiVersion: "2022-03-25",
  useCdn: true
})

// 模擬前端的設計師過濾邏輯
function getValidStylists(cards) {
  const allStylists = Array.from(new Set(
    cards.flatMap(card => 
      Array.isArray(card?.stylists) 
        ? card.stylists
            .filter((s) => s !== null && s !== undefined && typeof s.stylistName === 'string')
            .map(s => s.stylistName)
            .filter(name => {
              const lowercaseName = name.toLowerCase()
              // 過濾掉通用設計師標籤（包含更多變體）
              return !lowercaseName.includes('all stylists') && 
                     !lowercaseName.includes('all stylist') && 
                     !lowercaseName.includes('指定') &&
                     lowercaseName !== 'all' &&
                     name.trim().length > 0
            })
        : []
    )
  )).sort()
  
  return allStylists
}

// 模擬前端的圖片選擇邏輯
function getCardImage(card, selectedDesigner) {
  try {
    // 優先級 1: 選中的特定設計師
    if (selectedDesigner !== "all" && Array.isArray(card?.stylists)) {
      const selectedStylist = card.stylists.find(s => s?.stylistName === selectedDesigner)
      if (selectedStylist?.cardImage?.url) {
        return {
          url: selectedStylist.cardImage.url,
          alt: selectedStylist.cardImage.alt ?? `${selectedStylist.stylistName} - ${card.title}`,
          source: `選中設計師: ${selectedStylist.stylistName}`
        }
      }
    }
    
    // 優先級 2: 預設設計師
    if (Array.isArray(card?.stylists) && card.stylists.length > 0) {
      const defaultStylist = card.stylists.find(s => s?.isDefault === true)
      if (defaultStylist?.cardImage?.url) {
        return {
          url: defaultStylist.cardImage.url,
          alt: defaultStylist.cardImage.alt ?? `${defaultStylist.stylistName || '預設設計師'} - ${card.title}`,
          source: `預設設計師: ${defaultStylist.stylistName}`
        }
      }
    }
    
    // 優先級 3: 使用第一位有圖片的設計師（排除通用標籤）
    if (Array.isArray(card?.stylists) && card.stylists.length > 0) {
      const stylistWithImage = card.stylists.find(s => {
        const hasImage = s?.cardImage?.url
        const isNotGeneric = s?.stylistName && 
          !s.stylistName.toLowerCase().includes('all') &&
          !s.stylistName.toLowerCase().includes('指定')
        return hasImage && isNotGeneric
      })
      
      if (stylistWithImage?.cardImage?.url) {
        return {
          url: stylistWithImage.cardImage.url,
          alt: stylistWithImage.cardImage.alt ?? `${stylistWithImage.stylistName} - ${card.title}`,
          source: `第一位有圖片的設計師: ${stylistWithImage.stylistName}`
        }
      }
    }
    
    // 優先級 4: 使用任意有圖片的設計師（包含通用）
    if (Array.isArray(card?.stylists) && card.stylists.length > 0) {
      const anyWithImage = card.stylists.find(s => s?.cardImage?.url)
      if (anyWithImage?.cardImage?.url) {
        return {
          url: anyWithImage.cardImage.url,
          alt: anyWithImage.cardImage.alt ?? card.title,
          source: `任意有圖片的設計師: ${anyWithImage.stylistName}`
        }
      }
    }
    
    // 最後備選：使用預設圖片
    return {
      url: '/placeholder-service.svg',
      alt: card.title,
      source: '預設圖片 (SVG)'
    }
  } catch (error) {
    console.error('Error getting card image:', error)
    return {
      url: '/placeholder-service.svg',
      alt: card.title,
      source: '錯誤回退圖片'
    }
  }
}

async function testFrontendLogic() {
  try {
    console.log('🧪 測試前端服務卡片邏輯...\n')
    
    const query = `*[_type == "homePage"][0].mainSections[_type == "serviceCardSection" && isActive == true][0] {
      _type,
      isActive,
      heading,
      subheading,
      cardsPerRow,
      "cards": cards[] {
        title,
        englishTitle,
        "stylists": stylists[] {
          levelName,
          price,
          priceType,
          stylistName,
          isDefault,
          "cardImage": cardImage {
            "url": asset->url,
            "alt": alt
          }
        },
        link
      }
    }`

    const result = await client.fetch(query)
    
    if (!result?.cards) {
      console.log('❌ 無法獲取服務卡片數據')
      return
    }

    const cards = result.cards
    const validStylists = getValidStylists(cards)
    
    console.log(`📊 前端過濾後的設計師列表 (${validStylists.length} 位):`)
    validStylists.forEach((stylist, index) => {
      console.log(`   ${index + 1}. ${stylist}`)
    })
    console.log('')

    // 測試不同選擇情況下的圖片顯示
    const testCases = ['all', ...validStylists.slice(0, 3)] // 測試 "all" 和前3位設計師
    
    testCases.forEach(selectedDesigner => {
      console.log(`🎯 測試選擇: ${selectedDesigner === 'all' ? '所有設計師' : selectedDesigner}`)
      console.log('─'.repeat(50))
      
      cards.forEach(card => {
        const imageInfo = getCardImage(card, selectedDesigner)
        console.log(`📋 ${card.title}:`)
        console.log(`   圖片來源: ${imageInfo.source}`)
        console.log(`   圖片URL: ${imageInfo.url.substring(0, 60)}${imageInfo.url.length > 60 ? '...' : ''}`)
        console.log('')
      })
    })

    // 檢查每張卡片的設計師圖片可用性
    console.log('🔍 詳細圖片可用性分析:')
    console.log('─'.repeat(50))
    
    cards.forEach(card => {
      console.log(`📋 ${card.title} (${card.stylists?.length || 0} 位設計師):`)
      
      if (card.stylists && card.stylists.length > 0) {
        card.stylists.forEach((stylist, index) => {
          const hasImage = stylist.cardImage?.url
          const isDefault = stylist.isDefault
          const isGeneric = stylist.stylistName && (
            stylist.stylistName.toLowerCase().includes('all') ||
            stylist.stylistName.toLowerCase().includes('指定')
          )
          
          console.log(`   ${index + 1}. ${stylist.stylistName} (${stylist.levelName})`)
          console.log(`      圖片: ${hasImage ? '✅' : '❌'} ${isDefault ? '[預設]' : ''} ${isGeneric ? '[通用]' : ''}`)
          if (hasImage) {
            console.log(`      URL: ${stylist.cardImage.url.substring(0, 50)}...`)
          }
        })
      } else {
        console.log('   ❌ 沒有設計師資料')
      }
      console.log('')
    })

  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error)
  }
}

testFrontendLogic()
