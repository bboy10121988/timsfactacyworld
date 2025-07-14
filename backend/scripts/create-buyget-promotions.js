const fetch = require('node-fetch');

async function createBuyGetPromotions() {
  const baseUrl = 'http://localhost:9000';
  
  console.log("🎁 開始創建買X送Y促銷活動...");

  try {
    // 首先獲取 admin token（簡化版，實際應該有正確的認證）
    // 對於測試目的，我們直接使用 API

    // 創建買X送Y促銷活動
    const buyGetPromotions = [
      {
        code: "BUY2_GET_COMB",
        type: "buyget",
        campaign_identifier: "buy-x-get-y",
        is_automatic: true,
        metadata: {
          promotion_type: "buy_x_get_y",
          buy_quantity: 2,
          get_quantity: 1,
          gift_item: "造型梳",
          gift_description: "買2送造型梳",
          description: "購買任意2件髮品即贈送專業造型梳"
        }
      },
      {
        code: "BUY1_GET_SAMPLE",
        type: "buyget", 
        campaign_identifier: "buy-x-get-y",
        is_automatic: true,
        metadata: {
          promotion_type: "buy_x_get_y",
          buy_quantity: 1,
          get_quantity: 1,
          gift_item: "試用包",
          gift_description: "買1送試用包",
          description: "購買任意髮品即贈送試用包"
        }
      },
      {
        code: "SPEND1000_GET_GIFT",
        type: "buyget",
        campaign_identifier: "buy-x-get-y", 
        is_automatic: true,
        metadata: {
          promotion_type: "buy_x_get_y",
          buy_amount: 1000,
          get_quantity: 1,
          gift_item: "精美髮帶",
          gift_description: "滿千送髮帶",
          description: "消費滿NT$1000即贈送精美髮帶"
        }
      }
    ];

    // 由於 Medusa v2 的促銷 API 可能不同，我們先將這些數據添加到產品的 metadata 中
    const productIds = [
      'prod_01JWFH49N3BGG4T5YNH582RN26', // 黃罐
      'prod_01JWFGZX3RDSS1JWZVZAQFJGR6', // 綠罐
      'prod_01JWFHF0RKVR8W8JWW3MJ2TZM5'  // 紅帽
    ];

    const giftMapping = {
      'prod_01JWFH49N3BGG4T5YNH582RN26': '造型梳',
      'prod_01JWFGZX3RDSS1JWZVZAQFJGR6': '試用包', 
      'prod_01JWFHF0RKVR8W8JWW3MJ2TZM5': '髮帶'
    };

    for (const productId of productIds) {
      try {
        console.log(`📝 為產品 ${productId} 添加買X送Y metadata...`);
        
        const buyXGetYData = {
          free_item: giftMapping[productId],
          buy_quantity: 2,
          get_quantity: 1,
          description: `買2送${giftMapping[productId]}`
        };

        // 這裡我們需要使用正確的 Medusa admin API 來更新產品
        // 暫時先記錄，實際更新需要正確的 admin 認證
        console.log(`✅ 準備為產品 ${productId} 添加買X送Y: ${JSON.stringify(buyXGetYData)}`);
        
      } catch (error) {
        console.error(`❌ 為產品 ${productId} 添加買X送Y失敗:`, error.message);
      }
    }

    console.log("🎉 買X送Y促銷活動準備完成！");
    console.log("💡 提示：請在 Medusa Admin 中手動為產品添加以下 metadata:");
    
    productIds.forEach(productId => {
      console.log(`\n產品 ID: ${productId}`);
      console.log(`metadata.buyXGetY: ${JSON.stringify({
        free_item: giftMapping[productId],
        buy_quantity: 2,
        get_quantity: 1,
        description: `買2送${giftMapping[productId]}`
      })}`);
    });

  } catch (error) {
    console.error("❌ 創建買X送Y促銷活動時發生錯誤:", error);
  }

  process.exit(0);
}

createBuyGetPromotions();
