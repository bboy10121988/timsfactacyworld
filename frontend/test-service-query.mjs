import { createClient } from "@sanity/client"

const client = createClient({
  projectId: "m7o2mv1n",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true,
})

async function testServiceQuery() {
  try {
    console.log('🔍 測試服務卡片查詢...')
    
    const query = `*[_type == "homePage"][0].mainSections[_type == "serviceCardSection" && isActive == true][0] {
      _type,
      isActive,
      heading,
      subheading,
      cardsPerRow,
      "cards": cards[] {
        title,
        englishTitle,
        mainPrice,
        priceLabel,
        "cardImage": cardImage {
          "url": asset->url,
          "alt": alt
        },
        "stylists": stylists[] {
          levelName,
          levelOrder,
          price,
          stylistName,
          "cardImage": cardImage {
            "url": asset->url,
            "alt": alt
          }
        },
        link
      }
    }`

    const result = await client.fetch(query)
    
    console.log('✅ 查詢成功！')
    console.log('📊 結果：', JSON.stringify(result, null, 2))
    
    if (result) {
      console.log('\n🎯 資料檢查：')
      console.log(`標題: ${result.heading}`)
      console.log(`副標題: ${result.subheading}`)
      console.log(`卡片數量: ${result.cards?.length}`)
      
      if (result.cards?.length > 0) {
        console.log('\n📋 服務項目：')
        result.cards.forEach((card, index) => {
          console.log(`${index + 1}. ${card.title} (${card.englishTitle}) - ${card.mainPrice}元${card.priceLabel}`)
          if (card.stylists?.length > 0) {
            console.log(`   設計師 (${card.stylists.length}位):`)
            card.stylists.forEach(stylist => {
              console.log(`   - ${stylist.stylistName} (${stylist.levelName}): ${stylist.price}元`)
            })
          }
        })
      }
    } else {
      console.log('❌ 沒有找到服務卡片資料')
    }
    
  } catch (error) {
    console.error('❌ 查詢失敗：', error)
  }
}

testServiceQuery()
