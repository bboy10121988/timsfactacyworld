// 綠罐買X送Y測試 - JavaScript 版本
async function testGreenCanBuyXGetY() {
  console.log("🧪 測試綠罐產品的買X送Y標籤...")

  // 綠罐產品數據 - 專門配置買X送Y促銷
  const greenCanProduct = {
    id: 'prod_01JWFGZX3RDSS1JWZVZAQFJGR6',
    title: '綠罐 Fantasy World 水凝髮蠟',
    subtitle: '全新改版熱銷中！水凝質地，自然光澤感',
    metadata: {
      // 綠罐專屬買X送Y配置
      buyXGetY: JSON.stringify({
        type: "buy_x_get_y",
        buy_quantity: 1,
        get_quantity: 1,
        free_item: "綠罐專屬試用包",
        free_item_description: "包含迷你版綠罐髮蠟 + 造型梳",
        description: "買1送試用包",
        detailed_description: "購買綠罐 Fantasy World 水凝髮蠟即贈送專屬試用包",
        promotion_text: "買就送！",
        auto_apply: true
      })
    },
    variants: [
      {
        id: 'variant_01JXWCAMPWST2KWW17GZD5MVSF', // 修正正確的變體ID
        title: '綠罐 Fantasy World 水凝髮蠟',
        calculated_price: {
          calculated_amount: 600,
          currency_code: 'twd'
        },
        inventory_quantity: 10
      }
    ],
    tags: [],
    collection: {
      id: 'pcol_01JW2M94MFFNSDJDY6T8ZB8CGD',
      title: '精選商品'
    }
  }

  console.log("📦 測試產品:", greenCanProduct.title)
  console.log("🎁 預期買X送Y:", "買1送綠罐專屬試用包")
  console.log("📋 促銷詳情:", "包含迷你版綠罐髮蠟 + 造型梳")

  try {
    // 直接在這裡實現買X送Y檢查邏輯
    const labels = []
    
    console.log("\n🔍 開始檢查 metadata...")
    
    if (greenCanProduct.metadata && greenCanProduct.metadata.buyXGetY) {
      console.log("✅ 找到 buyXGetY metadata")
      
      try {
        const buyXGetYData = typeof greenCanProduct.metadata.buyXGetY === 'string' 
          ? JSON.parse(greenCanProduct.metadata.buyXGetY)
          : greenCanProduct.metadata.buyXGetY

        console.log("📄 buyXGetY 數據:", JSON.stringify(buyXGetYData, null, 2))

        if (buyXGetYData && typeof buyXGetYData === 'object') {
          const freeItem = buyXGetYData.free_item || buyXGetYData.get_item || '贈品'
          const promotionText = buyXGetYData.promotion_text || `送${freeItem}`
          
          labels.push({
            type: 'buy-x-get-y',
            text: promotionText,
            priority: 6,
            className: 'inline-block bg-stone-800/90 text-white px-2 py-1 shadow-sm text-xs font-medium tracking-widest uppercase whitespace-nowrap w-auto max-w-fit',
            isDiscount: false,
            detail: buyXGetYData
          })
          
          console.log("✅ 成功添加買X送Y標籤:", promotionText)
        } else {
          console.log("❌ buyXGetY 數據格式不正確")
        }
      } catch (parseError) {
        console.error("❌ buyXGetY JSON 解析失敗:", parseError.message)
      }
    } else {
      console.log("❌ 未找到 buyXGetY metadata")
    }

    console.log(`\n📋 獲取到的所有標籤:`)
    labels.forEach((label, index) => {
      console.log(`  ${index + 1}. [${label.type}] ${label.text}`)
    })

    // 檢查是否有買X送Y標籤
    const buyXGetYLabels = labels.filter(label => label.type === 'buy-x-get-y')
    
    console.log(`\n🎯 買X送Y標籤數量: ${buyXGetYLabels.length}`)
    
    if (buyXGetYLabels.length > 0) {
      console.log("✅ 成功找到買X送Y標籤:")
      buyXGetYLabels.forEach((label, index) => {
        console.log(`   ${index + 1}. ${label.text}`)
        console.log(`      類型: ${label.type}`)
        console.log(`      優先級: ${label.priority}`)
        console.log(`      樣式: ${label.className?.includes('max-w-fit') ? '✅ 已優化寬度' : '❌ 需要優化寬度'}`)
        if (label.detail) {
          console.log(`      詳情: 買${label.detail.buy_quantity}送${label.detail.get_quantity} - ${label.detail.free_item}`)
        }
      })
    } else {
      console.log("❌ 未找到買X送Y標籤")
      console.log("🔍 可能的原因:")
      console.log("   1. metadata.buyXGetY 格式不正確")
      console.log("   2. JSON 解析失敗")
      console.log("   3. 標籤生成邏輯有問題")
    }

  } catch (error) {
    console.error("❌ 測試過程中發生錯誤:", error)
    console.error("錯誤詳情:", error.message)
  }

  console.log("\n🎉 綠罐買X送Y測試完成！")
}

