const fetch = require('node-fetch');

async function addBuyGetMetadata() {
  const baseUrl = 'http://localhost:9000';
  const publishableKey = 'pk_6a5b6f62e29baea8089628c7713ce56a388c5944011f43fcf15b8837b00464b7';
  
  console.log("🎁 開始為產品添加買X送Y metadata...");

  const productUpdates = [
    {
      id: 'prod_01JWFH49N3BGG4T5YNH582RN26', // 黃罐
      metadata: {
        buyXGetY: JSON.stringify({
          free_item: "造型梳",
          buy_quantity: 2,
          get_quantity: 1,
          description: "買2送造型梳"
        })
      }
    },
    {
      id: 'prod_01JWFGZX3RDSS1JWZVZAQFJGR6', // 綠罐  
      metadata: {
        buyXGetY: JSON.stringify({
          free_item: "試用包",
          buy_quantity: 2,
          get_quantity: 1,
          description: "買2送試用包"
        })
      }
    },
    {
      id: 'prod_01JWFHF0RKVR8W8JWW3MJ2TZM5', // 紅帽
      metadata: {
        buyXGetY: JSON.stringify({
          free_item: "髮帶",
          buy_quantity: 2,
          get_quantity: 1,
          description: "買2送髮帶"
        })
      }
    }
  ];

  for (const update of productUpdates) {
    try {
      console.log(`📝 為產品 ${update.id} 添加買X送Y metadata...`);
      
      // 首先獲取產品當前信息
      const getResponse = await fetch(`${baseUrl}/store/products/${update.id}`, {
        headers: {
          'x-publishable-api-key': publishableKey,
        }
      });

      if (!getResponse.ok) {
        console.error(`❌ 無法獲取產品 ${update.id}:`, getResponse.status);
        continue;
      }

      const productData = await getResponse.json();
      const product = productData.product;
      
      console.log(`📋 產品 ${product.title} 當前 metadata:`, product.metadata);
      
      // 合併現有 metadata 和新的 buyXGetY
      const updatedMetadata = {
        ...product.metadata,
        ...update.metadata
      };

      console.log(`✅ 將為產品 ${product.title} 添加買X送Y: ${update.metadata.buyXGetY}`);
      
      // 注意：store API 通常是只讀的，更新產品需要 admin API
      // 這裡我們只是測試讀取，實際更新需要使用 admin API
      
    } catch (error) {
      console.error(`❌ 處理產品 ${update.id} 時發生錯誤:`, error.message);
    }
  }

  console.log("\n🔧 由於 store API 是只讀的，需要通過以下方式添加 metadata:");
  console.log("1. 使用 Medusa Admin Dashboard");
  console.log("2. 使用 Admin API (需要認證)");
  console.log("3. 直接在資料庫中添加");
  
  console.log("\n💡 暫時在前端代碼中模擬這些數據...");
  
  process.exit(0);
}

addBuyGetMetadata();
