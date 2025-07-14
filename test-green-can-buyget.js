const { getActivePromotionLabels } = require('./frontend/src/lib/simple-promotion-utils.ts');

async function testGreenCanBuyXGetY() {
  console.log("🧪 測試綠罐產品的買X送Y標籤...");

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
        id: 'variant_01JWFGZX3RDSS1JWZVZAQFJGR7',
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
  };

  console.log("📦 測試產品:", greenCanProduct.title);
  console.log("🎁 預期買X送Y:", "買1送綠罐專屬試用包");
  console.log("📋 促銷詳情:", "包含迷你版綠罐髮蠟 + 造型梳");

  try {
    // 測試獲取促銷標籤
    const labels = await getActivePromotionLabels(greenCanProduct, 'reg_01JW1S1F7GB4ZP322G2DMETETH');
    
    console.log("\n📋 獲取到的所有標籤:");
    labels.forEach((label, index) => {
      console.log(`  ${index + 1}. [${label.type}] ${label.text}`);
    });

    // 檢查是否有買X送Y標籤
    const buyXGetYLabels = labels.filter(label => label.type === 'buy-x-get-y');
    
    console.log(`\n🎯 買X送Y標籤數量: ${buyXGetYLabels.length}`);
    
    if (buyXGetYLabels.length > 0) {
      console.log("✅ 成功找到買X送Y標籤:");
      buyXGetYLabels.forEach((label, index) => {
        console.log(`   ${index + 1}. ${label.text}`);
        console.log(`      類型: ${label.type}`);
        console.log(`      優先級: ${label.priority}`);
        console.log(`      樣式: ${label.className?.includes('max-w-fit') ? '✅ 已優化寬度' : '❌ 需要優化寬度'}`);
      });
    } else {
      console.log("❌ 未找到買X送Y標籤");
      console.log("🔍 可能的原因:");
      console.log("   1. metadata.buyXGetY 格式不正確");
      console.log("   2. 購物車創建或商品添加失敗");
      console.log("   3. 促銷邏輯處理有問題");
    }

    // 檢查其他類型的標籤
    const otherLabels = labels.filter(label => label.type !== 'buy-x-get-y');
    if (otherLabels.length > 0) {
      console.log(`\n📄 其他標籤 (${otherLabels.length}個):`);
      otherLabels.forEach((label, index) => {
        console.log(`   ${index + 1}. [${label.type}] ${label.text}`);
      });
    }

  } catch (error) {
    console.error("❌ 測試過程中發生錯誤:", error);
    console.error("錯誤詳情:", error.message);
  }

  console.log("\n🎉 綠罐買X送Y測試完成！");
}

// 如果直接運行此腳本
if (require.main === module) {
  testGreenCanBuyXGetY().catch(console.error);
}

module.exports = { testGreenCanBuyXGetY };
