import { createClient } from "@sanity/client"

const client = createClient({
  projectId: "m7o2mv1n",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true,
  token: "skxPHbtETeuof6qw2oYMoST8kD2UCmM1UTWEjAqw03YETyws2ZhLtUlUGoPieCQQ9Y4SkaoLWXHZ8mOs34ZUmqFMPnr7tnoqY1HuLVnMTwZ0SVhDV2mOuk336ICH1h7JuzUnEyyYOiJljwvERUlw7GEelitairKw8gRMHs8HABPpZZT1TWzZ"
})

async function testFooter() {
  try {
    console.log("測試 Footer 資料...")
    
    const query = `*[_type == "footer" && !(_id in path('drafts.**'))] | order(_updatedAt desc)[0] {
      title,
      logo {
        "url": asset->url,
        alt
      },
      sections[] {
        title,
        links[] {
          text,
          url
        }
      },
      contactInfo {
        phone,
        email
      },
      socialMedia {
        facebook {
          enabled,
          url
        },
        instagram {
          enabled,
          url
        },
        line {
          enabled,
          url
        },
        youtube {
          enabled,
          url
        },
        twitter {
          enabled,
          url
        }
      },
      copyright
    }`
    
    const footer = await client.fetch(query)
    
    if (footer) {
      console.log("✅ Footer 資料找到:")
      console.log("標題:", footer.title)
      console.log("Logo URL:", footer.logo?.url)
      console.log("自訂區域數量:", footer.sections?.length || 0)
      console.log("版權資訊:", footer.copyright)
      console.log("社群媒體設定:", JSON.stringify(footer.socialMedia, null, 2))
    } else {
      console.log("❌ 找不到 Footer 資料")
    }
    
  } catch (error) {
    console.error("❌ 測試失敗:", error.message)
  }
}

testFooter()
