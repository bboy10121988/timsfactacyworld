// const fetch = require('node-fetch'); // 移除，使用 curl 替代

async function createGreenCanBuyGetPromotion() {
  console.log("🌱 專門為綠罐產品創建買X送Y促銷...");

  const baseUrl = 'http://localhost:9000';
  const greenCanProductId = 'prod_01JWFGZX3RDSS1JWZVZAQFJGR6';
  
  try {
    // 1. 首先檢查綠罐產品是否存在（使用 exec 調用 curl）
    console.log("📦 檢查綠罐產品...");
    
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
      const { stdout } = await execAsync(`curl -s "${baseUrl}/store/products/${greenCanProductId}"`);
      const productData = JSON.parse(stdout);
      
      if (productData.product) {
        console.log("✅ 找到綠罐產品:", productData.product.title);
      } else {
        console.log("⚠️  無法驗證產品，但繼續配置過程...");
      }
    } catch (error) {
      console.log("⚠️  無法檢查產品（API 可能未啟動），但繼續配置過程...");
    }

    // 2. 為綠罐設計買X送Y促銷方案
    const buyXGetYConfig = {
      type: "buy_x_get_y",
      buy_quantity: 1,
      get_quantity: 1, 
      free_item: "綠罐專屬試用包",
      free_item_description: "包含迷你版綠罐髮蠟 + 造型梳",
      description: "買1送試用包",
      detailed_description: "購買綠罐 Fantasy World 水凝髮蠟即贈送專屬試用包",
      promotion_text: "買就送！",
      valid_until: "2024-12-31",
      auto_apply: true
    };

    console.log("🎁 綠罐買X送Y配置:");
    console.log(JSON.stringify(buyXGetYConfig, null, 2));

    // 3. 模擬在產品 metadata 中添加買X送Y信息
    console.log("\n📝 需要在 Medusa Admin 中為綠罐產品添加以下 metadata:");
    console.log("Key: buyXGetY");
    console.log("Value:", JSON.stringify(buyXGetYConfig));

    // 4. 創建測試用的促銷活動數據
    const promotionData = {
      code: "GREEN_CAN_BUYGET_2024",
      type: "buyget",
      campaign_identifier: "green-can-special",
      is_automatic: true,
      starts_at: new Date().toISOString(),
      ends_at: "2024-12-31T23:59:59.999Z",
      metadata: {
        ...buyXGetYConfig,
        target_product_id: greenCanProductId,
        target_product_title: "綠罐 Fantasy World 水凝髮蠟"
      }
    };

    console.log("\n🎯 綠罐專屬促銷活動數據:");
    console.log(JSON.stringify(promotionData, null, 2));

    // 5. 生成前端測試代碼片段
    console.log("\n💻 前端測試代碼片段:");
    console.log(`
// 在 simple-promotion-utils.ts 中測試綠罐買X送Y
const testGreenCanProduct = {
  id: '${greenCanProductId}',
  title: '綠罐 Fantasy World 水凝髮蠟',
  metadata: {
    buyXGetY: '${JSON.stringify(buyXGetYConfig).replace(/"/g, '\\"')}'
  }
};

// 測試獲取買X送Y標籤
const labels = getProductPromotionLabels(testGreenCanProduct);
console.log('綠罐促銷標籤:', labels);
    `);

    // 6. 生成添加到購物車的測試指令
    console.log("\n🛒 購物車測試指令:");
    console.log(`
// 將綠罐添加到購物車
const cartItemData = {
  variant_id: 'variant_01JWFGZX3RDSS1JWZVZAQFJGR7',
  quantity: 1
};

// 應該觸發買X送Y促銷
    `);

    // 7. 檢查是否有現有的綠罐促銷（移除 fetch 調用）
    console.log("\n🔍 檢查現有促銷活動...");
    console.log("💡 手動檢查指令: curl -s 'http://localhost:9000/admin/promotions'");

    console.log("\n✅ 綠罐買X送Y促銷配置完成！");
    console.log("📋 下一步:");
    console.log("1. 在 Medusa Admin 中為綠罐產品添加上述 metadata");
    console.log("2. 運行前端測試腳本驗證標籤顯示");
    console.log("3. 測試將綠罐添加到購物車的促銷觸發");

  } catch (error) {
    console.error("❌ 創建綠罐買X送Y促銷時發生錯誤:", error);
    console.error("錯誤詳情:", error.message);
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  createGreenCanBuyGetPromotion()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { createGreenCanBuyGetPromotion };