// 模擬真實 API 測試
async function testWithRealAPI() {
  console.log("\n🌐 測試真實 API 調用...")
  
  const baseUrl = 'http://localhost:9000'
  const publishableKey = 'pk_6a5b6f62e29baea8089628c7713ce56a388c5944011f43fcf15b8837b00464b7'
  const regionId = 'reg_01JW1S1F7GB4ZP322G2DMETETH'
  const greenCanVariantId = 'variant_01JXWCAMPWST2KWW17GZD5MVSF' // 修正正確的變體ID

  try {
    // 1. 創建購物車
    console.log("🛒 創建測試購物車...")
    const { exec } = require('child_process')
    const { promisify } = require('util')
    const execAsync = promisify(exec)

    const createCartCommand = `curl -s -X POST "${baseUrl}/store/carts" \\
      -H "Content-Type: application/json" \\
      -H "x-publishable-api-key: ${publishableKey}" \\
      -d '{"region_id": "${regionId}"}'`

    const { stdout: cartResponse } = await execAsync(createCartCommand)
    const cartData = JSON.parse(cartResponse)
    
    if (cartData.cart) {
      const cartId = cartData.cart.id
      console.log("✅ 購物車創建成功:", cartId)

      // 2. 添加綠罐到購物車
      console.log("📦 添加綠罐到購物車...")
      const addItemCommand = `curl -s -X POST "${baseUrl}/store/carts/${cartId}/line-items" \\
        -H "Content-Type: application/json" \\
        -H "x-publishable-api-key: ${publishableKey}" \\
        -d '{"variant_id": "${greenCanVariantId}", "quantity": 1}'`

      const { stdout: addItemResponse } = await execAsync(addItemCommand)
      const cartWithItem = JSON.parse(addItemResponse)
      
      if (cartWithItem.cart) {
        console.log("✅ 綠罐已添加到購物車")
        
        const cart = cartWithItem.cart
        const promotions = cart.promotions || []
        
        console.log(`🎯 購物車促銷活動數量: ${promotions.length}`)
        
        if (promotions.length > 0) {
          console.log("📋 找到的促銷活動:")
          promotions.forEach((promotion, index) => {
            console.log(`   ${index + 1}. ${promotion.code || '無代碼'}: ${promotion.campaign_identifier || '無標識'}`)
          })
        } else {
          console.log("💡 購物車中沒有觸發促銷活動")
          console.log("🔍 這可能是正常的，因為買X送Y需要在產品 metadata 或真實促銷活動中配置")
        }

        // 3. 清理購物車
        const deleteCommand = `curl -s -X DELETE "${baseUrl}/store/carts/${cartId}" \\
          -H "x-publishable-api-key: ${publishableKey}"`
        
        await execAsync(deleteCommand)
        console.log("🗑️ 測試購物車已清理")
        
      } else {
        console.log("❌ 添加商品到購物車失敗")
      }
    } else {
      console.log("❌ 創建購物車失敗")
    }

  } catch (error) {
    console.error("❌ API 測試失敗:", error.message)
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  testGreenCanBuyXGetY()
    .then(() => testWithRealAPI())
    .catch(console.error)
}

module.exports = { testGreenCanBuyXGetY }
