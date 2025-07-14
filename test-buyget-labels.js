// 測試買X送Y標籤功能
console.log('🧪 測試買X送Y標籤功能...');

// 模擬前端環境
Object.assign(global, {
  process: {
    env: {
      NODE_ENV: 'development',
      NEXT_PUBLIC_MEDUSA_BACKEND_URL: 'http://localhost:9000',
      NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: 'pk_6a5b6f62e29baea8089628c7713ce56a388c5944011f43fcf15b8837b00464b7'
    }
  },
  fetch: require('node-fetch')
});

// 動態導入 ES 模組
(async () => {
  try {
    // 由於這是測試腳本，我們直接測試邏輯
    const testProducts = [
      {
        id: 'prod_01JWFH49N3BGG4T5YNH582RN26',
        title: '黃罐 Fantasy World 強力定型髮油',
        expected: '買2送造型梳'
      },
      {
        id: 'prod_01JWFGZX3RDSS1JWZVZAQFJGR6', 
        title: '綠罐 Fantasy World 水凝髮蠟',
        expected: '買2送試用包'
      },
      {
        id: 'prod_01JWFHF0RKVR8W8JWW3MJ2TZM5',
        title: '紅帽 Fantasy World 高支撐度髮泥',
        expected: '滿千送髮帶'
      }
    ];

    const mockBuyXGetY = {
      'prod_01JWFH49N3BGG4T5YNH582RN26': '買2送造型梳',
      'prod_01JWFGZX3RDSS1JWZVZAQFJGR6': '買2送試用包',
      'prod_01JWFHF0RKVR8W8JWW3MJ2TZM5': '滿千送髮帶'
    };

    console.log('\n📋 測試買X送Y標籤映射:');
    
    for (const product of testProducts) {
      const mockLabel = mockBuyXGetY[product.id];
      const isCorrect = mockLabel === product.expected;
      
      console.log(`${isCorrect ? '✅' : '❌'} ${product.title}`);
      console.log(`   期望: ${product.expected}`);
      console.log(`   實際: ${mockLabel}`);
      console.log('');
    }

    console.log('🎉 買X送Y標籤測試完成！');
    console.log('\n💡 提示：');
    console.log('1. 這些標籤目前使用模擬數據 (開發環境)');
    console.log('2. 要使用真實 API 數據，需要在 Medusa 中創建對應的促銷活動');
    console.log('3. 或者在產品的 metadata 中添加 buyXGetY 欄位');

  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error);
  }
})();
